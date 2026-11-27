-- MSTK initial workspace schema for Supabase Postgres.
-- Not yet applied to a live database. Test in a disposable project first.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 120),
  description text check (char_length(description) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null default 'New chat' check (char_length(title) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) <= 100000),
  created_at timestamptz not null default now()
);

create index if not exists workspace_members_user_idx on public.workspace_members(user_id);
create index if not exists projects_workspace_idx on public.projects(workspace_id, created_at desc);
create index if not exists conversations_workspace_idx on public.conversations(workspace_id, created_at desc);
create index if not exists messages_conversation_idx on public.messages(conversation_id, created_at);

-- SECURITY DEFINER helpers avoid recursive RLS evaluation on workspace_members.
create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_workspace_owner(target_workspace uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = target_workspace and w.owner_id = (select auth.uid())
  );
$$;

create or replace function public.add_workspace_owner_as_member()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (workspace_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists workspace_owner_membership on public.workspaces;
create trigger workspace_owner_membership
after insert on public.workspaces
for each row execute function public.add_workspace_owner_as_member();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists profile_select_own on public.profiles;
create policy profile_select_own on public.profiles
for select to authenticated using (id = (select auth.uid()));
drop policy if exists profile_insert_own on public.profiles;
create policy profile_insert_own on public.profiles
for insert to authenticated with check (id = (select auth.uid()));
drop policy if exists profile_update_own on public.profiles;
create policy profile_update_own on public.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists workspace_select_member on public.workspaces;
create policy workspace_select_member on public.workspaces
for select to authenticated
using (public.is_workspace_member(id) or owner_id = (select auth.uid()));
drop policy if exists workspace_insert_owner on public.workspaces;
create policy workspace_insert_owner on public.workspaces
for insert to authenticated with check (owner_id = (select auth.uid()));
drop policy if exists workspace_update_owner on public.workspaces;
create policy workspace_update_owner on public.workspaces
for update to authenticated using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));
drop policy if exists workspace_delete_owner on public.workspaces;
create policy workspace_delete_owner on public.workspaces
for delete to authenticated using (owner_id = (select auth.uid()));

drop policy if exists members_select_workspace on public.workspace_members;
create policy members_select_workspace on public.workspace_members
for select to authenticated
using (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id));
drop policy if exists members_insert_owner on public.workspace_members;
create policy members_insert_owner on public.workspace_members
for insert to authenticated
with check (
  public.is_workspace_owner(workspace_id)
  and role = 'member'
  and user_id <> (select auth.uid())
);
drop policy if exists members_update_owner on public.workspace_members;
create policy members_update_owner on public.workspace_members
for update to authenticated
using (public.is_workspace_owner(workspace_id) and user_id <> (select auth.uid()))
with check (
  public.is_workspace_owner(workspace_id)
  and user_id <> (select auth.uid())
  and role in ('admin', 'member')
);
drop policy if exists members_delete_owner on public.workspace_members;
create policy members_delete_owner on public.workspace_members
for delete to authenticated
using (public.is_workspace_owner(workspace_id) and user_id <> (select auth.uid()));

drop policy if exists projects_member_all on public.projects;
create policy projects_member_all on public.projects
for all to authenticated
using (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
with check (
  (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
  and created_by = (select auth.uid())
);

drop policy if exists conversations_member_select on public.conversations;
create policy conversations_member_select on public.conversations
for select to authenticated
using (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id));
drop policy if exists conversations_member_insert on public.conversations;
create policy conversations_member_insert on public.conversations
for insert to authenticated
with check (
  (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
  and created_by = (select auth.uid())
  and (
    project_id is null or exists (
      select 1 from public.projects p
      where p.id = project_id and p.workspace_id = conversations.workspace_id
    )
  )
);
drop policy if exists conversations_member_update on public.conversations;
create policy conversations_member_update on public.conversations
for update to authenticated
using (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
with check (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id));
drop policy if exists conversations_member_delete on public.conversations;
create policy conversations_member_delete on public.conversations
for delete to authenticated
using (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id));

drop policy if exists messages_member_select on public.messages;
create policy messages_member_select on public.messages
for select to authenticated
using (
  (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
  and exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.workspace_id = messages.workspace_id
  )
);
drop policy if exists messages_member_insert on public.messages;
create policy messages_member_insert on public.messages
for insert to authenticated
with check (
  (public.is_workspace_member(workspace_id) or public.is_workspace_owner(workspace_id))
  and created_by = (select auth.uid())
  and role = 'user'
  and exists (
    select 1 from public.conversations c
    where c.id = conversation_id and c.workspace_id = messages.workspace_id
  )
);

revoke all on public.profiles, public.workspaces, public.workspace_members,
  public.projects, public.conversations, public.messages from anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;

revoke all on function public.is_workspace_member(uuid) from public, anon;
revoke all on function public.is_workspace_owner(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;

-- Assistant/system message writes are reserved for a trusted server-side path.
-- Never expose a Supabase service-role key in browser code.
