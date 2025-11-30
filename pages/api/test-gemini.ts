import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'node:child_process'; // Change from execFile to exec
import { promisify } from 'node:util';

const execAsync = promisify(exec); // Change from execFileAsync to execAsync

async function runGeminiDirect(prompt: string): Promise<string> {
  const bin = process.env.GEMINI_CLI_PATH;
  const command = `${bin} "${prompt.replace(/"/g, '\\"')}"`; // Construct full command string
  try {
    const { stdout, stderr } = await execAsync(command, {
      // Use execAsync
      maxBuffer: 1024 * 1024,
      timeout: 60_000,
      env: { ...process.env }, // Explicitly add pnpm bin to PATH
    });
    if (stderr) {
      console.error('Gemini stderr:', stderr);
    }
    return stdout.trim() || 'Gemini returned an empty response.';
  } catch (error: any) {
    console.error('Error running Gemini direct:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2)); // Log full error object
    throw new Error(`Gemini direct call failed: ${error.message || error}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body as { prompt?: string };

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  try {
    const output = await runGeminiDirect(prompt);
    res.status(200).json({ output, engine: 'gemini' });
  } catch (err: any) {
    res.status(500).json({ error: String(err?.message || err) });
  }
}
