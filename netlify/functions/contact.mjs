// Receives the contact form, checks the Cloudflare Turnstile token, then emails the message
// to you through Resend (https://resend.com). Keys live in Netlify environment variables.
//
// Required env vars:
//   TURNSTILE_SECRET_KEY   Turnstile secret key (Cloudflare dashboard > Turnstile)
//   RESEND_API_KEY         Resend API key (starts with re_)
//   CONTACT_TO_EMAIL       where messages are delivered
// Optional:
//   CONTACT_FROM           the From address, e.g. "Portfolio <contact@yourdomain.com>".
//                          Defaults to Resend's test sender, which can only deliver to the
//                          email address of your own Resend account.

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const oneLine = (v) => v.replace(/[\r\n]+/g, " ");
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

  const name = oneLine(clean(body.name, 120));
  const email = clean(body.email, 200);
  const message = clean(body.message, 5000);
  const token = clean(body.token, 4096);
  if (!name || !message || !EMAIL.test(email)) return json(400, { ok: false, error: "invalid" });
  if (!token) return json(400, { ok: false, error: "captcha" });

  const env = process.env;
  const missing = ["TURNSTILE_SECRET_KEY", "RESEND_API_KEY", "CONTACT_TO_EMAIL"].filter((k) => !env[k]);
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

  // 2. Email it to you. Plain text only, and "reply_to" is the visitor, so replying works.
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: env.CONTACT_FROM || "Portfolio contact <onboarding@resend.dev>",
        to: [env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `Portfolio message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}\n`,
      }),
    });
    if (!r.ok) {
      console.error("contact: resend rejected the request:", r.status, await r.text());
      return json(502, { ok: false, error: "send_failed" });
    }
  } catch (err) {
    console.error("contact: resend request failed", err);
    return json(502, { ok: false, error: "send_failed" });
  }

  return json(200, { ok: true });
};
