import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { logToolRun } from '@/lib/brewLastServer';
import {
  applyPersonalityLayer,
  initPersonalityState,
  BrewRiskMode,
} from '../../lib/brewassistPersonality';
import { decideRisk, RiskLevel } from '../../lib/brewassistRiskEngine';
import { getUserMode } from '../../lib/brewModeServer';
import { BREWASSIST_REPO_ROOT, isPathAllowed } from '../../lib/brewConfig';
import { getMirrorRoot } from '../../lib/brewSandbox';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';

const PROJECT_ROOT_ENV = 'BREW_PROJECT_ROOT';

type BrewToolName =
  | 'read_file'
  | 'write_file'
  | 'list_dir'
  | 'search_code'
  | 'run_shell'
  | 'git_status'
  | 'run_tests'
  | 'run_lint'
  | 'run_typecheck'
  | 'brew_status_snapshot'
  | 'brew_open_last_action'
  | 'brew_log_update';

type ToolRequestBody = {
  tool: BrewToolName;
  args?: string[];
  stdin?: string;
  userPrompt?: string;
  userId?: string;
};

// Helper to determine the correct sandbox mirror path or fallback
function resolveToolPath(req: NextApiRequest, relativePath: string): string {
  const enterpriseContext = parseEnterpriseContext(req);
  let basePath = BREWASSIST_REPO_ROOT;
  
  if (enterpriseContext.repoProvider && enterpriseContext.repoProvider !== 'local' && enterpriseContext.repoRoot) {
    const mirrorTargetRoot = getMirrorRoot();
    basePath = path.join(mirrorTargetRoot, enterpriseContext.repoProvider, enterpriseContext.repoRoot);
  }
  
  // Clean relative path
  const cleanRel = (relativePath || '.').replace(/^\/+/, '');
  return path.join(basePath, cleanRel);
}

function runScript(
  scriptName: string,
  args: string[] = [],
  stdin?: string
): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const projectRoot = process.env[PROJECT_ROOT_ENV] || process.cwd();
    const scriptPath = path.join(projectRoot, 'overlays', scriptName);

    const child = spawn(scriptPath, args, {
      cwd: projectRoot,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        code: code ?? 0,
      });
    });

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as ToolRequestBody;

  if (!body?.tool) {
    return res.status(400).json({ error: 'Missing tool name' });
  }

  const userPrompt = body.userPrompt || '';
  const userId = body.userId || 'default_user';
  const requestedToolName = body.tool;

  const personalityState = initPersonalityState({
    config: {
      mode: getUserMode(userId) as BrewRiskMode,
      devName: 'RB',
      maxContextMessages: 10,
    },
  });

  const personality = applyPersonalityLayer({
    userPrompt,
    toolName: requestedToolName,
    lastToolSummary: undefined,
    state: personalityState,
  });

  const riskDecision = decideRisk({
    mode: personality.meta.mode,
    toneHint: personality.toneHint,
    userPrompt,
    toolName: requestedToolName,
  });

  if (!riskDecision.allow) {
    await logToolRun({
      id: `${Date.now()}-risk-gate-${requestedToolName}`,
      tool: requestedToolName,
      args: body.args,
      cwd: process.env.BREW_PROJECT_ROOT || process.cwd(),
      timestamp: new Date().toISOString(),
      exitCode: 1,
      stdout: '',
      stderr: riskDecision.messageToUser || 'Action blocked by risk engine.',
      summary: `Blocked by risk engine: ${riskDecision.evaluation.level}`,
      ok: false,
    });

    return res.status(200).json({
      ok: false,
      blocked: true,
      risk: riskDecision.evaluation,
      message: riskDecision.messageToUser,
    });
  }

  try {
    let result = { stdout: '', stderr: '', code: 0 };

    // --- Native Node.js Tool Implementations for Sandbox ---
    if (body.tool === 'read_file') {
      const targetFile = resolveToolPath(req, body.args?.[0] || '');
      try {
        const content = await fs.readFile(targetFile, 'utf8');
        result.stdout = content;
      } catch (e: any) {
        result.code = 1;
        result.stderr = `Error reading file: ${e.message}`;
      }
    } 
    else if (body.tool === 'write_file') {
      const targetFile = resolveToolPath(req, body.args?.[0] || '');
      const content = body.stdin || '';
      try {
        await fs.mkdir(path.dirname(targetFile), { recursive: true });
        await fs.writeFile(targetFile, content, 'utf8');
        result.stdout = `File written successfully to ${body.args?.[0]}`;
        // Note: For Phase 2 of Apply Loop, we should trigger a UI refresh here
        // We'll add a specific header or return property to notify the client
      } catch (e: any) {
        result.code = 1;
        result.stderr = `Error writing file: ${e.message}`;
      }
    } 
    else if (body.tool === 'list_dir') {
      const targetDir = resolveToolPath(req, body.args?.[0] || '.');
      try {
        const entries = await fs.readdir(targetDir, { withFileTypes: true });
        const list = entries.map(e => `${e.isDirectory() ? '[DIR] ' : '[FILE]'} ${e.name}`).join('\n');
        result.stdout = list;
      } catch (e: any) {
        result.code = 1;
        result.stderr = `Error listing directory: ${e.message}`;
      }
    }
    // --- Fallback to shell scripts for other commands (if they exist) ---
    else {
      let script = '';
      let args: string[] = [];
      let stdin: string | undefined;

      switch (body.tool) {
        case 'search_code':
          script = 'search_code.sh';
          args = body.args ?? [];
          break;
        case 'run_shell':
          script = 'run_shell.sh';
          stdin = body.stdin ?? '';
          break;
        case 'git_status':
          script = 'git_status.sh';
          break;
        case 'run_tests':
          script = 'run_tests.sh';
          args = [String(body.args?.[0] ?? 'all')];
          break;
        case 'run_lint':
          script = 'run_lint.sh';
          args = body.args?.includes('--fix') ? ['--fix'] : [];
          break;
        case 'run_typecheck':
          script = 'run_typecheck.sh';
          break;
        case 'brew_status_snapshot':
          script = 'brew_status_snapshot.sh';
          break;
        case 'brew_log_update':
          script = 'brew_log_update.sh';
          args = [String(body.args?.[0] ?? '')];
          break;
        default:
          return res.status(400).json({ error: `Unknown tool ${body.tool}` });
      }

      result = await runScript(script, args, stdin);
    }

    const toolRunResult = {
      id: `${Date.now()}-${body.tool}`,
      tool: body.tool,
      args: body.args,
      cwd: process.env.BREW_PROJECT_ROOT || process.cwd(),
      timestamp: new Date().toISOString(),
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
      summary: `${body.tool}(${JSON.stringify(body.args)}) → exitCode=${result.code}`,
      ok: result.code === 0,
    };

    try {
      await logToolRun(toolRunResult);
    } catch (err) {
      console.error('Failed to log BrewLast tool run:', err);
    }

    // Special flag for the UI to know it needs to refresh the sandbox diff
    const needsPreviewRefresh = (body.tool === 'write_file' && result.code === 0);

    return res.status(200).json({
      ok: toolRunResult.ok,
      stdout: toolRunResult.stdout,
      stderr: toolRunResult.stderr,
      exitCode: toolRunResult.exitCode,
      tool: toolRunResult.tool,
      args: toolRunResult.args,
      personalityMeta: personality.meta,
      riskDecision: riskDecision,
      needsPreviewRefresh, // Important for Phase 2!
    });
  } catch (err: any) {
    console.error('llm-tool-call error:', err);
    return res
      .status(500)
      .json({ error: String(err?.message || err || 'Unknown error') });
  }
}
