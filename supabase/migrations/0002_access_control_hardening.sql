-- MSTK security hardening for the initial workspace schema.
-- Apply after 0001_initial_workspace_schema.sql in a disposable database first.

create or replace function public.can_manage_workspace(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspaces w
    where w.id = target_workspace
      and w.owner_id = (select auth.uid())
  ) or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = (select auth.uid())
      and wm.role = 'admin'
  );
$$;

revoke all on function public.can_manage_workspace(uuid) from public, anon;
grant execute on function public.can_manage_workspace(uuid) to authenticated;

-- Members may create projects and edit their own; workspace owner/admin can
-- manage any project in the workspace. Ordinary members cannot delete others' work.
drop policy if exists projects_member_all on public.projects;
drop policy if exists projects_member_select on public.projects;
drop policy if exists projects_member_insert on public.projects;
drop policy if exists projects_member_update on public.projects;
drop policy if exists projects_member_delete on public.projects;

create policy projects_member_select on public.projects
for select to authenticated
using (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id));

create policy projects_member_insert on public.projects
for insert to authenticated
with check (
  (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
  and created_by = (select auth.uid())
);

create policy projects_member_update on public.projects
for update to authenticated
using (
  created_by = (select auth.uid())
  or public.can_manage_workspace(workspace_id)
)
with check (
  (created_by = (select auth.uid()) or public.can_manage_workspace(workspace_id))
  and (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
);

create policy projects_member_delete on public.projects
for delete to authenticated
using (
  created_by = (select auth.uid())
  or public.can_manage_workspace(workspace_id)
);

-- Prevent ordinary members from editing/deleting conversations they did not create.
drop policy if exists conversations_member_update on public.conversations;
create policy conversations_member_update on public.conversations
for update to authenticated
using (
  created_by = (select auth.uid())
  or public.can_manage_workspace(workspace_id)
)
with check (
  (created_by = (select auth.uid()) or public.can_manage_workspace(workspace_id))
  and (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
  and (
    project_id is null or exists (
      select 1 from public.projects p
      where p.id = project_id and p.workspace_id = conversations.workspace_id
    )
  )
);

drop policy if exists conversations_member_delete on public.conversations;
create policy conversations_member_delete on public.conversations
for delete to authenticated
using (
  created_by = (select auth.uid())
  or public.can_manage_workspace(workspace_id)
);

-- Keep updated_at reliable for mutable records.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists conversations_set_updated_at on public.conversations;
create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

revoke all on function public.set_updated_at() from public, anon, authenticated;
