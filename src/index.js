const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

const MAX_API_BODY_BYTES = 1_048_576;
const JWKS_CACHE_TTL_MS = 5 * 60 * 1000;
const jwksCache = new Map();

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin || !env.ALLOWED_ORIGIN || origin !== env.ALLOWED_ORIGIN) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "Content-Type, Authorization",
    "access-control-max-age": "600",
    vary: "Origin",
  };
}

async function rateLimitKey(request, pathname) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  const fingerprint = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `${pathname}:${fingerprint}`;
}

async function enforceRateLimit(request, env, pathname) {
  if (!env.MSTK_RATE_LIMITER || typeof env.MSTK_RATE_LIMITER.limit !== "function") {
    return json({ error: "rate_limiter_unavailable" }, 503);
  }
  try {
    const result = await env.MSTK_RATE_LIMITER.limit({
      key: await rateLimitKey(request, pathname),
    });
    if (!result?.success) {
      return json({ error: "rate_limit_exceeded" }, 429, { "retry-after": "60" });
    }
    return null;
  } catch {
    return json({ error: "rate_limiter_unavailable" }, 503);
  }
}

async function enforceRequestSize(request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return null;
  const rawLength = request.headers.get("Content-Length");
  if (rawLength !== null && (!/^\d+$/.test(rawLength) ||
      !Number.isSafeInteger(Number(rawLength)) || Number(rawLength) > MAX_API_BODY_BYTES)) {
    return json({ error: "request_body_too_large" }, 413);
  }
  if (!request.body) return null;

  const reader = request.clone().body.getReader();
  let bytesRead = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      if (bytesRead > MAX_API_BODY_BYTES) {
        await reader.cancel();
        return json({ error: "request_body_too_large" }, 413);
      }
    }
  } catch {
    return json({ error: "request_body_unreadable" }, 400);
  } finally {
    try { reader.releaseLock(); } catch {}
  }
  return null;
}

function decodeBase64Url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid_base64url");
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function decodeJsonSegment(segment) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(segment)));
}

function getSupabaseConfig(rawUrl) {
  if (!rawUrl) throw new Error("auth_not_configured");
  const url = new URL(rawUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("invalid_supabase_url");
  }
  const base = url.toString().replace(/\/$/, "");
  return {
    issuer: `${base}/auth/v1`,
    jwksUrl: `${base}/auth/v1/.well-known/jwks.json`,
  };
}

async function getJwks(jwksUrl, now) {
  const cached = jwksCache.get(jwksUrl);
  if (cached && cached.expiresAt > now) return cached.keys;

  const response = await fetch(jwksUrl, {
    headers: { accept: "application/json" },
    redirect: "error",
  });
  if (!response.ok) throw new Error("jwks_unavailable");
  const body = await response.json();
  if (!Array.isArray(body.keys) || body.keys.length === 0) {
    throw new Error("invalid_jwks");
  }
  const keys = body.keys.filter((key) =>
    key && typeof key.kid === "string" && key.use !== "enc" &&
    ["ES256", "RS256"].includes(key.alg)
  );
  if (keys.length === 0) throw new Error("no_supported_signing_keys");
  jwksCache.set(jwksUrl, { keys, expiresAt: now + JWKS_CACHE_TTL_MS });
  return keys;
}

async function verifySupabaseAccessToken(request, env) {
  const authorization = request.headers.get("Authorization") || "";
  const match = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(authorization);
  if (!match) return { ok: false, status: 401, error: "authentication_required" };

  try {
    const { issuer, jwksUrl } = getSupabaseConfig(env.SUPABASE_URL);
    const [encodedHeader, encodedPayload, encodedSignature] = match[1].split(".");
    const header = decodeJsonSegment(encodedHeader);
    const claims = decodeJsonSegment(encodedPayload);
    if (!header || !["ES256", "RS256"].includes(header.alg) ||
        typeof header.kid !== "string" || header.crit !== undefined ||
        header.jku !== undefined || header.x5u !== undefined) {
      return { ok: false, status: 401, error: "invalid_access_token" };
    }

    const now = Math.floor(Date.now() / 1000);
    if (claims.iss !== issuer ||
        !(claims.aud === "authenticated" ||
          (Array.isArray(claims.aud) && claims.aud.includes("authenticated"))) ||
        claims.role !== "authenticated" ||
        typeof claims.sub !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(claims.sub) ||
        !Number.isFinite(claims.exp) || claims.exp <= now ||
        (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > now)) ||
        (claims.iat !== undefined && (!Number.isFinite(claims.iat) || claims.iat > now + 60))) {
      return { ok: false, status: 401, error: "invalid_access_token" };
    }

    const keys = await getJwks(jwksUrl, Date.now());
    const jwk = keys.find((key) => key.kid === header.kid && key.alg === header.alg);
    if (!jwk) return { ok: false, status: 401, error: "invalid_access_token" };

    const algorithm = header.alg === "ES256"
      ? { name: "ECDSA", namedCurve: "P-256" }
      : { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
    const verifyAlgorithm = header.alg === "ES256"
      ? { name: "ECDSA", hash: "SHA-256" }
      : { name: "RSASSA-PKCS1-v1_5" };
    const publicKey = await crypto.subtle.importKey("jwk", jwk, algorithm, false, ["verify"]);
    const signingInput = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
    const valid = await crypto.subtle.verify(
      verifyAlgorithm,
      publicKey,
      decodeBase64Url(encodedSignature),
      signingInput,
    );
    if (!valid) return { ok: false, status: 401, error: "invalid_access_token" };
    return { ok: true, user: { id: claims.sub, role: claims.role } };
  } catch {
    return { ok: false, status: 503, error: "authentication_unavailable" };
  }
}

async function handleAiChat(request, env, cors) {
  if (env.MSTK_AI_ENABLED !== "true") {
    return json({ error: "ai_provider_not_enabled" }, 503, cors);
  }
  if (typeof env.MSTK_AI_CHAT_COMPLETIONS_URL !== "string" ||
      typeof env.MSTK_AI_API_KEY !== "string" ||
      typeof env.MSTK_AI_MODEL !== "string" ||
      !env.MSTK_AI_API_KEY.trim() || !env.MSTK_AI_MODEL.trim()) {
    return json({ error: "ai_provider_not_configured" }, 503, cors);
  }

  let endpoint;
  try {
    endpoint = new URL(env.MSTK_AI_CHAT_COMPLETIONS_URL);
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password ||
        endpoint.search || endpoint.hash || !endpoint.pathname.endsWith("/chat/completions")) {
      return json({ error: "ai_provider_configuration_invalid" }, 503, cors);
    }
  } catch {
    return json({ error: "ai_provider_configuration_invalid" }, 503, cors);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400, cors);
  }
  if (!body || typeof body.prompt !== "string" ||
      !body.prompt.trim() || body.prompt.length > 12000) {
    return json({ error: "invalid_prompt" }, 400, cors);
  }

  try {
    const response = await fetch(endpoint.toString(), {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.MSTK_AI_API_KEY}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        model: env.MSTK_AI_MODEL,
        messages: [{ role: "user", content: body.prompt }],
        max_tokens: 1024,
      }),
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      return json({ error: "ai_provider_request_failed" }, 502, cors);
    }
    const result = await response.json();
    const answer = result?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) {
      return json({ error: "ai_provider_response_invalid" }, 502, cors);
    }
    return json({ answer, model: env.MSTK_AI_MODEL }, 200, cors);
  } catch {
    return json({ error: "ai_provider_unavailable" }, 502, cors);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = corsHeaders(request, env);
    const origin = request.headers.get("Origin");

    if (origin && !cors["access-control-allow-origin"]) {
      return json({ error: "origin_not_allowed" }, 403);
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...JSON_HEADERS, ...cors } });
    }
    if (url.pathname === "/api/health") {
      if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405, cors);
      return json({ status: "ok", service: "mstk-api", stage: "foundation" }, 200, cors);
    }
    if (!url.pathname.startsWith("/api/")) return json({ error: "not_found" }, 404, cors);

    const sizeError = await enforceRequestSize(request);
    if (sizeError) return new Response(sizeError.body, {
      status: sizeError.status, headers: { ...Object.fromEntries(sizeError.headers), ...cors },
    });

    const rateLimitError = await enforceRateLimit(request, env, url.pathname);
    if (rateLimitError) return new Response(rateLimitError.body, {
      status: rateLimitError.status, headers: { ...Object.fromEntries(rateLimitError.headers), ...cors },
    });

    const auth = await verifySupabaseAccessToken(request, env);
    if (!auth.ok) return json({ error: auth.error }, auth.status, cors);

    if (url.pathname === "/api/me") {
      if (request.method !== "GET") return json({ error: "method_not_allowed" }, 405, cors);
      return json({ user: auth.user }, 200, cors);
    }
    if (url.pathname === "/api/ai/chat") {
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, cors);
      return handleAiChat(request, env, cors);
    }
    return json({ error: "not_found" }, 404, cors);
  },
};
