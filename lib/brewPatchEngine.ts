// File: lib/brewPatchEngine.ts
// Phase: 3.2 Create lib/brewPatchEngine.ts
// Summary: Manages the creation of patch bundles and associated metadata.

import path from 'path';
import fs from 'fs/promises';
import { getRunDir } from './brewSandbox';

export type PatchBundleMeta = {
  runId: string;
  changedFiles: string[];
  createdAt: string;
  patchPath: string;
  metadataPath: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'; // Appended later by analyzer
  truthScore?: number; // Appended later by analyzer
};

/**
 * Creates a patch bundle including the diff file and metadata.
 * @param {string} runId The ID of the current sandbox run.
 * @param {object} input Input containing diff text and changed files.
 * @param {string} [input.diffText] The unified diff content. If not provided, it will attempt to read from diff.txt.
 * @param {string[]} [input.changedFiles] A list of files that were changed.
 * @returns {Promise<PatchBundleMeta>} Metadata about the created patch bundle.
 */
export async function createPatchBundle(
  runId: string,
  input: { diffText?: string; changedFiles?: string[] }
): Promise<PatchBundleMeta> {
  const runDirectory = getRunDir(runId);
  await fs.mkdir(runDirectory, { recursive: true }); // Ensure run directory exists

  let diffContent = input.diffText;
  if (!diffContent) {
    const diffFilePath = path.join(runDirectory, 'diff.txt');
    try {
      diffContent = await fs.readFile(diffFilePath, 'utf8');
    } catch (error) {
      console.error(`Failed to read diff.txt for run ${runId}:`, error);
      diffContent = ''; // Default to empty if not found
    }
  }

  const patchFilePath = path.join(runDirectory, 'patch.diff');
  await fs.writeFile(patchFilePath, diffContent, 'utf8');

  const metadata: PatchBundleMeta = {
    runId,
    changedFiles: input.changedFiles || [],
    createdAt: new Date().toISOString(),
    patchPath: patchFilePath,
    metadataPath: '', // Will be set below
  };

  const metadataFilePath = path.join(runDirectory, 'metadata.json');
  await fs.writeFile(
    metadataFilePath,
    JSON.stringify(metadata, null, 2),
    'utf8'
  );
  metadata.metadataPath = metadataFilePath; // Update metadata with its own path

  return metadata;
}
