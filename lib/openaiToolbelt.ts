import type { BrewMode } from './brewModes';
import type { BrewTruthReport } from './brewtruth';

// lib/openaiToolbelt.ts
/**
 * OpenAI Toolbelt wrapper for BrewAssist.
 *
 * Responsibilities:
 * - Call OpenAI Chat Completions with a tool schema that maps to /api/llm-tool-call.
 * - Let OpenAI decide whether to call tools or just answer in text.
 * - When tools are requested, call /api/llm-tool-call for each tool_call.
 * - Summarize tool results back to BrewAssist as a single output string.
 *
 * NOTE: This is a **single-pass** design:
 * - We DO NOT send "tool" role messages back into OpenAI.
 * - This avoids the "messages with role 'tool' must be a response to tool_calls" 400 error.
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL =
  process.env.OPENAI_MODEL ||
  process.env.NEXT_PUBLIC_OPENAI_MODEL ||
  'gpt-4.1-mini';

// Tools known by /api/llm-tool-call
const TOOLBELT_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'write_file',
      description:
        'Create or overwrite a text file within the project sandbox using a relative path.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description:
              'Relative file path from the project root, e.g. "sandbox/test.ts" or "components/Foo.tsx".',
          },
          content: {
            type: 'string',
            description: 'Full file contents as a UTF-8 text string.',
          },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description:
        'Read the contents of a text file from the project using a relative path.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description:
              'Relative file path from the project root, e.g. "sandbox/test.ts".',
          },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_dir',
      description:
        'List files and directories inside a given path, for navigation and discovery.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description:
              'Relative directory path from project root, e.g. ".", "sandbox", or "components".',
          },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_code',
      description:
        'Search within the codebase for a string or regex pattern, to locate relevant files or usage.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search string or regex.',
          },
          path: {
            type: 'string',
            description:
              'Relative directory path to search within, such as ".", "components", or "lib".',
          },
        },
        required: ['query', 'path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_shell',
      description:
        'Run a whitelisted shell command in the project environment via overlays/run_shell.sh.',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description:
              'Shell command to run (must be safe and whitelisted by run_shell.sh).',
          },
        },
        required: ['command'],
      },
    },
  },
] as const;

export type ToolCallResult = {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
  tool: string;
  args: unknown;
};

export type ToolbeltRunResult = {
  output: string;
  usedTools: boolean;
  raw?: any;
  mode?: BrewMode;
  truth?: BrewTruthReport;
  autoProceeded?: boolean;
};

/**

 * Low-level helper to POST into /api/llm-tool-call

 * so that all tool executions go through the same security + overlay pipeline.

 */

async function callToolbeltApi(
  tool: string,

  args: unknown,

  stdin?: string,

  userPrompt?: string, // Add userPrompt

  userId?: string // Add userId
): Promise<ToolCallResult> {
  const base = process.env.TOOLBELT_BASE_URL || 'http://127.0.0.1:3000';

  function normalizeArgsForTool(tool: string, args: any): string[] {
    if (Array.isArray(args)) return args;

    switch (tool) {
      case 'write_file':
        return [args.path]; // content goes via stdin

      case 'read_file': // fallthrough

      case 'list_dir':
        return [args.path];

      case 'search_code':
        return [args.query, args.path];

      case 'run_shell':
        return [args.command];

      default:
        return [];
    }
  }

  const argArray = normalizeArgsForTool(tool, args);

  const body = JSON.stringify({
    tool,
    args: argArray,
    stdin,
    userPrompt,
    userId,
  });

  const res = await fetch(`${base}/api/llm-tool-call`, {
    method: 'POST',

    headers: { 'Content-Type': 'application/json' },

    body: body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');

    throw new Error(
      `Toolbelt HTTP ${res.status}: ${res.statusText || ''} ${
        text ? `- ${text}` : ''
      }`.trim()
    );
  }

  const json = await res.json();

  return json;
}

/**
 * Main entrypoint: runWithToolbelt
 *
 * - Calls OpenAI with tools enabled.
 * - If no tools are requested, returns the assistant message as-is.
 * - If tools are requested, executes each via /api/llm-tool-call and returns
 *   a summarized, human-readable output.
 */
export async function runWithToolbelt(
  prompt: string,
  options?: {
    mode?: BrewMode;
    truth?: BrewTruthReport;
    autoProceeded?: boolean;
    userId?: string;
  }
): Promise<ToolbeltRunResult> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  const trimmed = `${prompt ?? ''}`.trim();
  if (!trimmed) {
    return {
      output: 'Please enter a prompt for BrewAssist to respond to.',
      usedTools: false,
      ...options,
    };
  }

  const messages = [
    {
      role: 'system' as const,
      content:
        'You are BrewAssist inside the DevOps Cockpit. ' +
        'You have access to a Toolbelt via a function-call API (write_file, read_file, list_dir, search_code, run_shell). ' +
        'When the user asks you to create, modify, or inspect files or run shell commands, you MUST call the appropriate tools. ' +
        'When no tools are needed (simple Q&A), respond normally.',
    },
    {
      role: 'user' as const,
      content: trimmed,
    },
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      tools: TOOLBELT_TOOLS,
      tool_choice: 'auto',
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `OpenAI HTTP ${res.status}: ${res.statusText || ''} ${text ? `- ${text}` : ''}`.trim()
    );
  }

  const data: any = await res.json();
  const choice = data.choices?.[0];
  const msg = choice?.message;

  const toolCalls = msg?.tool_calls;
  if (!toolCalls || toolCalls.length === 0) {
    // No tools used → plain answer
    const content = msg?.content?.trim?.();
    return {
      output: content || '⚠️ BrewAssist did not return any content.',
      usedTools: false,
      raw: data,
      ...options,
    };
  }

  // Tools selected → execute each via /api/llm-tool-call
  const results: ToolCallResult[] = [];

  for (const call of toolCalls) {
    const name = call.function?.name;
    const rawArgs = call.function?.arguments;

    if (!name) continue;

    let args: unknown = {};
    try {
      args = rawArgs ? JSON.parse(rawArgs) : {};
    } catch {
      args = { _raw: rawArgs };
    }

    const stdin = (args as any)?.content || (args as any)?.stdin || undefined;

    const result = await callToolbeltApi(
      name,
      args,
      stdin,
      prompt,
      options?.userId
    );
    results.push({ ...result, tool: name, args });
  }

  // Summarize tool execution in a human-readable way
  const summaryLines: string[] = [];
  summaryLines.push('🛠️ BrewAssist Toolbelt used the following tools:');

  for (const r of results) {
    summaryLines.push(
      `• ${r.tool}(${JSON.stringify(r.args)}) → exitCode=${r.exitCode}`
    );
    if (r.stdout) {
      summaryLines.push(`  stdout:\n${r.stdout.trim().slice(0, 2000)}`);
    }
    if (r.stderr) {
      summaryLines.push(`  stderr:\n${r.stderr.trim().slice(0, 2000)}`);
    }
  }

  return {
    output: summaryLines.join('\n'),
    usedTools: true,
    raw: { openai: data, tools: results },
    ...options,
  };
}
