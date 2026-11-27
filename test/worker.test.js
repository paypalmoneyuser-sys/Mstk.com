import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const env = { ALLOWED_ORIGIN: "https://mstk.example" };

test("health endpoint returns service status and security headers", async () => {
  const response = await worker.fetch(
    new Request("https://api.example/api/health"),
    env,
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), {
    status: "ok",
    service: "mstk-api",
    stage: "foundation",
  });
});

test("health endpoint rejects unsupported methods", async () => {
  const response = await worker.fetch(
    new Request("https://api.example/api/health", { method: "POST" }),
    env,
  );

  assert.equal(response.status, 405);
});

test("unknown routes return 404", async () => {
  const response = await worker.fetch(
    new Request("https://api.example/api/private"),
    env,
  );

  assert.equal(response.status, 404);
});

test("configured allowed origin receives CORS headers", async () => {
  const response = await worker.fetch(
    new Request("https://api.example/api/health", {
      headers: { Origin: "https://mstk.example" },
    }),
    env,
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://mstk.example");
});

test("unconfigured origin is rejected", async () => {
  const response = await worker.fetch(
    new Request("https://api.example/api/health", {
      headers: { Origin: "https://attacker.example" },
    }),
    env,
  );

  assert.equal(response.status, 403);
});

test("allowed CORS preflight returns the expected methods and headers", async () => {
  const response = await worker.fetch(
    new Request("https://api.example/api/health", {
      method: "OPTIONS",
      headers: {
        Origin: "https://mstk.example",
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "authorization,content-type",
      },
    }),
    env,
  );

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://mstk.example");
  assert.equal(response.headers.get("access-control-allow-methods"), "GET, POST, OPTIONS");
  assert.equal(response.headers.get("access-control-allow-headers"), "Content-Type, Authorization");
});
