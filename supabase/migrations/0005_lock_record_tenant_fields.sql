-- Keep project/conversation ownership and tenant boundaries immutable.
-- Moving records between workspaces requires a dedicated, audited operation;
-- ordinary row updates must not silently change the workspace boundary.

create or replace function public.prevent_record_tenant_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.workspace_id is distinct from old.workspace_id
     or new.created_by is distinct from old.created_by then
    raise exception 'workspace_id and created_by are immutable';
  end if;

  return new;
end;
$$;

drop trigger if exists projects_tenant_immutable on public.projects;
create trigger projects_tenant_immutable
before update on public.projects
for each row execute function public.prevent_record_tenant_change();

drop trigger if exists conversations_tenant_immutable on public.conversations;
create trigger conversations_tenant_immutable
before update on public.conversations
for each row execute function public.prevent_record_tenant_change();

-- Trigger functions are invoked by their installed triggers, not as RPCs.
-- Remove direct execution grants from client roles.
revoke all on function public.prevent_record_tenant_change() from public, anon, authenticated;
revoke all on function public.add_workspace_owner_as_member() from public, anon, authenticated;
