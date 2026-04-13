begin;

create index if not exists memberships_org_id_idx on public.memberships (org_id);
create index if not exists memberships_user_id_idx on public.memberships (user_id);
create index if not exists roles_org_id_idx on public.roles (org_id);
create index if not exists repositories_org_id_idx on public.repositories (org_id);
create index if not exists repo_connections_org_id_idx on public.repo_connections (org_id);
create index if not exists sandbox_bindings_org_id_idx on public.sandbox_bindings (org_id);
create index if not exists workspaces_org_id_idx on public.workspaces (org_id);
create index if not exists sessions_org_id_idx on public.sessions (org_id);
create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists runs_org_id_idx on public.runs (org_id);
create index if not exists runs_workspace_id_idx on public.runs (workspace_id);
create index if not exists run_events_org_id_idx on public.run_events (org_id);
create index if not exists run_events_run_id_idx on public.run_events (run_id);
create index if not exists audit_logs_org_id_idx on public.audit_logs (org_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists usage_meter_records_org_id_idx on public.usage_meter_records (org_id);
create index if not exists provider_keys_org_id_idx on public.provider_keys (org_id);
create index if not exists policy_rules_org_id_idx on public.policy_rules (org_id);
create index if not exists approvals_org_id_idx on public.approvals (org_id);

create or replace function public.bootstrap_default_roles(
  target_org_id uuid,
  actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.roles (org_id, name, permissions, created_by)
  values
    (
      target_org_id,
      'owner',
      jsonb_build_object(
        'manage_org', true,
        'manage_billing', true,
        'manage_memberships', true,
        'manage_repos', true,
        'manage_policies', true,
        'approve_runs', true
      ),
      actor_id
    ),
    (
      target_org_id,
      'admin',
      jsonb_build_object(
        'manage_org', true,
        'manage_billing', false,
        'manage_memberships', true,
        'manage_repos', true,
        'manage_policies', true,
        'approve_runs', true
      ),
      actor_id
    ),
    (
      target_org_id,
      'operator',
      jsonb_build_object(
        'manage_org', false,
        'manage_billing', false,
        'manage_memberships', false,
        'manage_repos', false,
        'manage_policies', false,
        'approve_runs', true,
        'execute_runs', true
      ),
      actor_id
    ),
    (
      target_org_id,
      'collaborator',
      jsonb_build_object(
        'manage_org', false,
        'manage_billing', false,
        'manage_memberships', false,
        'manage_repos', false,
        'manage_policies', false,
        'approve_runs', false,
        'execute_runs', false,
        'comment', true
      ),
      actor_id
    ),
    (
      target_org_id,
      'customer',
      jsonb_build_object(
        'manage_org', false,
        'manage_billing', false,
        'manage_memberships', false,
        'manage_repos', false,
        'manage_policies', false,
        'approve_runs', false,
        'execute_runs', false,
        'comment', false
      ),
      actor_id
    )
  on conflict (org_id, name) do update
    set permissions = excluded.permissions;
end;
$$;

comment on function public.bootstrap_default_roles(uuid, uuid)
is 'Seeds the canonical org role set for enterprise onboarding.';

commit;
