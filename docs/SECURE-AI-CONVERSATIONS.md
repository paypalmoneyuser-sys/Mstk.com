# Secure AI conversation workflow

## Runtime configuration

The Worker requires these values before AI chat can run:

- `SUPABASE_URL`: HTTPS URL of the Supabase project.
- `SUPABASE_SERVICE_ROLE_KEY`: privileged Supabase service-role key, stored only as a Cloudflare Worker secret. Never add it to browser config, Git, build variables exposed to Pages, or logs.
- `MSTK_AI_ENABLED=true`, `MSTK_AI_CHAT_COMPLETIONS_URL`, `MSTK_AI_API_KEY`, and `MSTK_AI_MODEL`: provider settings. Keep provider credentials as Worker secrets.

The frontend continues to save the user's message using their own authenticated Supabase session and existing RLS policy. It then sends the workspace and conversation identifiers to the Worker.

## Worker authorization and persistence

The Worker verifies the Supabase JWT, checks that the authenticated user is still a member of the requested workspace, confirms that the conversation belongs to that workspace, and confirms that the latest saved message matches the submitted prompt. It loads a bounded recent history (up to 20 messages and 24,000 characters), calls the configured provider, and inserts the assistant response using the service-role key. The inserted row's `created_by` is the verified JWT subject, never a browser-supplied value.

The database migration's relationship triggers continue to enforce workspace/conversation consistency even for privileged writes. The browser's existing RLS policy still permits only user-role message inserts; it is not widened to allow assistant inserts.

## Important operational notes

- This implementation uses a privileged service-role key in the Worker. Configure it as a Worker secret, restrict access to the Cloudflare project, rotate it if exposed, and never reuse it in Pages.
- The Worker performs membership and conversation checks before provider calls and persistence. Review and test this authorization path before production use.
- If the provider succeeds but the database insert fails, the API returns an error rather than claiming the assistant response was saved. The user's original message remains saved.
- Live Supabase, Cloudflare Worker, and AI-provider integration tests are still required. The automated tests use mocked HTTP responses and do not prove production credentials or deployment configuration.
- Rate limiting remains fail-closed and must be configured as a Worker binding before protected API routes will work.
