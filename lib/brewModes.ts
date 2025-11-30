// lib/brewModes.ts
export type BrewMode = 'hard' | 'soft' | 'rb';

export type BrewModeProfile = {
  id: BrewMode;
  label: string;
  description: string;
  // How cautious this mode should be when BrewTruth says HIGH risk.
  highRiskBehavior: 'block' | 'confirm' | 'warn_then_auto';
};

export const BREW_MODE_PROFILES: Record<BrewMode, BrewModeProfile> = {
  hard: {
    id: 'hard',
    label: 'Hard Stop (Enterprise)',
    description:
      'Strict compliance mode. High-risk actions are blocked unless explicitly overridden.',
    highRiskBehavior: 'block',
  },
  soft: {
    id: 'soft',
    label: 'Soft Stop (Standard)',
    description:
      'Warns on high-risk actions and asks for explicit confirmation before continuing.',
    highRiskBehavior: 'confirm',
  },
  rb: {
    id: 'rb',
    label: 'RB Mode (Power User)',
    description:
      'Warns once, then proceeds if the user insists. Designed for fast, expert workflows.',
    highRiskBehavior: 'warn_then_auto',
  },
};
