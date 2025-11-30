// pages/api/llm-tool-call.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';
import { logToolRun } from '@/lib/brewLastServer';
import {
  applyPersonalityLayer,
  initPersonalityState,
  BrewRiskMode, // Import BrewRiskMode
} from '../../lib/brewassistPersonality';
import { decideRisk, RiskLevel } from '../../lib/brewassistRiskEngine'; // Import RiskLevel
import { getUserMode } from '../../lib/brewModeServer'; // Import getUserMode

const PROJECT_ROOT_ENV = 'BREW_PROJECT_ROOT';

type BrewToolName =
  | 'read_file'
  | 'write_file'
  | 'list_dir'
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
  userPrompt?: string; // Add userPrompt to the request body
  userId?: string; // Add userId to the request body
};

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

  // Initialize personality state (stateless per request for now)
  const personalityState = initPersonalityState({
    config: {
      mode: getUserMode(userId) as BrewRiskMode, // Cast to BrewRiskMode
      devName: 'RB', // Hardcode for now, will be dynamic with S4.3.2
      maxContextMessages: 10,
    },
  });

  const personality = applyPersonalityLayer({
    userPrompt,
    toolName: requestedToolName,
    lastToolSummary: undefined, // optional: could pull from BrewLast.state.lastToolRun.summary
    state: personalityState,
  });

  // Decide risk based on mode + tone + prompt
  const riskDecision = decideRisk({
    mode: personality.meta.mode,
    toneHint: personality.toneHint,
    userPrompt,
    toolName: requestedToolName,
  });

  if (!riskDecision.allow) {
    // Log the blocked attempt into BrewLast
    await logToolRun({
      id: `${Date.now()}-risk-gate-${requestedToolName}`,
      tool: requestedToolName,
      args: body.args,
      cwd: process.env.BREW_PROJECT_ROOT || process.cwd(),
      timestamp: new Date().toISOString(),
      exitCode: 1, // Indicate failure
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

  // If we got here, we’re allowed to proceed.
  // Use the shaped prompt instead of raw userPrompt:
  const promptForLLM = personality.promptForModel;

  try {
    let script = '';
    let args: string[] = [];
    let stdin: string | undefined;

    switch (body.tool) {
      case 'read_file':
        script = 'read_file.sh';
        args = body.args ?? [];
        break;
      case 'write_file':
        script = 'write_file.sh';
        args = body.args ?? [];
        stdin = body.stdin ?? '';
        break;
      case 'list_dir':
        script = 'list_dir.sh';
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
      case 'run_lint': {
        script = 'run_lint.sh';
        const fixArg = body.args?.includes('--fix') ? '--fix' : '';
        args = fixArg ? [fixArg] : [];
        break;
      }
      case 'run_typecheck':
        script = 'run_typecheck.sh';
        break;
      case 'brew_status_snapshot':
        script = 'brew_status_snapshot.sh';
        break;
      case 'brew_open_last_action':
        script = 'brew_open_last_action.sh';
        break;
      case 'brew_log_update':
        script = 'brew_log_update.sh';
        args = [String(body.args?.[0] ?? '')];
        break;
      default:
        return res.status(400).json({ error: `Unknown tool ${body.tool}` });
    }

    const result = await runScript(script, args, stdin);

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
      ok: result.code === 0, // Add ok status to the log
    };

    try {
      await logToolRun(toolRunResult);
    } catch (err) {
      console.error('Failed to log BrewLast tool run:', err);
    }

    return res.status(200).json({
      ok: toolRunResult.ok,
      stdout: toolRunResult.stdout,
      stderr: toolRunResult.stderr,
      exitCode: toolRunResult.exitCode,
      tool: toolRunResult.tool,
      args: toolRunResult.args,
      personalityMeta: personality.meta, // Include personality meta in response
      riskDecision: riskDecision, // Include risk decision in response
    });
  } catch (err: any) {
    console.error('llm-tool-call error:', err);
    return res
      .status(500)
      .json({ error: String(err?.message || err || 'Unknown error') });
  }
}
