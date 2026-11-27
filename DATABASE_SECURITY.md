# Database security verification

These migrations are a proposed schema/security implementation. The repository CI now runs them against a disposable PostgreSQL 16 database using a minimal local `auth.users` table and `auth.uid()` shim.

## Migrations
1. `0001_initial_workspace_schema.sql` creates profiles, workspaces, memberships, projects, conversations, messages and baseline RLS.
2. `0002_access_control_hardening.sql` adds owner/admin management, tightens project/conversation update permissions, and maintains updated_at timestamps.
3. `0003_require_membership_for_deletes.sql` requires current workspace membership (or ownership) before deleting projects or conversations.
4. `0004_lock_membership_identity.sql` prevents UPDATE from reassigning an existing membership row to another user/workspace or changing its joined_at timestamp.
5. `0005_lock_record_tenant_fields.sql` prevents ordinary updates from changing project/conversation workspace_id or created_by.
6. `0006_enforce_workspace_relationships.sql` uses database triggers to enforce that a conversation's project and a message's conversation belong to the same workspace, including privileged server-side writes.

## Automated CI validation
GitHub Actions run #17 completed successfully on the backend-foundation branch:
- Node.js Worker tests: passed.
- JavaScript syntax checks: passed.
- PostgreSQL 16 test database startup: passed.
- Minimal local auth test schema bootstrap: passed.
- Migrations 0001-0006 applied in order: passed.
- PostgreSQL RLS/tenant-integrity smoke script: passed.

The smoke test checks workspace owner/member creation, member visibility, member project creation, access removal, denial of a former member's delete, cross-workspace conversation/project rejection, and immutable project tenant ownership. It runs in a transaction and rolls back its test data.

## Scope and limitations
- This is a local PostgreSQL integration smoke test with a minimal Supabase-auth compatibility shim, not a test against a real Supabase hosted project.
- It does not validate Supabase Auth token issuance, Storage policies, Realtime, Edge Functions, production role configuration, backups, or deployment.
- The manual checklist in `supabase/tests/rls_verification_plan.sql` includes additional cases not all automated in the smoke script.
- No live Supabase project or production credentials are connected.
- The draft PR remains unmerged.

## Remaining controls
Invitation/email verification, storage access policies, audit logging, backup/retention, API rate limiting, request size limits, and end-to-end server authorization still need implementation and testing.
