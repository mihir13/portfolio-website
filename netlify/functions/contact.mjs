// Receives the contact form, checks the Cloudflare Turnstile token, then sends the
// message through EmailJS from the server. Keys live in Netlify environment variables.
//
// Required env vars:
//   TURNSTILE_SECRET_KEY   Turnstile secret key (Cloudflare dashboard > Turnstile)
//   EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY
// Optional:
//   CONTACT_TO             value passed to the template's to_name parameter

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (req) => {
  if (req.method !== "POST") return json(405, { ok: false, error: "method" });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: "bad_request" });
  }

  // Honeypot: pretend success so bots learn nothing.
  if (body.website) return json(200, { ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message, 5000);
  const token = clean(body.token, 4096);
  if (!name || !message || !EMAIL.test(email)) return json(400, { ok: false, error: "invalid" });
  if (!token) return json(400, { ok: false, error: "captcha" });

  const env = process.env;
  const missing = [
    "TURNSTILE_SECRET_KEY",
    "EMAILJS_SERVICE_ID",
    "EMAILJS_TEMPLATE_ID",
    "EMAILJS_PUBLIC_KEY",
    "EMAILJS_PRIVATE_KEY",
  ].filter((k) => !env[k]);
  if (missing.length) {
    console.error("contact: missing env vars:", missing.join(", "));
    return json(500, { ok: false, error: "not_configured" });
  }

  // 1. Verify the Turnstile token with Cloudflare.
  const verify = new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token });
  const ip = req.headers.get("x-nf-client-connection-ip") || req.headers.get("cf-connecting-ip");
  if (ip) verify.set("remoteip", ip);
  let check;
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: verify });
    check = await r.json();
  } catch (err) {
    console.error("contact: turnstile verify failed", err);
    return json(502, { ok: false, error: "verify_unavailable" });
  }
  if (!check.success) return json(400, { ok: false, error: "captcha" });

  // 2. Send through EmailJS (server-to-server).
  try {
    const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: env.EMAILJS_SERVICE_ID,
        template_id: env.EMAILJS_TEMPLATE_ID,
        user_id: env.EMAILJS_PUBLIC_KEY,
        accessToken: env.EMAILJS_PRIVATE_KEY,
        template_params: {
          from_name: email,
          user_name: name,
          to_name: env.CONTACT_TO || "",
          message,
        },
      }),
    });
    if (!r.ok) {
      console.error("contact: emailjs rejected the request:", r.status, await r.text());
      return json(502, { ok: false, error: "send_failed" });
    }
  } catch (err) {
    console.error("contact: emailjs request failed", err);
    return json(502, { ok: false, error: "send_failed" });
  }

  return json(200, { ok: true });
};
