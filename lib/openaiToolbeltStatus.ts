// lib/openaiToolbeltStatus.ts

export type ToolbeltStatus = {
  tiers: number[];
  coreTools: string[];
};

export function getToolbeltStatus(): ToolbeltStatus {
  // You can later wire this to a real registry of tools & tiers.
  return {
    tiers: [1, 2, 3],
    coreTools: [
      'write_file',
      'read_file',
      'list_dir',
      'run_shell',
      'git_status',
      'run_lint',
      // Tier 3+ tools can be added here later as the Toolbelt grows.
    ],
  };
}
