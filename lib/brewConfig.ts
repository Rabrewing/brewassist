// brewassist/lib/brewConfig.ts

import path from "path";

// Root of the BrewAssist repo (top-level directory)
export const BREWASSIST_REPO_ROOT =
  process.env.BREWASSIST_REPO_ROOT || process.cwd();

// Allowed roots for filesystem operations
export const BREWASSIST_ALLOWED_ROOTS = [BREWASSIST_REPO_ROOT];

export function isPathAllowed(targetPath: string): boolean {
  const normalized = path.resolve(targetPath);
  return BREWASSIST_ALLOWED_ROOTS.some((root) =>
    normalized.startsWith(path.resolve(root))
  );
}

export type BrewEnv = {
  repoRoot: string;
  environment: string;
  allowed: { repoRoot: string };
  activeProject: string;
  emoji: string;
  tier: string;
  primaryModel: string;
  fallbackModel: string;
  localModel: string;
};

// Safe defaults so UI cannot break when missing env vars
export function getBrewEnv(): BrewEnv {
  const repoRoot = BREWASSIST_REPO_ROOT;

  return {
    repoRoot,
    environment: process.env.NODE_ENV ?? "development",
    allowed: { repoRoot },

    activeProject:
      process.env.BREWASSIST_ACTIVE_PROJECT ||
      process.env.BREWASSIST_PROJECT_NAME ||
      "brewassist",

    emoji: process.env.BREWASSIST_TIER_EMOJI || "⚡",
    tier: process.env.BREWASSIST_TIER_NAME || "RB Mode",

    primaryModel: process.env.BREWASSIST_PRIMARY_MODEL || "openai",
    fallbackModel: process.env.BREWASSIST_FALLBACK_MODEL || "none",
    localModel: process.env.BREWASSIST_LOCAL_MODEL || "tinyllama",
  };
}