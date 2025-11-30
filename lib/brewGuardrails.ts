// File: lib/brewGuardrails.ts
// Phase: 6.3 Create lib/brewGuardrails.ts
// Summary: Enforces safety rules and prevents unauthorized or dangerous operations within the sandbox.

import path from 'path';
import { getSandboxRoot } from './brewSandbox';

/**
 * Checks if a given path is within the designated sandbox root.
 * @param {string} checkPath The path to check.
 * @returns {boolean} True if the path is within the sandbox, false otherwise.
 */
export function isPathSandboxed(checkPath: string): boolean {
  const sandboxRoot = getSandboxRoot();
  const resolvedPath = path.resolve(checkPath); // Resolve to absolute path
  return resolvedPath.startsWith(sandboxRoot);
}

/**
 * Asserts that a given path is within the sandbox root. Throws an error if not.
 * @param {string} checkPath The path to assert.
 * @throws {Error} If the path is outside the sandbox.
 */
export function assertSandboxWrite(checkPath: string): void {
  if (!isPathSandboxed(checkPath)) {
    throw new Error(
      `Sandbox Write Violation: Attempted to write outside sandbox to ${checkPath}`
    );
  }
}

/**
 * Enforces safety rules for tool execution, preventing dangerous commands.
 * @param {string} toolName The name of the tool being executed (e.g., "run_shell", "write_file").
 * @param {unknown} args The arguments passed to the tool.
 * @returns {{ allowed: boolean; reason?: string }} An object indicating if the operation is allowed and a reason if not.
 */
export function enforceToolSafety(
  toolName: string,
  args: unknown
): { allowed: boolean; reason?: string } {
  // Basic checks for dangerous commands
  if (toolName === 'run_shell') {
    const command = Array.isArray(args) ? args[0] : String(args);
    if (
      command.includes('rm -rf') ||
      command.includes('git push') ||
      command.includes('sudo')
    ) {
      return {
        allowed: false,
        reason: `Dangerous command '${command}' blocked by guardrails.`,
      };
    }
    // Further checks could involve parsing the command for specific patterns
  }

  if (toolName === 'write_file') {
    const filePath = Array.isArray(args) ? args[0] : String(args);
    try {
      assertSandboxWrite(filePath); // Ensure write is within sandbox
    } catch (error: any) {
      return { allowed: false, reason: error.message };
    }
  }

  // Add more specific rules as needed for other tools or patterns
  return { allowed: true };
}

// Integration into brewSelfMaintenance and other modules will be done in those files
// by importing and calling these guardrail functions at appropriate points.
