import test from "node:test";
import assert from "node:assert/strict";
import handler from "../netlify/functions/contact.mjs";

const ENV = {
  TURNSTILE_SECRET_KEY: "s", EMAILJS_SERVICE_ID: "svc", EMAILJS_TEMPLATE_ID: "tpl",
  EMAILJS_PUBLIC_KEY: "pub", EMAILJS_PRIVATE_KEY: "priv", CONTACT_TO: "me",
};
const good = { name: "Ada", email: "ada@example.com", message: "Hello there", token: "tok" };
const post = (body, method = "POST") =>
  new Request("https://x.test/.netlify/functions/contact", {
    method, headers: { "content-type": "application/json" }, body: method === "POST" ? JSON.stringify(body) : undefined,
  });

function run(body, { turnstile = { success: true }, emailOk = true, env = ENV, method } = {}) {
  const calls = [];
  const realFetch = globalThis.fetch;
  Object.assign(process.env, env);
  for (const k of Object.keys(ENV)) if (!(k in env)) delete process.env[k];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("turnstile")) return new Response(JSON.stringify(turnstile));
    return new Response(emailOk ? "OK" : "bad", { status: emailOk ? 200 : 400 });
  };
  return handler(post(body, method)).then(async (res) => ({ res, calls, json: await res.json() }))
    .finally(() => { globalThis.fetch = realFetch; });
}

test("sends mail after a valid Turnstile check", async () => {
  const { res, calls, json } = await run(good);
  assert.equal(res.status, 200); assert.equal(json.ok, true);
  assert.equal(calls.length, 2);
  const sent = JSON.parse(calls[1].init.body);
  assert.equal(sent.accessToken, "priv"); assert.equal(sent.template_params.user_name, "Ada");
  assert.equal(sent.template_params.from_name, "ada@example.com");
  assert.match(String(calls[0].init.body), /secret=s/); assert.match(String(calls[0].init.body), /response=tok/);
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
  assert.equal(res.status, 500); assert.equal(json.error, "not_configured");
});
test("surfaces an EmailJS failure as 502", async () => {
  const { res, json } = await run(good, { emailOk: false });
  assert.equal(res.status, 502); assert.equal(json.error, "send_failed");
});
test("only accepts POST", async () => {
  const { res } = await run(good, { method: "GET" }); assert.equal(res.status, 405);
});
test("trims over-long fields", async () => {
  const { calls } = await run({ ...good, message: "x".repeat(9000) });
  assert.equal(JSON.parse(calls[1].init.body).template_params.message.length, 5000);
});
