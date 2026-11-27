# Frontend security policy and hosting notes

The frontend has been split into same-origin external assets:

- `/mstk-config.js`: public Supabase project URL and publishable/anon key only.
- `/app.js`: application logic.
- `/styles.css`: application styles.
- `/index.html`: markup and external asset references.

The HTML currently has no inline `<script>`, `<style>`, `on*=` event-handler attributes, `style=` attributes, or `javascript:` URLs. Keep these constraints in CI so a strict script/style policy remains practical.

## Host-specific CSP template

After selecting the static host and final HTTPS hostname, configure the host to send a Content-Security-Policy response header. Adapt the two connection origins to the exact deployed values:

```text
default-src 'self';
base-uri 'self';
object-src 'none';
frame-ancestors 'none';
form-action 'self';
script-src 'self';
style-src 'self';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self' https://YOUR-PROJECT.supabase.co https://YOUR-API-HOST;
upgrade-insecure-requests
```

- Replace `https://YOUR-PROJECT.supabase.co` with the exact `MSTK_CONFIG.supabaseUrl` origin.
- Replace `https://YOUR-API-HOST` with the exact `MSTK_CONFIG.apiBase` origin if the API is on another origin. If the API is same-origin, remove this extra origin.
- Add any additional origins only after identifying a real required browser request.
- Do not add `'unsafe-inline'` or `'unsafe-eval'` to make the policy pass.
- Keep `frame-ancestors 'none'` in the response header; it is not effective from a meta CSP tag.
- Test in report-only mode first if the host supports it, review browser console violations, then enforce the policy.

## Hosting-dependent headers

Cloudflare Pages uses the root `_headers` file included in the static build for baseline headers. These do not replace the host-specific Content-Security-Policy, which remains unset until the exact Supabase and API origins are known. If a different host is chosen, translate these headers into its supported configuration. Also consider:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000` only on the HTTPS production host after HTTPS is guaranteed.

The Worker already sends security headers on its API responses. That does not automatically protect static HTML, CSS, or JavaScript served by a separate host.

## Release verification

1. Set the exact production origins and public Supabase config.
2. Deploy to a preview environment over HTTPS.
3. Check that sign-in, recovery, workspace API calls, and static assets load under the policy.
4. Check browser console and network requests for CSP violations.
5. Confirm the host returns the policy on HTML responses, not only on API responses.
6. Re-run CI on the exact release commit before production release.

No CSP response header or hosting-specific configuration is enabled by this document. It is a host-neutral implementation plan, not proof of a deployed policy.
