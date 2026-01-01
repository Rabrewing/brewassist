#!/usr/bin/env ts-node

import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { resolve } from 'path';

interface LockManifest {
  commitHash: string;
  lockedFiles: Record<string, string>;
  frozenSurfaces: string[];
}

const MANIFEST_PATH = resolve('S4_LOCK_MANIFEST.json');

function calculateSha256(filePath: string): string {
  const fileBuffer = readFileSync(filePath);
  const hashSum = createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function verifyManifest(): boolean {
  try {
    const manifest: LockManifest = JSON.parse(
      readFileSync(MANIFEST_PATH, 'utf8')
    );

    console.log('🔍 Verifying S4 Lock Manifest...');
    console.log(`📋 Commit: ${manifest.commitHash}`);
    console.log(`🎯 Frozen Surfaces: ${manifest.frozenSurfaces.join(', ')}`);
    console.log('');

    let allValid = true;

    for (const [filePath, expectedChecksum] of Object.entries(
      manifest.lockedFiles
    )) {
      const fullPath = resolve(filePath);
      try {
        const actualChecksum = calculateSha256(fullPath);
        if (actualChecksum === expectedChecksum) {
          console.log(`✅ ${filePath}: checksum matches`);
        } else {
          console.log(`❌ ${filePath}: checksum mismatch!`);
          console.log(`   Expected: ${expectedChecksum}`);
          console.log(`   Actual:   ${actualChecksum}`);
          allValid = false;
        }
      } catch (error) {
        console.log(`❌ ${filePath}: file not found or unreadable`);
        allValid = false;
      }
    }

    return allValid;
  } catch (error) {
    console.error('Error reading manifest:', error);
    return false;
  }
}

function updateManifest(): void {
  try {
    const manifest: LockManifest = JSON.parse(
      readFileSync(MANIFEST_PATH, 'utf8')
    );

    console.log('🔄 Updating S4 Lock Manifest checksums...');

    for (const filePath of Object.keys(manifest.lockedFiles)) {
      const fullPath = resolve(filePath);
      const newChecksum = calculateSha256(fullPath);
      manifest.lockedFiles[filePath] = newChecksum;
      console.log(`📝 ${filePath}: ${newChecksum}`);
    }

    writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log('✅ Manifest updated!');
  } catch (error) {
    console.error('Error updating manifest:', error);
  }
}

const args = process.argv.slice(2);

if (args.includes('--update')) {
  updateManifest();
} else {
  const isValid = verifyManifest();
  if (!isValid) {
    console.log('');
    console.log('❌ S4 Lock Manifest verification FAILED!');
    console.log('Use --update to update checksums after intentional changes.');
    process.exit(1);
  } else {
    console.log('');
    console.log('🎉 S4 Lock Manifest verification PASSED!');
  }
}
