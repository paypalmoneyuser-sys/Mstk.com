-- MSTK authorization hardening: require current workspace access for deletes.
-- Apply after migrations 0001 and 0002 in a disposable database first.

drop policy if exists projects_member_delete on public.projects;
create policy projects_member_delete on public.projects
for delete to authenticated
using (
  (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
  and (
    created_by = (select auth.uid())
    or public.can_manage_workspace(workspace_id)
  )
);

drop policy if exists conversations_member_delete on public.conversations;
create policy conversations_member_delete on public.conversations
for delete to authenticated
using (
  (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
  and (
    created_by = (select auth.uid())
    or public.can_manage_workspace(workspace_id)
  )
);
