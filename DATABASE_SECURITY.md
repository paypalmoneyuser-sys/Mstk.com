# Database and access-control foundation

This schema is an initial design for Supabase Postgres. It has NOT been applied to a live database or verified against a real Supabase project.

## Data model
- profiles: private user profile, keyed to Supabase Auth.
- workspaces: collaboration boundary and owner.
- workspace_members: membership and basic roles.
- projects: workspace-owned projects.
- conversations: chats optionally grouped under a project.
- messages: conversation history, scoped to the same workspace.

## Security model
- Row Level Security is enabled on every application table.
- Anonymous users receive no table privileges.
- Users can read only their own profile.
- Workspace membership gates access to shared workspace data.
- Only the workspace owner can add, change, or remove other members.
- The initial client policy allows users to insert only their own user messages.
- Assistant/system messages are reserved for a trusted server-side path.
- The service-role key must never be sent to the browser.

## Before using real data
1. Apply this migration to a disposable Supabase project, not production.
2. Create at least two test users and two workspaces.
3. Test that user A cannot read or mutate user B's profile or a workspace they do not belong to.
4. Test owner/member invite, role changes, and removal behavior.
5. Verify that messages cannot reference a conversation from another workspace.
6. Add automated SQL/RLS tests and review Supabase advisor findings.
7. Confirm the account holder is eligible and authorized to accept provider terms before creating a hosted account.

## Known limitations to resolve
- Workspace invitation and email verification flows are not implemented.
- There is no storage bucket or file metadata table yet.
- The project policy is intentionally simple; project-specific roles are not implemented.
- Assistant/system message writes need a trusted backend endpoint and service credential stored only as a server secret.
- No backup/retention policy, audit trail, rate limiting, or production monitoring is configured.
- updated_at values are not yet maintained by triggers.
