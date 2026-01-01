import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface LedgerEntry {
  id: string;
  proposalId: string;
  appliedBy: string;
  approvedBy: string;
  targetFile: string;
  hashBefore: string;
  hashAfter: string;
  diff: string;
  rationale: string;
  timestamp: string;
}

const LEDGER_DIR = '.brewdocs/ledger';

export function recordApplication(
  entry: Omit<LedgerEntry, 'id' | 'timestamp'>
): void {
  mkdirSync(LEDGER_DIR, { recursive: true });

  const ledgerEntry: LedgerEntry = {
    ...entry,
    id: `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };

  const filePath = join(LEDGER_DIR, `${ledgerEntry.id}.json`);
  writeFileSync(filePath, JSON.stringify(ledgerEntry, null, 2));
}

export function getLedgerEntries(limit: number = 50): LedgerEntry[] {
  try {
    const files = require('fs')
      .readdirSync(LEDGER_DIR)
      .filter((f: string) => f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, limit);

    return files.map((f: string) => {
      const content = readFileSync(join(LEDGER_DIR, f), 'utf8');
      return JSON.parse(content) as LedgerEntry;
    });
  } catch {
    return [];
  }
}

export function verifyLedgerEntry(entry: LedgerEntry): boolean {
  // Verify hashes match the recorded diff
  // Simplified - in practice, recompute hashes
  return true; // Placeholder
}
