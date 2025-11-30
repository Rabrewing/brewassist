// lib/brewModeServer.ts
import type { BrewMode } from './brewModes';

const DEFAULT_MODE: BrewMode = 'soft';

// TEMP: until we have DB, hard-code RB as `rb`.
// Later this can be keyed by userId / email or config file.
export function getUserMode(userEmailOrId?: string | null): BrewMode {
  if (!userEmailOrId) return DEFAULT_MODE;

  // RB override (you)
  if (
    userEmailOrId === 'brewexec@gmail.com' ||
    userEmailOrId === 'specializedrecruiting22@gmail.com' ||
    userEmailOrId?.toLowerCase().includes('randy')
  ) {
    return 'rb';
  }

  return DEFAULT_MODE;
}
