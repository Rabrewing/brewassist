// lib/brewlast/write.ts

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import type { BrewLastData, BrewLastOptions } from './types';
import { readBrewLast } from './read';

const BREWLAST_FILE = '.brewlast.json';

export function writeBrewLast(
  data: Partial<BrewLastData>,
  options: BrewLastOptions = {},
  cwd: string = process.cwd()
): boolean {
  const { allowCustomerWrites = false } = options;

  // Gate writes in customer mode unless explicitly allowed
  if (!allowCustomerWrites && data.lastMode === 'customer') {
    console.warn('BrewLast writes are gated in customer mode');
    return false;
  }

  try {
    // Read existing data and merge
    const existing = readBrewLast(cwd) || {
      version: '1.0',
      updatedAt: new Date().toISOString(),
    };
    const merged: BrewLastData = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
      version: '1.0', // Lock to v1 for now
    };

    // Ensure directory exists
    const filePath = join(cwd, BREWLAST_FILE);
    const dir = dirname(filePath);
    mkdirSync(dir, { recursive: true });

    // Write atomically
    writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing BrewLast file:', error);
    return false;
  }
}

export function updateLastMode(
  mode: 'admin' | 'customer',
  cwd?: string
): boolean {
  return writeBrewLast({ lastMode: mode }, {}, cwd);
}

export function updateLastPane(pane: string, cwd?: string): boolean {
  return writeBrewLast({ lastPane: pane }, {}, cwd);
}

export function updateLastActivity(cwd?: string): boolean {
  return writeBrewLast({ lastActivity: new Date().toISOString() }, {}, cwd);
}
