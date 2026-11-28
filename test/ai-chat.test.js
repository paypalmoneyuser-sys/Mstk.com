import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const limiter = { async limit() { return { success: true }; } };
const userId = "123e4567-e89b-42d3-a456-426614174000";
const workspaceId = "223e4567-e89b-42d3-a456-426614174000";
const conversationId = "323e4567-e89b-42d3-a456-426614174000";
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
  const saved = [];
  const history = options.history ?? [{ role: "user", content: prompt, created_at: "2026-01-01T00:00:00Z" }];
  globalThis.fetch = async (url, init = {}) => {
    const target = String(url);
    if (target === s.jwks) return new Response(JSON.stringify({ keys: [s.jwk] }), { status: 200 });
    if (target.includes("/rest/v1/workspace_members?")) {
      calls.push({ url: target, init, kind: "membership" });
      return new Response(JSON.stringify(options.membership === false ? [] : [{ workspace_id: workspaceId }]), { status: 200 });
    }
    if (target.includes("/rest/v1/conversations?")) {
      calls.push({ url: target, init, kind: "conversation" });
      return new Response(JSON.stringify(options.conversation === false ? [] : [{ id: conversationId, workspace_id: workspaceId }]), { status: 200 });
    }
    if (target.includes("/rest/v1/messages?") && init.method === "POST") {
      calls.push({ url: target, init, kind: "save" });
      if (options.saveFails) return new Response("database unavailable", { status: 500 });
      saved.push(JSON.parse(init.body));
      return new Response(null, { status: 204 });
    }
    if (target.includes("/rest/v1/messages?")) {
      calls.push({ url: target, init, kind: "history" });
      return new Response(JSON.stringify(history), { status: 200 });
    }
    calls.push({ url: target, init, kind: "provider" });
    return new Response(JSON.stringify(options.body ?? { choices: [{ message: { content: "Mock provider answer" } }] }), { status: options.status ?? 200 });
  };
  try {
    const body = JSON.stringify({ prompt, workspaceId, conversationId });
    const response = await worker.fetch(new Request("https://api.example/api/ai/chat", {
      method: "POST",
      headers: { authorization: "Bearer " + s.token, "content-type": "application/json", "content-length": String(Buffer.byteLength(body)), Origin: "https://mstk.example" },
      body,
    }), {
      MSTK_RATE_LIMITER: limiter, ALLOWED_ORIGIN: "https://mstk.example", SUPABASE_URL: s.project, SUPABASE_SERVICE_ROLE_KEY: "test-only-service-role", MSTK_AI_ENABLED: options.enabled ?? "true",
      MSTK_AI_CHAT_COMPLETIONS_URL: options.url ?? "https://provider.example/v1/chat/completions",
      MSTK_AI_API_KEY: "test-only-secret", MSTK_AI_MODEL: "mock-model",
    });
    return { response, calls, saved };
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
  assert.deepEqual(await response.json(), { answer: "Mock provider answer", model: "mock-model", saved: true });
  const provider = calls.find((call) => call.kind === "provider");
  assert.ok(provider);
  assert.equal(provider.url, "https://provider.example/v1/chat/completions");
  assert.equal(provider.init.headers.authorization, "Bearer test-only-secret");
  assert.deepEqual(JSON.parse(provider.init.body), {
    model: "mock-model", messages: [{ role: "user", content: "Explain photosynthesis" }], max_tokens: 1024,
  });
  const save = calls.find((call) => call.kind === "save");
  assert.ok(save);
  assert.equal(save.init.headers.authorization, "Bearer test-only-service-role");
  assert.deepEqual(JSON.parse(save.init.body), {
    conversation_id: conversationId, workspace_id: workspaceId, created_by: userId,
    role: "assistant", content: "Mock provider answer",
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

test("AI chat rejects a user who is not a workspace member", async () => {
  const { response, calls } = await invoke("mstk-ai-nonmember-test", "Hello", { membership: false });
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "workspace_access_denied" });
  assert.equal(calls.some((call) => call.kind === "provider"), false);
});

test("AI chat rejects a conversation outside the requested workspace", async () => {
  const { response, calls } = await invoke("mstk-ai-cross-workspace-test", "Hello", { conversation: false });
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "conversation_not_found" });
  assert.equal(calls.some((call) => call.kind === "provider"), false);
});

test("AI chat refuses to run without the latest user message already saved", async () => {
  const { response, calls } = await invoke("mstk-ai-unsaved-message-test", "Hello", { history: [] });
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), { error: "latest_user_message_missing" });
  assert.equal(calls.some((call) => call.kind === "provider"), false);
});

test("AI chat returns no success if assistant message persistence fails", async () => {
  const { response, calls } = await invoke("mstk-ai-save-failure-test", "Hello", { saveFails: true });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "ai_response_not_saved" });
  assert.ok(calls.some((call) => call.kind === "save"));
});
