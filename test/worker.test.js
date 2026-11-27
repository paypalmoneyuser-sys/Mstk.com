import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const allowedLimiter = { async limit() { return { success: true }; } };
const env = { ALLOWED_ORIGIN: "https://mstk.example", MSTK_RATE_LIMITER: allowedLimiter };

test("health endpoint returns service status and security headers", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/health"), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {
    status: "ok", service: "mstk-api", stage: "foundation",
  });
});

test("health endpoint rejects unsupported methods", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/health", { method: "POST" }), env);
  assert.equal(response.status, 405);
});

test("non-API routes return 404", async () => {
  const response = await worker.fetch(new Request("https://api.example/"), env);
  assert.equal(response.status, 404);
});

test("configured allowed origin receives CORS headers", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/health", {
    headers: { Origin: "https://mstk.example" },
  }), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://mstk.example");
});

test("unconfigured origin is rejected", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/health", {
    headers: { Origin: "https://attacker.example" },
  }), env);
  assert.equal(response.status, 403);
});

test("allowed CORS preflight returns expected methods and headers", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/health", {
    method: "OPTIONS",
    headers: { Origin: "https://mstk.example", "Access-Control-Request-Method": "GET" },
  }), env);
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://mstk.example");
  assert.equal(response.headers.get("access-control-allow-methods"), "GET, POST, OPTIONS");
  assert.equal(response.headers.get("access-control-allow-headers"), "Content-Type, Authorization");
});

test("API routes fail closed when rate limiter binding is missing", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/private"),
    { ALLOWED_ORIGIN: env.ALLOWED_ORIGIN });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "rate_limiter_unavailable" });
});

test("API routes return 429 when rate limit is exceeded", async () => {
  const limitedEnv = { ...env, MSTK_RATE_LIMITER: { async limit() { return { success: false }; } } };
  const response = await worker.fetch(new Request("https://api.example/api/private", {
    headers: { "CF-Connecting-IP": "203.0.113.10" },
  }), limitedEnv);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
});

test("API routes fail closed when rate limiter throws", async () => {
  const brokenEnv = { ...env, MSTK_RATE_LIMITER: { async limit() { throw new Error("unavailable"); } } };
  const response = await worker.fetch(new Request("https://api.example/api/private"), brokenEnv);
  assert.equal(response.status, 503);
});

test("API rejects requests without a declared body size", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/private", {
    method: "POST", body: "x",
  }), env);
  assert.equal(response.status, 411);
});

test("API rejects requests larger than one MiB", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/private", {
    method: "POST", headers: { "Content-Length": "1048577" }, body: "x",
  }), env);
  assert.equal(response.status, 413);
});

test("API rejects oversized streamed bodies even when Content-Length is forged", async () => {
  const oversizedBody = "x".repeat(1_048_577);
  const response = await worker.fetch(new Request("https://api.example/api/private", {
    method: "POST",
    headers: { "Content-Length": "1" },
    body: oversizedBody,
  }), env);
  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), { error: "request_body_too_large" });
});

test("protected API rejects missing bearer token", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/me"), {
    ...env, SUPABASE_URL: "https://project.supabase.co",
  });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "authentication_required" });
});

test("protected API fails closed when Supabase URL is not configured", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/me", {
    headers: { Authorization: "Bearer aaa.bbb.ccc" },
  }), env);
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "authentication_unavailable" });
});

test("protected API rejects malformed bearer token without fetching JWKS", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/me", {
    headers: { Authorization: "Bearer not-a-jwt" },
  }), { ...env, SUPABASE_URL: "https://project.supabase.co" });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "authentication_required" });
});

test("protected API rejects an invalid Supabase URL", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/me", {
    headers: { Authorization: "Bearer a.b.c" },
  }), { ...env, SUPABASE_URL: "http://project.supabase.co" });
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "authentication_unavailable" });
});

test("AI chat endpoint requires an authenticated session", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Content-Length": "17" },
    body: JSON.stringify({ prompt: "Hello" }),
  }), { ...env, SUPABASE_URL: "https://project.supabase.co" });
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "authentication_required" });
});

test("AI chat endpoint enforces the shared request-size guard", async () => {
  const response = await worker.fetch(new Request("https://api.example/api/ai/chat", {
    method: "POST",
    headers: { "Content-Length": "1048577" },
    body: "x",
  }), env);
  assert.equal(response.status, 413);
});
