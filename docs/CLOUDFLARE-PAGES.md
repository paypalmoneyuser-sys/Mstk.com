# Cloudflare Pages hosting plan (free-first)

## Status

This is a deployment plan, not a deployed site. No Cloudflare account has been connected, no domain has been added, no credentials have been configured, and no paid service has been enabled.

Use only the Cloudflare Free plan unless the project owner separately reviews and explicitly approves a paid service. Do not add a payment method or upgrade during setup.

Because account and service terms may impose age and contracting requirements, a parent or legal guardian/adult project owner must review the current Cloudflare terms and own/manage the hosting account. Do not misstate age or bypass an eligibility check.

## Repository facts that affect deployment

- The static frontend currently lives at the repository root alongside backend code, migrations, tests, and documentation.
- The HTML entry point is named lowercase `index.html` for the root page.
- The backend is a separate Cloudflare Worker described by `wrangler.toml`; Pages static hosting does not deploy that Worker automatically.
- `mstk-config.js` is intentionally local-only and ignored by Git. Only the Supabase project URL, publishable/anon key, and optional API origin belong in browser configuration. Never put service-role keys, signing secrets, passwords, or provider API keys in the static site.
- The application has not been verified against a live Supabase project or a deployed Worker.

Do not point Pages at the repository root as-is: it contains backend source and project files that should not be published as the static output.

## Repository preparation

A dedicated static build step is now implemented in `scripts/build-pages.js` and exposed as `npm run build:pages`. It:

1. Creates a clean `dist/` output directory.
2. Publishes only the frontend entry point (as lowercase `index.html`), `app.js`, `styles.css`, and generated public `mstk-config.js`.
3. Copies a minimal `_headers` file with baseline security response headers. Does not copy `src/`, `supabase/`, `test/`, repository metadata, environment files, or documentation into the public output.
4. Generates `mstk-config.js` from explicitly supplied public build variables, with safe empty/unconfigured defaults. Validate configured origins as HTTPS. Never read or serialize server-side secrets.
5. Has automated tests that verify the output allowlist, lowercase entry point, asset references, HTTPS origin validation, and absence of secret-like configuration.

The build is code-complete, but it is not yet considered verified until CI passes on the latest commit. Once verified, the intended Pages build settings are:

- Framework preset: None
- Build command: `npm run build:pages`
- Build output directory: `dist`
- Root directory: repository root

These are intended settings; they are not active yet because no Pages project has been configured or deployed.

## Public build variables

When a real Supabase project and API hostname exist, configure only:

- `MSTK_PUBLIC_SUPABASE_URL`: the Supabase HTTPS project origin.
- `MSTK_PUBLIC_SUPABASE_ANON_KEY`: the Supabase publishable/anon key (browser-visible by design).
- `MSTK_PUBLIC_API_BASE`: the exact HTTPS API Worker origin; leave empty if the API is same-origin.

These values are not credentials that grant privileged database access, but they are still project configuration. RLS and server-side authorization must be correctly configured before real user data is used.

## Release gates

Do not publish a production site until all are true:

- Adult project owner has reviewed and accepted the current hosting terms and confirmed the Free plan.
- The static build allowlist and generated config have passing automated tests on the exact release commit.
- A final HTTPS hostname and exact allowed API origin are selected.
- Supabase Auth, recovery redirects, asymmetric JWT verification, database migrations, and cross-account RLS are tested against a dedicated test project with separate test accounts.
- The Worker is separately configured with exact `ALLOWED_ORIGIN`, `SUPABASE_URL`, and the rate-limit binding; no secret is placed in the frontend.
- Static response headers and a strict CSP are configured for the actual production origins and verified in a preview.
- Privacy notice, terms, data retention/deletion process, monitoring, and backup/restore plan are ready.
- CI passes on the exact release commit.

No deployment, domain registration, paid upgrade, or external account change is authorized by this document.
