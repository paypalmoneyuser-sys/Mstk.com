import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const limiter = { async limit() { return { success: true }; } };
const userId = "123e4567-e89b-42d3-a456-426614174000";
const encoder = new TextEncoder();

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

async function makeToken(algorithm, projectName, tamper = false) {
  const projectUrl = `https://${projectName}.supabase.co`;
  const keyAlgorithm = algorithm === "ES256"
    ? { name: "ECDSA", namedCurve: "P-256" }
    : { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" };
  const pair = await crypto.subtle.generateKey(keyAlgorithm, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  Object.assign(jwk, { kid: `test-${algorithm}`, alg: algorithm, use: "sig" });

  const header = encode({ alg: algorithm, typ: "JWT", kid: jwk.kid });
  const now = Math.floor(Date.now() / 1000);
  const payload = encode({
    iss: `${projectUrl}/auth/v1`,
    aud: "authenticated",
    role: "authenticated",
    sub: userId,
    iat: now,
    exp: now + 300,
  });
  const signingInput = `${header}.${payload}`;
  const signAlgorithm = algorithm === "ES256"
    ? { name: "ECDSA", hash: "SHA-256" }
    : { name: "RSASSA-PKCS1-v1_5" };
  const signature = new Uint8Array(await crypto.subtle.sign(signAlgorithm, pair.privateKey, encoder.encode(signingInput)));
  if (tamper) signature[0] ^= 1;
  const token = `${signingInput}.${Buffer.from(signature).toString("base64url")}`;
  return { projectUrl, token, jwk };
}

async function requestWithJwks(projectUrl, token, jwk) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    assert.equal(String(input), `${projectUrl}/auth/v1/.well-known/jwks.json`);
    return new Response(JSON.stringify({ keys: [jwk] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    return await worker.fetch(new Request("https://api.example/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    }), {
      ALLOWED_ORIGIN: "https://mstk.example",
      MSTK_RATE_LIMITER: limiter,
      SUPABASE_URL: projectUrl,
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
}

for (const algorithm of ["ES256", "RS256"]) {
  test(`protected API accepts a correctly signed ${algorithm} Supabase JWT`, async () => {
    const { projectUrl, token, jwk } = await makeToken(algorithm, `mstk-test-${algorithm.toLowerCase()}`);
    const response = await requestWithJwks(projectUrl, token, jwk);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { user: { id: userId, role: "authenticated" } });
  });
}

test("protected API rejects a JWT with an invalid cryptographic signature", async () => {
  const { projectUrl, token, jwk } = await makeToken("ES256", "mstk-test-invalid-signature", true);
  const response = await requestWithJwks(projectUrl, token, jwk);
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "invalid_access_token" });
});
