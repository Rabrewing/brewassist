// brewassist/lib/brewConfig.ts

import path from "path";
import { Persona } from "./brewIdentityEngine"; // Import Persona

export const DEFAULT_PERSONA: any = {
  name: "BrewAssist",
  version: "S4.8c",
  role: "devops_copilot",
  tone: "direct_supportive",
  audience: "dev_or_vibe_coder",
  ownerName: "Randy Brewington",
  orgName: "Brewington Exec Group Inc.",
};

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

import { BrewModelRole } from "./model-router"; // Import BrewModelRole

export type BrewEnv = {
  repoRoot: string;
  environment: string;
  allowed: { repoRoot: string };
  activeProject: string;
  emoji: string;
  tier: string;
  primaryProvider: "gemini" | "openai"; // New field
  defaultRole: BrewModelRole; // New field
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

    primaryProvider: (process.env.BREWASSIST_PRIMARY_PROVIDER as "gemini" | "openai") || "gemini", // Default to gemini
    defaultRole: (process.env.BREWASSIST_DEFAULT_ROLE as BrewModelRole) || "mini", // Default to mini
  };
}