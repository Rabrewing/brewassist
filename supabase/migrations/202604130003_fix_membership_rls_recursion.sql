begin;

create or replace function public.is_active_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
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
security definer
set search_path = public
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

drop policy if exists "members can read memberships" on public.memberships;

create policy "members can read memberships"
on public.memberships
for select
using (
  user_id = auth.uid()
  or public.has_org_role(org_id, array['owner', 'admin'])
);

commit;
