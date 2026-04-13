// File: lib/brewDiffEngine.ts
// Phase: 3.1 Create lib/brewDiffEngine.ts
// Summary: Compares the real repository with its sandbox mirror and generates diffs.

import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { getMirrorRoot, getRunDir } from './brewSandbox';

// Define allowed roots to compare (exact matches only - no patterns)
const DIFF_ALLOWED_ROOTS = [
  'lib',
  // Skip 'pages/api' and 'brewassist_core' for now - too slow
];

export type DiffResult = {
  diffText: string;
  changedFiles: string[];
};

/**
 * Computes the difference between the real repository and its sandbox mirror for a given run.
 * @param {string} runId The ID of the current sandbox run.
 * @returns {Promise<DiffResult>} An object containing the unified diff text and a list of changed files.
 */
export async function computeDiff(runId: string): Promise<DiffResult> {
  const projectRoot =
    process.env.BREW_PROJECT_ROOT || path.resolve(__dirname, '../../');
  const mirrorTargetRoot = getMirrorRoot();
  const runDirectory = getRunDir(runId);

  await fs.mkdir(runDirectory, { recursive: true }); // Ensure run directory exists

  let allDiffText = '';
  const changedFiles: string[] = [];

  for (const root of DIFF_ALLOWED_ROOTS) {
    const realPath = path.join(projectRoot, root);
    const mirrorPath = path.join(mirrorTargetRoot, root);

    // Check if both directories exist before attempting to diff
    let realPathExists = false;
    try {
      await fs.access(realPath);
      realPathExists = true;
    } catch {
      /* TODO: implement */
    }

    let mirrorPathExists = false;
    try {
      await fs.access(mirrorPath);
      mirrorPathExists = true;
    } catch {
      /* TODO: implement */
    }

    if (!realPathExists && !mirrorPathExists) {
      continue; // Neither exists, no diff possible
    }

    // Use git diff --no-index to compare directories or files
    // If one path doesn't exist, git diff --no-index will treat it as empty
    const command = `git diff --no-index "${realPath}" "${mirrorPath}"`;

    try {
      const { stdout, stderr } = await new Promise<{
        stdout: string;
        stderr: string;
      }>((resolve, reject) => {
        exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
          if (error && error.code !== 1) {
            // git diff --no-index returns 1 if differences are found, which is expected
            return reject(error);
          }
          resolve({ stdout, stderr });
        });
      });

      if (stdout) {
        allDiffText += stdout;
        // Parse changed files from diff output (simplified for now)
        const lines = stdout.split('\n');
        lines.forEach((line) => {
          if (line.startsWith('--- a/') || line.startsWith('+++ b/')) {
            const filePath = line.substring(6).trim(); // Remove '--- a/' or '+++ b/'
            if (filePath && !changedFiles.includes(filePath)) {
              changedFiles.push(filePath);
            }
          }
        });
      }
      if (stderr) {
        console.warn(`Stderr from diffing ${root}: ${stderr}`);
      }
    } catch (error) {
      console.error(`Error running diff for ${root}:`, error);
      // Continue to next root even if one fails
    }
  }

  const diffFilePath = path.join(runDirectory, 'diff.txt');
  await fs.writeFile(diffFilePath, allDiffText, 'utf8');

  return { diffText: allDiffText, changedFiles };
}
