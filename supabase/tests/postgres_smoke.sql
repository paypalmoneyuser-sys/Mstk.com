-- PostgreSQL integration smoke tests for MSTK migrations 0001-0006.
-- This script uses a minimal auth shim and distinct JWT subject claims to
-- exercise RLS; it is not a substitute for a real Supabase project test.

\set ON_ERROR_STOP on
begin;

insert into auth.users (id) values
  ('10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002')
on conflict do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

insert into public.workspaces (id, name, owner_id) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Workspace A', '10000000-0000-4000-8000-000000000001'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Workspace B', '10000000-0000-4000-8000-000000000001');

insert into public.projects (id, workspace_id, created_by, name)
values ('aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        '10000000-0000-4000-8000-000000000001', 'Project A');

insert into public.conversations (id, workspace_id, project_id, created_by, title)
values ('aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        'aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa',
        '10000000-0000-4000-8000-000000000001', 'Conversation A');

insert into public.messages (id, conversation_id, workspace_id, created_by, role, content)
values ('aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa',
        'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        '10000000-0000-4000-8000-000000000001', 'user', 'hello');

-- B cannot see the private workspace before being invited.
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
do $$
begin
  if (select count(*) from public.workspaces
      where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 0 then
    raise exception 'non-member unexpectedly sees private workspace';
  end if;
end $$;

-- Owner A invites B as a member.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
insert into public.workspace_members (workspace_id, user_id, role)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        '20000000-0000-4000-8000-000000000002', 'member');

-- Membership identity must not be reassigned through UPDATE.
do $$
declare
  rejected boolean := false;
begin
  begin
    update public.workspace_members
    set user_id = '30000000-0000-4000-8000-000000000003'
    where workspace_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      and user_id = '20000000-0000-4000-8000-000000000002';
  exception when others then
    rejected := true;
  end;
  if not rejected then
    raise exception 'membership identity reassignment was accepted';
  end if;
end $$;

-- B can see the workspace after invitation and create a project, but cannot
-- modify or delete another member's project.
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
do $$
begin
  if (select count(*) from public.workspaces
      where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 1 then
    raise exception 'invited member cannot see workspace';
  end if;
end $$;

do $$
declare
  affected integer;
begin
  update public.projects set name = 'unauthorized edit'
  where id = 'aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'member unexpectedly updated another user project';
  end if;

  delete from public.projects
  where id = 'aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'member unexpectedly deleted another user project';
  end if;
end $$;

insert into public.projects (id, workspace_id, created_by, name)
values ('bbbbbbbb-0000-4000-8000-bbbbbbbbbbbb',
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        '20000000-0000-4000-8000-000000000002', 'B project');

-- Owner removes B. Former member's delete must affect zero rows.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
delete from public.workspace_members
where workspace_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  and user_id = '20000000-0000-4000-8000-000000000002';

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
do $$
declare
  affected integer;
begin
  delete from public.projects
  where id = 'bbbbbbbb-0000-4000-8000-bbbbbbbbbbbb';
  get diagnostics affected = row_count;
  if affected <> 0 then
    raise exception 'removed member unexpectedly deleted project';
  end if;

  if (select count(*) from public.workspaces
      where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 0 then
    raise exception 'removed member still sees workspace';
  end if;
end $$;

-- Owner retains authority to remove the former member's project.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
delete from public.projects where id = 'bbbbbbbb-0000-4000-8000-bbbbbbbbbbbb';

-- Privileged writes must still obey tenant-integrity triggers.
reset role;
do $$
declare
  rejected boolean := false;
begin
  begin
    insert into public.conversations (id, workspace_id, project_id, created_by, title)
    values ('bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb',
            'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            'aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa',
            '10000000-0000-4000-8000-000000000001', 'Cross-tenant');
  exception when others then
    rejected := true;
  end;
  if not rejected then
    raise exception 'cross-workspace conversation/project link was accepted';
  end if;
end $$;

do $$
declare
  rejected boolean := false;
begin
  begin
    insert into public.messages (id, conversation_id, workspace_id, created_by, role, content)
    values ('bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb',
            'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa',
            'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            '10000000-0000-4000-8000-000000000001', 'user', 'cross-tenant');
  exception when others then
    rejected := true;
  end;
  if not rejected then
    raise exception 'cross-workspace message/conversation link was accepted';
  end if;
end $$;

do $$
declare
  rejected boolean := false;
begin
  begin
    update public.projects
    set workspace_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    where id = 'aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa';
  exception when others then
    rejected := true;
  end;
  if not rejected then
    raise exception 'project tenant reassignment was accepted';
  end if;
end $$;

rollback;
