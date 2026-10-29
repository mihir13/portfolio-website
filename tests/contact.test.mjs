import test from "node:test";
import assert from "node:assert/strict";
import handler from "../netlify/functions/contact.mjs";

const ENV = { TURNSTILE_SECRET_KEY: "s", RESEND_API_KEY: "re_test", CONTACT_TO_EMAIL: "me@example.com" };
const good = { name: "Ada", email: "ada@example.com", message: "Hello there", token: "tok" };
const post = (body, method = "POST") =>
  new Request("https://x.test/.netlify/functions/contact", {
    method, headers: { "content-type": "application/json" }, body: method === "POST" ? JSON.stringify(body) : undefined,
  });

function run(body, { turnstile = { success: true }, resendOk = true, env = ENV, method } = {}) {
  const calls = [];
  const realFetch = globalThis.fetch;
  for (const k of ["TURNSTILE_SECRET_KEY", "RESEND_API_KEY", "CONTACT_TO_EMAIL", "CONTACT_FROM"]) delete process.env[k];
  Object.assign(process.env, env);
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("turnstile")) return new Response(JSON.stringify(turnstile));
    return resendOk ? new Response(JSON.stringify({ id: "abc" })) : new Response("nope", { status: 422 });
  };
  return handler(post(body, method)).then(async (res) => ({ res, calls, json: await res.json() }))
    .finally(() => { globalThis.fetch = realFetch; });
}

test("emails you after a valid Turnstile check", async () => {
  const { res, calls, json } = await run(good);
  assert.equal(res.status, 200); assert.equal(json.ok, true); assert.equal(calls.length, 2);
  assert.match(String(calls[0].init.body), /secret=s/); assert.match(String(calls[0].init.body), /response=tok/);
  assert.equal(calls[1].url, "https://api.resend.com/emails");
  assert.equal(calls[1].init.headers.Authorization, "Bearer re_test");
  const mail = JSON.parse(calls[1].init.body);
  assert.deepEqual(mail.to, ["me@example.com"]);
  assert.equal(mail.reply_to, "ada@example.com");
  assert.equal(mail.from, "Portfolio contact <onboarding@resend.dev>");
  assert.equal(mail.subject, "Portfolio message from Ada");
  assert.equal(mail.text, "Name: Ada\nEmail: ada@example.com\n\nHello there\n");
  assert.equal("html" in mail, false);
});
test("uses CONTACT_FROM when set", async () => {
  const { calls } = await run(good, { env: { ...ENV, CONTACT_FROM: "Me <hi@mihirthakker.com>" } });
  assert.equal(JSON.parse(calls[1].init.body).from, "Me <hi@mihirthakker.com>");
});
test("rejects a failed Turnstile check and sends nothing", async () => {
  const { res, calls, json } = await run(good, { turnstile: { success: false } });
  assert.equal(res.status, 400); assert.equal(json.error, "captcha"); assert.equal(calls.length, 1);
});
test("rejects a missing token without calling anything", async () => {
  const { res, calls } = await run({ ...good, token: "" });
  assert.equal(res.status, 400); assert.equal(calls.length, 0);
});
test("rejects invalid input", async () => {
  for (const bad of [{ ...good, email: "nope" }, { ...good, name: " " }, { ...good, message: "" }]) {
    const { res, calls } = await run(bad); assert.equal(res.status, 400); assert.equal(calls.length, 0);
  }
});
test("honeypot gets a fake success and sends nothing", async () => {
  const { res, calls, json } = await run({ ...good, website: "http://spam" });
  assert.equal(res.status, 200); assert.equal(json.ok, true); assert.equal(calls.length, 0);
});
test("reports a configuration problem without leaking which keys", async () => {
  const { res, json } = await run(good, { env: { TURNSTILE_SECRET_KEY: "s" } });
  assert.equal(res.status, 500); assert.equal(json.error, "not_configured"); assert.equal(JSON.stringify(json).includes("RESEND"), false);
});
test("surfaces a Resend failure as 502", async () => {
  const { res, json } = await run(good, { resendOk: false });
  assert.equal(res.status, 502); assert.equal(json.error, "send_failed");
});
test("a network failure to Resend is a 502, not a crash", async () => {
  const realFetch = globalThis.fetch; Object.assign(process.env, ENV);
  globalThis.fetch = async (u) => { if (String(u).includes("turnstile")) return new Response(JSON.stringify({ success: true })); throw new Error("offline"); };
  try { const res = await handler(post(good)); assert.equal(res.status, 502); } finally { globalThis.fetch = realFetch; }
});
test("only accepts POST", async () => {
  const { res } = await run(good, { method: "GET" }); assert.equal(res.status, 405);
});
test("trims over-long fields", async () => {
  const { calls } = await run({ ...good, message: "x".repeat(9000) });
  assert.equal(JSON.parse(calls[1].init.body).text.split("\n\n")[1].trimEnd().length, 5000);
});
test("a name with line breaks cannot inject extra subject lines", async () => {
  const { calls } = await run({ ...good, name: "Eve\r\nBcc: attacker@example.com" });
  const mail = JSON.parse(calls[1].init.body);
  assert.equal(/[\r\n]/.test(mail.subject), false);
  assert.equal(Object.keys(mail).includes("bcc"), false);
});
