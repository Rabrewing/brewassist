// lib/brewlast/read.ts

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { BrewLastData } from './types';

const BREWLAST_FILE = '.brewlast.json';

export function readBrewLast(cwd: string = process.cwd()): BrewLastData | null {
  const filePath = join(cwd, BREWLAST_FILE);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content) as BrewLastData;

    // Basic validation
    if (!data.updatedAt || !data.version) {
      console.warn('BrewLast file is missing required fields');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading BrewLast file:', error);
    return null;
  }
}

export function getLastMode(cwd?: string): 'admin' | 'customer' | null {
  const data = readBrewLast(cwd);
  return data?.lastMode || null;
}

export function getLastPane(cwd?: string): string | null {
  const data = readBrewLast(cwd);
  return data?.lastPane || null;
}

export function getLastActivity(cwd?: string): Date | null {
  const data = readBrewLast(cwd);
  return data?.lastActivity ? new Date(data.lastActivity) : null;
}
