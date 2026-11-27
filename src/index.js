const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

const MAX_API_BODY_BYTES = 1_048_576;

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin || !env.ALLOWED_ORIGIN || origin !== env.ALLOWED_ORIGIN) {
    return {};
  }

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
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(ip),
  );
  const fingerprint = [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `${pathname}:${fingerprint}`;
}

async function enforceRateLimit(request, env, pathname) {
  // Cloudflare Rate Limiting binding must be configured before API routes
  // are enabled. Fail closed instead of silently running without protection.
  if (!env.MSTK_RATE_LIMITER || typeof env.MSTK_RATE_LIMITER.limit !== "function") {
    return json({ error: "rate_limiter_unavailable" }, 503);
  }

  try {
    const result = await env.MSTK_RATE_LIMITER.limit({
      key: await rateLimitKey(request, pathname),
    });
    if (!result?.success) {
      return json({ error: "rate_limit_exceeded" }, 429, {
        "retry-after": "60",
      });
    }
    return null;
  } catch {
    return json({ error: "rate_limiter_unavailable" }, 503);
  }
}

function enforceRequestSize(request) {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return null;

  const rawLength = request.headers.get("Content-Length");
  if (rawLength === null || !/^\d+$/.test(rawLength)) {
    return json({ error: "content_length_required" }, 411);
  }
  if (Number(rawLength) > MAX_API_BODY_BYTES) {
    return json({ error: "request_body_too_large" }, 413);
  }
  return null;
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
      return new Response(null, {
        status: 204,
        headers: { ...JSON_HEADERS, ...cors },
      });
    }

    if (url.pathname === "/api/health") {
      if (request.method !== "GET") {
        return json({ error: "method_not_allowed" }, 405, cors);
      }
      return json({ status: "ok", service: "mstk-api", stage: "foundation" }, 200, cors);
    }

    if (url.pathname.startsWith("/api/")) {
      const sizeError = enforceRequestSize(request);
      if (sizeError) return sizeError;

      const rateLimitError = await enforceRateLimit(request, env, url.pathname);
      if (rateLimitError) {
        return new Response(rateLimitError.body, {
          status: rateLimitError.status,
          headers: { ...Object.fromEntries(rateLimitError.headers), ...cors },
        });
      }
    }

    return json({ error: "not_found" }, 404, cors);
  },
};
