// lib/geminiCli.ts
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Runs the local Gemini CLI and returns stdout as a string.
 * Relies on GEMINI_CLI_PATH in .env.* or `gemini` on PATH.
 */
export async function runGeminiCli(prompt: string): Promise<string> {
  const bin = process.env.GEMINI_CLI_PATH || 'gemini';
  const safePrompt = prompt.replace(/"/g, '\\"');
  const command = `${bin} "${safePrompt}"`;

  const { stdout, stderr } = await execAsync(command, {
    maxBuffer: 1024 * 1024,
    timeout: 60_000,
    env: process.env,
  });

  if (stderr && stderr.trim().length > 0) {
    // Log but don’t break if Gemini writes warnings to stderr
    console.error('Gemini CLI stderr:', stderr);
  }

  const out = stdout.trim();
  if (!out) {
    throw new Error('Gemini CLI returned empty output');
  }
  return out;
}

// Fallback helper for BrewAssist engine chain.
// Used when Toolbelt + OpenAI fail and we want
// a reasoning-only response from Gemini CLI.
export async function callGeminiFallbackCLI(args: {
  prompt: string;
}): Promise<string> {
  const text = await runGeminiCli(args.prompt);
  return typeof text === 'string' ? text : String(text ?? '');
}
