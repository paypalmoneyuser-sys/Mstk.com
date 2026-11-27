# Database security verification

These migrations are proposed schema/security changes, not a live database deployment.

## Migrations
1. `0001_initial_workspace_schema.sql` creates profiles, workspaces, memberships, projects, conversations, messages and baseline RLS.
2. `0002_access_control_hardening.sql` adds owner/admin management, tightens project/conversation update permissions, and maintains updated_at timestamps.
3. `0003_require_membership_for_deletes.sql` requires current workspace membership (or ownership) before deleting projects or conversations.
4. `0004_lock_membership_identity.sql` prevents UPDATE from reassigning an existing membership row to another user/workspace or changing its joined_at timestamp.
5. `0005_lock_record_tenant_fields.sql` prevents ordinary updates from changing project/conversation workspace_id or created_by.

## Required validation
Use `supabase/tests/rls_verification_plan.sql` with at least two distinct authenticated test users and separate workspaces. Test role changes, membership identity, tenant-field immutability, cross-workspace project/conversation relationships, and removed-member access. Do not run tests only as the database owner and treat that as proof of RLS: owner/service roles can bypass RLS.

## Not yet verified
- No Supabase project has been connected.
- No migration has been applied to a live or disposable database.
- The RLS plan has not been executed with real user JWTs.
- No production credentials, secrets, paid plan or hosted service have been configured.
- GitHub Actions workflow has been added, but its remote run/result has not yet been observed.
- The draft PR remains unmerged; check GitHub for current mergeability.

## Remaining controls
Invitation/email verification, storage access policies, audit logging, backup/retention, API rate limiting, request size limits, and end-to-end server authorization still need implementation and testing.
