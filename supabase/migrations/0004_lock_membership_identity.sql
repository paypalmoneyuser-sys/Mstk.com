-- Prevent workspace owners from changing the identity or workspace of an
-- existing membership row via UPDATE. Membership changes must use DELETE +
-- a separately authorized invitation/insert flow instead.
create or replace function public.prevent_workspace_member_identity_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.workspace_id is distinct from old.workspace_id
     or new.user_id is distinct from old.user_id
     or new.joined_at is distinct from old.joined_at then
    raise exception 'workspace membership identity fields are immutable';
  end if;

  return new;
end;
$$;

drop trigger if exists workspace_member_identity_immutable on public.workspace_members;
create trigger workspace_member_identity_immutable
before update on public.workspace_members
for each row execute function public.prevent_workspace_member_identity_change();

revoke all on function public.prevent_workspace_member_identity_change() from public, anon, authenticated;
