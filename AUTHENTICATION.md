# Authentication and AI API foundation

This branch adds a protected API boundary using Supabase asymmetric JWT signing keys and a disabled-by-default AI chat adapter.

## Authentication configuration

Set `SUPABASE_URL` to the exact HTTPS project URL in the Worker environment. The Worker derives the issuer and JWKS URL from it. Do not add the Supabase service-role key or JWT signing secret to Worker configuration.

Supabase Auth must issue asymmetric ES256 or RS256 access tokens and expose its JWKS endpoint. Legacy HS256 tokens are rejected.

## Implemented

- Bearer-token parsing for protected `/api/*` routes (health remains public).
- JWKS signature verification for ES256 and RS256.
- Issuer, audience, role, subject UUID, expiry, not-before, and issued-at checks.
- Five-minute in-isolate JWKS cache.
- Browser tracks Supabase access-token expiry and attempts refresh-token rotation in memory before protected database and API requests; failed refresh clears the in-memory session.
- Session and refresh token are not persisted across page reloads; durable session restoration and full revocation handling remain outstanding.
- Protected `GET /api/me` returns only verified user ID and role.
- Protected `POST /api/ai/chat` accepts a prompt and calls one configured OpenAI-style chat-completions endpoint server-side.
- AI route is disabled unless `MSTK_AI_ENABLED=true`; validates HTTPS endpoint, requires a server-side API key and model, caps prompt at 12,000 characters, and applies a 30-second timeout.
- Exact-origin CORS and fail-closed rate limiting are retained. Current API requests are read and bounded by actual bytes (1 MiB maximum), not only by the declared Content-Length.

## Browser workspace data

The frontend currently uses the signed-in Supabase access token and the public project URL / publishable (or anon) key to call Supabase REST endpoints for:

- Creating and listing workspaces.
- Creating and listing projects within the selected workspace.
- Creating and listing conversations within the selected workspace.
- Saving and reading user-authored messages for a selected conversation.

The browser does not use a service-role key. These requests rely on the database grants and row-level security policies in the checked-in migrations. A UI implementation or a successful static test does not prove that a live project has applied those migrations or that live authorization is correct. Apply and test migrations in a non-production Supabase project first. The message UI currently saves user messages only; assistant responses are not generated or saved.

## Blind comparison preview

The workspace includes a manual A/B comparison mode. It randomizes which pasted response appears as A or B, hides source labels until the user chooses a response, and then reveals the selected response and its source. This is a client-side comparison aid only: it does not call AI providers, guarantee statistical blinding, store comparison results, or independently evaluate answer quality.

## AI adapter configuration and safeguards

Configure `MSTK_AI_CHAT_COMPLETIONS_URL`, `MSTK_AI_MODEL`, and `MSTK_AI_API_KEY` only after selecting a provider whose official API terms, regional availability, pricing, and age rules permit the intended users. Store the key as a Cloudflare Worker secret; never expose it to the browser or commit it. Do not enable services restricted to adults in a teen-facing product. API usage may incur charges; this branch does not select a provider, configure credentials, or enable the adapter.

The adapter sends the user prompt to the selected provider. Do not send sensitive personal data. Provider-side processing and retention are governed by that provider's terms. No prompt history is stored by this endpoint, but provider-side retention is not controlled here.

## Still required before production

- Configure Supabase Auth asymmetric signing keys and validate live project JWKS.
- Test with real Supabase-issued access and refresh tokens.
- Configure Cloudflare rate-limiting binding and the real frontend origin.
- Add resource-level authorization and database access based only on verified identity.
- Add invitation, account recovery, email verification, logout/revocation, and complete session lifecycle.
- Add bounded streaming/storage controls before introducing file uploads or long-lived streaming endpoints.
- Select and verify an age-appropriate AI provider; add provider-specific request/response validation, quotas, cost limits, abuse controls, and usage metering.
- Run integration, penetration, dependency, privacy, and production end-to-end tests.

This is an engineering foundation, not a complete authentication system, production deployment, or security certification.
