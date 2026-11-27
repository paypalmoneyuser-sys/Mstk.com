-- PostgreSQL integration smoke tests for MSTK migrations 0001-0006.
-- This script is executed as the database owner, then switches to authenticated
-- role with distinct JWT subject claims to exercise RLS policies.

\set ON_ERROR_STOP on
begin;

insert into auth.users (id) values
  ('10000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002')
on conflict do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

insert into public.workspaces (id, name, owner_id)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Workspace A', '10000000-0000-4000-8000-000000000001');

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

-- Owner A invites B as a member.
insert into public.workspace_members (workspace_id, user_id, role)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        '20000000-0000-4000-8000-000000000002', 'member');

-- Switch JWT identity to B. B must not see A's workspace until invited;
-- after invitation B can see it and create their own project.
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);

do $$
begin
  if (select count(*) from public.workspaces
      where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa') <> 1 then
    raise exception 'invited member cannot see workspace';
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
end $$;

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
            '20000000-0000-4000-8000-000000000002', 'Cross-tenant');
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
