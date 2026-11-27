# Database security verification

These migrations are a proposed starting point, not a live database deployment.

## Migrations
1. `0001_initial_workspace_schema.sql` creates profiles, workspaces, membership, projects, conversations, messages and baseline RLS.
2. `0002_access_control_hardening.sql` tightens project/conversation update and delete permissions, adds owner/admin management for those records, and maintains updated_at timestamps.

## Required validation
Use `supabase/tests/rls_verification_plan.sql` with two distinct authenticated test users and separate workspaces. Do not run tests only as the database owner and treat that as proof of RLS: owner/service roles can bypass RLS.

## Not yet verified
- No Supabase project has been connected.
- Neither migration has been applied to a live or disposable database.
- The RLS plan has not been executed with real user JWTs.
- No production credentials, secrets, paid plan or hosted service have been configured.
- GitHub currently reports the draft PR as not mergeable; it remains unmerged.

## Remaining controls
Invitation/email verification, storage access policies, audit logging, backup/retention, API rate limiting, and end-to-end server authorization still need implementation and testing.
