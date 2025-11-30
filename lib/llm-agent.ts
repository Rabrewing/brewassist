import { exec } from 'child_process';

export function runLLM(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = `brewrouter /llm "${prompt.replace(/"/g, '\\"')}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}
