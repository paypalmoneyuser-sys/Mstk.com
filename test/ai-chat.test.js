import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const limiter = { async limit() { return { success: true }; } };
const userId = "123e4567-e89b-42d3-a456-426614174000";
const enc = new TextEncoder();
const b64 = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");

async function session(name) {
  const project = `https://${name}.supabase.co`;
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  Object.assign(jwk, { kid: name, alg: "ES256", use: "sig" });
  const now = Math.floor(Date.now() / 1000);
  const h = b64({ alg: "ES256", typ: "JWT", kid: name });
  const p = b64({ iss: project + "/auth/v1", aud: "authenticated", role: "authenticated", sub: userId, iat: now, exp: now + 300 });
  const input = h + "." + p;
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, pair.privateKey, enc.encode(input));
  return { project, jwks: project + "/auth/v1/.well-known/jwks.json", jwk, token: input + "." + Buffer.from(sig).toString("base64url") };
}

async function invoke(name, prompt, options = {}) {
  const s = await session(name);
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    if (String(url) === s.jwks) return new Response(JSON.stringify({ keys: [s.jwk] }), { status: 200 });
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify(options.body ?? { choices: [{ message: { content: "Mock provider answer" } }] }), { status: options.status ?? 200 });
  };
  try {
    const body = JSON.stringify({ prompt });
    const response = await worker.fetch(new Request("https://api.example/api/ai/chat", {
      method: "POST",
      headers: { authorization: "Bearer " + s.token, "content-type": "application/json", "content-length": String(Buffer.byteLength(body)), Origin: "https://mstk.example" },
      body,
    }), {
      MSTK_RATE_LIMITER: limiter, ALLOWED_ORIGIN: "https://mstk.example", SUPABASE_URL: s.project, MSTK_AI_ENABLED: options.enabled ?? "true",
      MSTK_AI_CHAT_COMPLETIONS_URL: options.url ?? "https://provider.example/v1/chat/completions",
      MSTK_AI_API_KEY: "test-only-secret", MSTK_AI_MODEL: "mock-model",
    });
    return { response, calls };
  } finally { globalThis.fetch = original; }
}

test("AI chat is disabled by default", async () => {
  const { response, calls } = await invoke("mstk-ai-disabled-test", "Hello", { enabled: "false" });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "ai_provider_not_enabled" });
  assert.equal(calls.length, 0);
});

test("AI chat calls configured provider and returns its answer", async () => {
  const { response, calls } = await invoke("mstk-ai-success-test", "Explain photosynthesis");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://mstk.example");
  assert.deepEqual(await response.json(), { answer: "Mock provider answer", model: "mock-model" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://provider.example/v1/chat/completions");
  assert.equal(calls[0].init.headers.authorization, "Bearer test-only-secret");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    model: "mock-model", messages: [{ role: "user", content: "Explain photosynthesis" }], max_tokens: 1024,
  });
});

test("AI chat rejects blank prompts without calling provider", async () => {
  const { response, calls } = await invoke("mstk-ai-blank-test", "   ");
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "invalid_prompt" });
  assert.equal(calls.length, 0);
});

test("AI chat rejects non-HTTPS provider URL", async () => {
  const { response, calls } = await invoke("mstk-ai-url-test", "Hello", { url: "http://provider.example/v1/chat/completions" });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "ai_provider_configuration_invalid" });
  assert.equal(calls.length, 0);
});

test("AI chat hides upstream provider errors", async () => {
  const { response } = await invoke("mstk-ai-error-test", "Hello", { status: 429, body: { error: "private upstream detail" } });
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "ai_provider_request_failed" });
});
