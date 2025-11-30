// lib/brewConfig.ts
// Central place to read BrewExec env config (project, tier, models).

export type BrewEnv = {
  activeProject: string;
  tier: string;
  emoji: string;
  primaryModel: string;
  fallbackModel: string;
  localModel: string;
};

/**
 * getBrewEnv()
 * Reads values from NEXT_PUBLIC_* (browser) with server-side fallback.
 */
export function getBrewEnv(): BrewEnv {
  const activeProject =
    process.env.NEXT_PUBLIC_BREW_ACTIVE_PROJECT ||
    process.env.BREW_ACTIVE_PROJECT ||
    'brewexec';

  const tier =
    process.env.NEXT_PUBLIC_BREWPULSE_TIER ||
    process.env.BREWPULSE_TIER ||
    'shimmer';

  const emoji =
    process.env.NEXT_PUBLIC_BREWPULSE_EMOJI ||
    process.env.BREWPULSE_EMOJI ||
    '✨';

  const primaryModel =
    process.env.NEXT_PUBLIC_BREW_MODEL_PRIMARY ||
    process.env.BREW_MODEL_PRIMARY ||
    'gemini';

  const fallbackModel =
    process.env.NEXT_PUBLIC_BREW_MODEL_FALLBACK ||
    process.env.BREW_MODEL_FALLBACK ||
    'mistral';

  const localModel =
    process.env.NEXT_PUBLIC_BREW_MODEL_LOCAL ||
    process.env.BREW_MODEL_LOCAL ||
    'tinyllama';

  return {
    activeProject,
    tier,
    emoji,
    primaryModel,
    fallbackModel,
    localModel,
  };
}
