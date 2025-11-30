import { exec } from 'child_process';

type Options = {
  mode?: 'auto' | 'hrm' | 'agent' | 'llm' | 'mistral';
  agent?: string; // e.g., '@Zahav'
  chain?: string; // e.g., 'HRM>Agent>LLM>Mistral'
};

export function runBrewAssist(
  prompt: string,
  opts: Options = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const parts = ['brewassist'];
    if (opts.mode) parts.push(`--mode ${opts.mode}`);
    if (opts.agent) parts.push(`--agent ${opts.agent}`);
    if (opts.chain) parts.push(`--chain "${opts.chain.replace(/"/g, '\\"')}"`);
    if (opts.mode !== 'agent') parts.push(`"${prompt.replace(/"/g, '\\"')}"`);
    const cmd = parts.join(' ');
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}
