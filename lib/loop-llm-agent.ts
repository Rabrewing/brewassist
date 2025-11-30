import { exec } from 'child_process';

export function runLoopLLM(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = `brewrouter /loop "${prompt.replace(/"/g, '\\"')}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}
