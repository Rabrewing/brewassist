begin;

create table if not exists public.org_identity_providers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider_name text not null,
  protocol text not null,
  status text not null default 'draft',
  domain_hint text,
  issuer text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (org_id, provider_name, protocol)
);

create table if not exists public.domain_verifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  domain text not null,
  verification_method text not null default 'dns',
  verification_token text not null,
  status text not null default 'pending',
  verified_at timestamptz,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (org_id, domain)
);

create table if not exists public.scim_connectors (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'draft',
  base_url text,
  token_last_rotated_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (org_id)
);

create table if not exists public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null default 'stripe',
  external_customer_id text,
  billing_email text,
  status text not null default 'pending',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (org_id, provider)
);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  provider text not null default 'stripe',
  external_subscription_id text,
  plan_code text not null,
  status text not null default 'pending',
  current_period_start timestamptz,
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.billing_event_ledger (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null default 'stripe',
  external_event_id text not null,
  event_type text not null,
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (provider, external_event_id)
);

alter table public.org_identity_providers enable row level security;
alter table public.domain_verifications enable row level security;
alter table public.scim_connectors enable row level security;
alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_event_ledger enable row level security;

create policy "org members can read identity providers"
on public.org_identity_providers
for select
using (public.is_active_org_member(org_id));

create policy "org admins manage identity providers"
on public.org_identity_providers
for all
using (public.has_org_role(org_id, array['owner', 'admin']))
with check (public.has_org_role(org_id, array['owner', 'admin']));

create policy "org members can read domain verifications"
on public.domain_verifications
for select
using (public.is_active_org_member(org_id));

create policy "org admins manage domain verifications"
on public.domain_verifications
for all
using (public.has_org_role(org_id, array['owner', 'admin']))
with check (public.has_org_role(org_id, array['owner', 'admin']));

create policy "org members can read scim connectors"
on public.scim_connectors
for select
using (public.is_active_org_member(org_id));

create policy "org admins manage scim connectors"
on public.scim_connectors
for all
using (public.has_org_role(org_id, array['owner', 'admin']))
with check (public.has_org_role(org_id, array['owner', 'admin']));

create policy "org members can read billing customers"
on public.billing_customers
for select
using (public.is_active_org_member(org_id));

create policy "org admins manage billing customers"
on public.billing_customers
for all
using (public.has_org_role(org_id, array['owner', 'admin']))
with check (public.has_org_role(org_id, array['owner', 'admin']));

create policy "org members can read billing subscriptions"
on public.billing_subscriptions
for select
using (public.is_active_org_member(org_id));

create policy "org admins manage billing subscriptions"
on public.billing_subscriptions
for all
using (public.has_org_role(org_id, array['owner', 'admin']))
with check (public.has_org_role(org_id, array['owner', 'admin']));

create policy "org members can read billing event ledger"
on public.billing_event_ledger
for select
using (public.is_active_org_member(org_id));

create policy "org admins manage billing event ledger"
on public.billing_event_ledger
for all
using (public.has_org_role(org_id, array['owner', 'admin']))
with check (public.has_org_role(org_id, array['owner', 'admin']));

commit;
