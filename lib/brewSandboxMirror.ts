// File: lib/brewSandboxMirror.ts
// Phase: 2.1 Create lib/brewSandboxMirror.ts
// Summary: Manages the creation and synchronization of a mirrored repository within the sandbox.

import * as path from 'path';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getSandboxRoot, getMirrorRoot } from './brewSandbox';

const execAsync = promisify(exec);

// Define allowed roots to mirror from the real repository (exact matches only - no patterns)
const MIRROR_ALLOWED_ROOTS = [
  'lib',
  // Skip 'pages/api', 'brewassist_core', 'overlays' for now - too slow / too broad
];

export type MirrorSummary = {
  filesCopied: number;
  rootsIncluded: string[];
  durationMs: number;
};

export type RemoteBindingSummary = {
  repoFullName: string;
  sandboxPath: string;
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

/**
 * Clones a remote repository into the sandbox mirror directory.
 * @param provider The repository provider ('github', 'gitlab', 'bitbucket').
 * @param repoFullName The full name of the repository (e.g., 'rabrewing/brewassist').
 * @param token The OAuth token for authentication.
 * @returns {Promise<RemoteBindingSummary>} A summary of the binding operation.
 */
export async function bindRemoteSandbox(
  provider: string,
  repoFullName: string,
  token: string
): Promise<RemoteBindingSummary> {
  const startTime = Date.now();
  const mirrorTargetRoot = getMirrorRoot();
  
  // Create a provider-specific and repo-specific directory inside the mirror
  const targetDir = path.join(mirrorTargetRoot, provider, repoFullName);
  
  // Clean up any existing directory to ensure a fresh clone
  await fs.rm(targetDir, { recursive: true, force: true }).catch(() => {});
  await fs.mkdir(path.dirname(targetDir), { recursive: true });

  let cloneUrl = '';
  
  if (provider === 'github') {
    // Construct authenticated clone URL for GitHub
    cloneUrl = `https://oauth2:${token}@github.com/${repoFullName}.git`;
  } else if (provider === 'gitlab') {
    // Construct authenticated clone URL for GitLab
    cloneUrl = `https://oauth2:${token}@gitlab.com/${repoFullName}.git`;
  } else if (provider === 'bitbucket') {
    // Construct authenticated clone URL for Bitbucket (OAuth2 uses x-token-auth)
    cloneUrl = `https://x-token-auth:${token}@bitbucket.org/${repoFullName}.git`;
  } else {
    throw new Error(`Provider ${provider} is not yet supported for sandbox binding.`);
  }

  try {
    // We use shallow clone (--depth 1) to make the sandbox binding extremely fast
    await execAsync(`git clone --depth 1 "${cloneUrl}" "${targetDir}"`);
    
    // We want to avoid logging the clone URL because it contains the token
  } catch (error: any) {
    // Sanitize the error message to remove the token before throwing
    const sanitizedMsg = error.message ? error.message.replace(cloneUrl, 'https://***@github.com/...') : 'Failed to clone repository';
    throw new Error(`Sandbox binding failed: ${sanitizedMsg}`);
  }

  return {
    repoFullName,
    sandboxPath: targetDir,
    durationMs: Date.now() - startTime,
  };
}
