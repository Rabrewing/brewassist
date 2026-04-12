// pages/api/edit-file.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'node:path';
import { promises as fs } from 'node:fs';

import { callOpenAI } from '@/lib/openaiEngine';
import { logToolRun } from '@/lib/brewLastServer';
import type { BrewLastToolRun } from '@/lib/brewLast';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import { canWriteFiles } from '@/lib/permissions';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const enterpriseContext = parseEnterpriseContext(req);

    if (!canWriteFiles(enterpriseContext)) {
      return res
        .status(403)
        .json({ error: 'File edits require admin mode and write permission' });
    }

    const { path: relPath, instructions } = req.body as {
      path?: string;
      instructions?: string;
    };

    if (!relPath || !relPath.trim()) {
      return res.status(400).json({ error: 'Missing file path' });
    }

    if (!instructions || !instructions.trim()) {
      return res.status(400).json({ error: 'Missing edit instructions' });
    }

    const cleanPath = relPath.trim();
    const cleanInstructions = instructions.trim();

    const root = process.cwd();
    const absPath = path.resolve(root, cleanPath);

    // Guardrail: stay inside repo root
    const allowedRoot = path.resolve(process.cwd());
    if (!absPath.startsWith(allowedRoot)) {
      return res
        .status(400)
        .json({ error: 'Path is outside project root – blocked for safety' });
    }

    // Read original file content
    let original = '';
    try {
      original = await fs.readFile(absPath, 'utf8');
    } catch (err: any) {
      if (err?.code === 'ENOENT') {
        return res.status(404).json({ error: `File not found: ${cleanPath}` });
      }
      throw err;
    }

    // Build editor prompt for ChatG (OpenAI)
    const editorPrompt = `
You are BrewAssist, the code editor inside the BrewExec DevOps Cockpit.

The user will give you a source file and some instructions.
Return ONLY the full updated source file content.
Do NOT wrap it in backticks.
Do NOT add commentary, explanations, or markdown.
Just return the revised file exactly as it should appear on disk.

File path: ${cleanPath}

User instructions:
${cleanInstructions}

Current file content:
\
${original}
\

`.trim();

    const result = await callOpenAI(editorPrompt);

    const proposedRaw = result.output || '';
    const proposed = proposedRaw.trim();

    if (!proposed) {
      return res.status(500).json({
        error: 'Editor engine returned an empty patch',
      });
    }

    // NOTE: This is a simulated tool run, as the edit is not yet applied.
    // The actual file write happens after user confirmation in a different step.
    const now = new Date().toISOString();
    const toolRun: BrewLastToolRun = {
      id: `${now}-edit-file`,
      tool: 'write_file',
      args: {
        path: cleanPath,
        content: proposed, // The proposed content
        instructions: cleanInstructions,
      },
      cwd: root,
      timestamp: now,
      summary: `Propose edit for ${cleanPath}`,
      ok: true, // We successfully generated a proposal
      stdout: `Proposed change for ${cleanPath}. Awaiting user confirmation to apply.`,
    };

    await logToolRun(toolRun);

    return res.status(200).json({
      ok: true,
      toolRun,
      // For compatibility with older UI that might expect a 'task' object
      task: {
        patch: {
          path: cleanPath,
          original,
          proposed,
        },
      },
    });
  } catch (err: any) {
    console.error('edit-file handler error', err);
    return res.status(500).json({
      error: 'Edit-file handler failed',
      detail: String(err?.message || err),
    });
  }
}
