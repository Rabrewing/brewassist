begin;

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  plan text not null default 'free',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  permissions jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (org_id, name)
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_name text not null default 'collaborator',
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (org_id, user_id)
);

create table if not exists public.repositories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  external_id text not null,
  full_name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (org_id, provider, external_id)
);

create table if not exists public.repo_connections (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  repo_id uuid not null references public.repositories(id) on delete cascade,
  provider_account_id text not null,
  auth_state jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sandbox_bindings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  repo_id uuid not null references public.repositories(id) on delete cascade,
  sandbox_root text not null,
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (org_id, repo_id)
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  repo_id uuid references public.repositories(id) on delete set null,
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  current_stage text not null default 'intent',
  last_seen_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.runs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  status text not null default 'pending',
  truth_score numeric(5,4),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.run_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  run_id uuid not null references public.runs(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.usage_meter_records (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  run_id uuid references public.runs(id) on delete set null,
  metric_name text not null,
  metric_value numeric not null,
  billed_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.provider_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  key_ref text not null,
  status text not null default 'active',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.policy_rules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  rule_key text not null,
  rule_value jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  run_id uuid not null references public.runs(id) on delete cascade,
  approver_id uuid not null references auth.users(id) on delete cascade,
  decision text not null,
  reason text,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_active_org_member(target_org_id uuid)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = target_org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.has_org_role(
  target_org_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security invoker
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = target_org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role_name = any(allowed_roles)
  );
$$;

alter table public.organizations enable row level security;
alter table public.roles enable row level security;
alter table public.memberships enable row level security;
alter table public.repositories enable row level security;
alter table public.repo_connections enable row level security;
alter table public.sandbox_bindings enable row level security;
alter table public.workspaces enable row level security;
alter table public.sessions enable row level security;
alter table public.runs enable row level security;
alter table public.run_events enable row level security;
alter table public.audit_logs enable row level security;
alter table public.usage_meter_records enable row level security;
alter table public.provider_keys enable row level security;
alter table public.policy_rules enable row level security;
alter table public.approvals enable row level security;

create policy "org members can read orgs"
on public.organizations
for select
using (
  public.is_active_org_member(id)
  or created_by = auth.uid()
);

create policy "org creators can create orgs"
on public.organizations
for insert
with check (created_by = auth.uid());

create policy "org owners and admins can manage orgs"
on public.organizations
for update
using (public.has_org_role(id, array['owner', 'admin']) or created_by = auth.uid())
with check (public.has_org_role(id, array['owner', 'admin']) or created_by = auth.uid());

create policy "org owners can delete orgs"
on public.organizations
for delete
using (public.has_org_role(id, array['owner']) or created_by = auth.uid());

create policy "members can read memberships"
on public.memberships
for select
using (public.is_active_org_member(org_id));

create policy "owners and admins can manage memberships"
on public.memberships
for all
using (public.has_org_role(org_id, array['owner', 'admin']) or created_by = auth.uid())
with check (
  public.has_org_role(org_id, array['owner', 'admin'])
  or (created_by = auth.uid() and user_id = auth.uid())
);

create policy "members can read repositories"
on public.repositories
for select
using (public.is_active_org_member(org_id));

create policy "owners, admins, operators can manage repositories"
on public.repositories
for all
using (public.has_org_role(org_id, array['owner', 'admin', 'operator']) or created_by = auth.uid())
with check (public.has_org_role(org_id, array['owner', 'admin', 'operator']) or created_by = auth.uid());

create policy "members can read repo connections"
on public.repo_connections
for select
using (public.is_active_org_member(org_id));

create policy "owners and admins can manage repo connections"
on public.repo_connections
for all
using (public.has_org_role(org_id, array['owner', 'admin']) or created_by = auth.uid())
with check (public.has_org_role(org_id, array['owner', 'admin']) or created_by = auth.uid());

create policy "members can read sandbox bindings"
on public.sandbox_bindings
for select
using (public.is_active_org_member(org_id));

create policy "owners, admins, operators can manage sandbox bindings"
on public.sandbox_bindings
for all
using (public.has_org_role(org_id, array['owner', 'admin', 'operator']) or created_by = auth.uid())
with check (public.has_org_role(org_id, array['owner', 'admin', 'operator']) or created_by = auth.uid());

create policy "members can read workspaces"
on public.workspaces
for select
using (public.is_active_org_member(org_id));

create policy "owners, admins, operators can manage workspaces"
on public.workspaces
for all
using (public.has_org_role(org_id, array['owner', 'admin', 'operator']) or created_by = auth.uid())
with check (public.has_org_role(org_id, array['owner', 'admin', 'operator']) or created_by = auth.uid());

create policy "members can read sessions they own or share"
on public.sessions
for select
using (public.is_active_org_member(org_id) and (user_id = auth.uid() or public.has_org_role(org_id, array['owner', 'admin', 'operator'])))
;

create policy "members can create sessions"
on public.sessions
for insert
with check (created_by = auth.uid() and user_id = auth.uid() and public.is_active_org_member(org_id));

create policy "members can update their sessions"
on public.sessions
for update
using (created_by = auth.uid() or public.has_org_role(org_id, array['owner', 'admin', 'operator']))
with check (created_by = auth.uid() or public.has_org_role(org_id, array['owner', 'admin', 'operator']));

create policy "members can read runs"
on public.runs
for select
using (public.is_active_org_member(org_id));

create policy "owners, admins, operators can manage runs"
on public.runs
for all
using (public.has_org_role(org_id, array['owner', 'admin', 'operator']) or created_by = auth.uid())
with check (public.has_org_role(org_id, array['owner', 'admin', 'operator']) or created_by = auth.uid());

create policy "members can read run events"
on public.run_events
for select
using (public.is_active_org_member(org_id));

create policy "members can append run events"
on public.run_events
for insert
with check (created_by = auth.uid() and public.is_active_org_member(org_id));

create policy "admins can read audit logs"
on public.audit_logs
for select
using (public.has_org_role(org_id, array['owner', 'admin']));

create policy "service and app users can append audit logs"
on public.audit_logs
for insert
with check (auth.uid() is not null or current_setting('role', true) = 'service_role');

create policy "billing viewers can read usage records"
on public.usage_meter_records
for select
using (public.has_org_role(org_id, array['owner', 'admin']) or created_by = auth.uid());

create policy "owners and admins can manage usage records"
on public.usage_meter_records
for all
using (public.has_org_role(org_id, array['owner', 'admin']) or created_by = auth.uid())
with check (public.has_org_role(org_id, array['owner', 'admin']) or created_by = auth.uid());

create policy "owners and admins can read provider keys"
on public.provider_keys
for select
using (public.has_org_role(org_id, array['owner', 'admin']));

create policy "owners and admins can manage provider keys"
on public.provider_keys
for all
using (public.has_org_role(org_id, array['owner', 'admin']) or created_by = auth.uid())
with check (public.has_org_role(org_id, array['owner', 'admin']) or created_by = auth.uid());

create policy "owners and admins can read policy rules"
on public.policy_rules
for select
using (public.has_org_role(org_id, array['owner', 'admin']));

create policy "owners and admins can manage policy rules"
on public.policy_rules
for all
using (public.has_org_role(org_id, array['owner', 'admin']) or created_by = auth.uid())
with check (public.has_org_role(org_id, array['owner', 'admin']) or created_by = auth.uid());

create policy "members can read approvals"
on public.approvals
for select
using (public.is_active_org_member(org_id));

create policy "operators and admins can create approvals"
on public.approvals
for insert
with check (
  public.has_org_role(org_id, array['owner', 'admin', 'operator'])
  or approver_id = auth.uid()
);

commit;
