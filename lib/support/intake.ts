import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { SupportEvent } from './types';

const SUPPORT_DIR = '.brewassist/support';

export function captureSupportEvent(
  event: Omit<SupportEvent, 'id' | 'timestamp'>
): SupportEvent {
  mkdirSync(SUPPORT_DIR, { recursive: true });

  const supportEvent: SupportEvent = {
    ...event,
    id: `support-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  const filePath = join(SUPPORT_DIR, `${supportEvent.id}.json`);
  writeFileSync(filePath, JSON.stringify(supportEvent, null, 2));

  return supportEvent;
}

export function resolveSupportEvent(id: string, resolution: string): boolean {
  // Find and update the event
  // Simplified - in practice, read and update
  return true;
}
