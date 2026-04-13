import type { SupabaseClient } from '@supabase/supabase-js';

export type BootstrapEnterpriseOrgInput = {
  userId: string;
  orgName: string;
  slug: string;
  workspaceName?: string;
};

type BootstrapOrgRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  created_at: string;
};

type BootstrapWorkspaceRow = {
  id: string;
  name: string;
  org_id: string;
  created_at: string;
};

export async function bootstrapEnterpriseOrg(
  client: SupabaseClient,
  input: BootstrapEnterpriseOrgInput
) {
  let org: BootstrapOrgRow;

  const { data: insertedOrg, error: orgError } = await client
    .from('organizations')
    .insert({
      name: input.orgName,
      slug: input.slug,
      plan: 'free',
      created_by: input.userId,
    })
    .select('id, name, slug, plan, created_at')
    .single();

  if (orgError) {
    if (orgError.code !== '23505') throw orgError;

    const { data: existingOrg, error: existingOrgError } = await client
      .from('organizations')
      .select('id, name, slug, plan, created_at')
      .eq('slug', input.slug)
      .single();

    if (existingOrgError) throw existingOrgError;
    org = existingOrg as BootstrapOrgRow;
  } else {
    org = insertedOrg as BootstrapOrgRow;
  }

  const { error: seedRolesError } = await client.rpc(
    'bootstrap_default_roles',
    {
      target_org_id: org.id,
      actor_id: input.userId,
    }
  );

  if (seedRolesError) throw seedRolesError;

  const { error: membershipError } = await client.from('memberships').upsert(
    {
      org_id: org.id,
      user_id: input.userId,
      role_name: 'owner',
      status: 'active',
      created_by: input.userId,
    },
    {
      onConflict: 'org_id,user_id',
    }
  );

  if (membershipError) throw membershipError;

  const workspaceName = input.workspaceName?.trim();
  let workspace: BootstrapWorkspaceRow | null = null;

  if (workspaceName) {
    const { data: existingWorkspace, error: existingWorkspaceError } =
      await client
        .from('workspaces')
        .select('id, name, org_id, created_at')
        .eq('org_id', org.id)
        .eq('name', workspaceName)
        .maybeSingle();

    if (existingWorkspaceError) throw existingWorkspaceError;

    if (existingWorkspace) {
      workspace = existingWorkspace as BootstrapWorkspaceRow;
    } else {
      const { data: insertedWorkspace, error: workspaceError } = await client
        .from('workspaces')
        .insert({
          org_id: org.id,
          name: workspaceName,
          created_by: input.userId,
        })
        .select('id, name, org_id, created_at')
        .single();

      if (workspaceError) throw workspaceError;
      workspace = insertedWorkspace as BootstrapWorkspaceRow;
    }
  }

  return { org, workspace };
}
