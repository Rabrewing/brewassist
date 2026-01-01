// Frozen surfaces that cannot be modified via BrewDocs
const FROZEN_SURFACES = [
  'lib/capabilities/registry.ts',
  'lib/toolbelt/handshake.ts',
  'lib/brewIdentityEngine.ts',
  'components/WorkspaceSidebarRight.tsx',
  'lib/devops/tabs/DevOpsTabRegistry.ts',
  'lib/devops8/semantics.ts',
];

export function validateDiff(
  diff: string,
  targetFile: string
): { valid: boolean; reason?: string } {
  // Check if target file is frozen
  if (FROZEN_SURFACES.includes(targetFile)) {
    return {
      valid: false,
      reason: `Target file '${targetFile}' is S4 frozen surface`,
    };
  }

  // Parse diff for any changes to frozen surfaces
  const lines = diff.split('\n');
  for (const line of lines) {
    if (line.startsWith('+++ b/') || line.startsWith('--- a/')) {
      const file = line.substring(6);
      if (FROZEN_SURFACES.includes(file)) {
        return {
          valid: false,
          reason: `Diff modifies frozen surface '${file}'`,
        };
      }
    }
  }

  return { valid: true };
}
