#!/usr/bin/env ts-node

import { execSync } from 'child_process';
import { CAPABILITY_REGISTRY } from '../lib/capabilities/registry';

const registryIds = new Set(Object.keys(CAPABILITY_REGISTRY));

console.log('🔍 Auditing capability usage...\n');

// Use grep to find capabilityId usage
try {
  const grepResult = execSync(
    'grep -r "capabilityId:" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ lib/ components/ pages/ 2>/dev/null || true',
    { encoding: 'utf-8' }
  );

  const usedIds = new Set<string>();
  const lines = grepResult.split('\n').filter((line) => line.trim());

  lines.forEach((line) => {
    const match = line.match(/capabilityId:\s*["']([^"']+)["']/);
    if (match) {
      usedIds.add(match[1]);
    }
  });

  console.log(`📋 Found ${usedIds.size} capability IDs in use:`);
  Array.from(usedIds)
    .sort()
    .forEach((id) => console.log(`  - ${id}`));

  const missingIds = Array.from(usedIds).filter((id) => !registryIds.has(id));

  if (missingIds.length > 0) {
    console.log(`\n❌ Missing from registry (${missingIds.length}):`);
    missingIds.forEach((id) => console.log(`  - ${id}`));
    process.exit(1);
  } else {
    console.log('\n✅ All used capability IDs are registered!');
  }
} catch (error) {
  console.error(
    'Error running audit:',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}
