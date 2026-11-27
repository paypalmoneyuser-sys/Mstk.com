-- Enforce tenant consistency even for trusted server/service-role writes.
-- RLS policies alone are not sufficient because privileged roles can bypass RLS.

create or replace function public.enforce_conversation_project_workspace()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.project_id is not null and not exists (
    select 1
    from public.projects p
    where p.id = new.project_id
      and p.workspace_id = new.workspace_id
  ) then
    raise exception 'conversation project must belong to the same workspace';
  end if;

  return new;
end;
$$;

drop trigger if exists conversations_project_workspace_guard on public.conversations;
create trigger conversations_project_workspace_guard
before insert or update of project_id, workspace_id on public.conversations
for each row execute function public.enforce_conversation_project_workspace();

create or replace function public.enforce_message_conversation_workspace()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.conversations c
    where c.id = new.conversation_id
      and c.workspace_id = new.workspace_id
  ) then
    raise exception 'message conversation must belong to the same workspace';
  end if;

  return new;
end;
$$;

drop trigger if exists messages_conversation_workspace_guard on public.messages;
create trigger messages_conversation_workspace_guard
before insert or update of conversation_id, workspace_id on public.messages
for each row execute function public.enforce_message_conversation_workspace();

revoke all on function public.enforce_conversation_project_workspace() from public, anon, authenticated;
revoke all on function public.enforce_message_conversation_workspace() from public, anon, authenticated;
