// File: lib/brewSandboxMirror.ts
// Phase: 2.1 Create lib/brewSandboxMirror.ts
// Summary: Manages the creation and synchronization of a mirrored repository within the sandbox.

import * as path from 'path';
import * as fs from 'fs/promises';
import { getSandboxRoot, getMirrorRoot } from './brewSandbox';

// Define allowed roots to mirror from the real repository
const MIRROR_ALLOWED_ROOTS = [
  'lib',
  'pages/api',
  'brewassist_core',
  'overlays',
];

export type MirrorSummary = {
  filesCopied: number;
  rootsIncluded: string[];
  durationMs: number;
};

/**
 * Maps a real repository file path to its corresponding sandbox mirror path.
 * @param {string} srcPath The absolute path to the source file in the real repository.
 * @param {string} runId The ID of the current sandbox run.
 * @returns {string} The absolute path to the mirrored file within the sandbox.
 * @throws {Error} If the source path is not within an allowed root.
 */
export function getMirrorPath(srcPath: string, runId: string): string {
  const projectRoot =
    process.env.BREW_PROJECT_ROOT || path.resolve(__dirname, '../../');
  const relativeSrcPath = path.relative(projectRoot, srcPath);

  const allowedRoot = MIRROR_ALLOWED_ROOTS.find((root) =>
    relativeSrcPath.startsWith(root)
  );
  if (!allowedRoot) {
    throw new Error(`File ${srcPath} is not within an allowed mirroring root.`);
  }

  return path.join(getMirrorRoot(), relativeSrcPath);
}

/**
 * Copies a single file from the real repository to its corresponding sandbox mirror path.
 * @param {string} srcPath The absolute path to the source file in the real repository.
 * @param {string} runId The ID of the current sandbox run.
 * @returns {Promise<void>}
 */
export async function syncFileToMirror(
  srcPath: string,
  runId: string
): Promise<void> {
  const destPath = getMirrorPath(srcPath, runId);
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.copyFile(srcPath, destPath);
}

/**
 * Builds a mirrored copy of specified parts of the real repository within the sandbox.
 * @param {string} runId The ID of the current sandbox run.
 * @param {"full" | "partial"} mode The mirroring mode. "full" copies all allowed roots.
 * @returns {Promise<MirrorSummary>} A summary of the mirroring operation.
 */
export async function buildMirror(
  runId: string,
  mode: 'full' | 'partial'
): Promise<MirrorSummary> {
  const startTime = Date.now();
  let filesCopied = 0;
  const projectRoot =
    process.env.BREW_PROJECT_ROOT || path.resolve(__dirname, '../../');

  const mirrorTargetRoot = getMirrorRoot();
  await fs.mkdir(mirrorTargetRoot, { recursive: true });

  for (const root of MIRROR_ALLOWED_ROOTS) {
    const sourceRoot = path.join(projectRoot, root);
    const targetRoot = path.join(mirrorTargetRoot, root);

    try {
      // Recursively copy directory contents
      await fs.cp(sourceRoot, targetRoot, { recursive: true, force: true });
      // TODO: Implement a more granular file counting if needed, fs.cp doesn't return count directly
      // For now, we'll just count directories copied.
      filesCopied++; // This is a placeholder, actual file count would require walking the dir
    } catch (error) {
      console.warn(`Could not mirror root ${root}: ${error}`);
    }
  }

  const durationMs = Date.now() - startTime;
  return {
    filesCopied, // This count is currently inaccurate, needs refinement if exact file count is critical
    rootsIncluded: MIRROR_ALLOWED_ROOTS,
    durationMs,
  };
}
