// lib/geminiFallback.ts

import { spawn } from 'child_process';

export async function callGeminiFallbackCLI({ prompt }: { prompt: string }) {
  // This assumes your pnpm Gemini CLI binary path is correct
  const cliPath = '/home/brewexec/.local/share/pnpm/gemini';

  return new Promise<string>((resolve, reject) => {
    const child = spawn(cliPath, [prompt], {
      env: {
        ...process.env,
        // IMPORTANT: do NOT enable MCP tool usage for this fallback
        // We want plain reasoning, not Gemini's own tools.
      },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(
          new Error(`Gemini CLI exited with ${code}: ${stderr || stdout}`)
        );
      }
      resolve(stdout.trim());
    });
  });
}
