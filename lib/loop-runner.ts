import { exec } from 'child_process';

export function runLoopShell(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = `brewrouter /loop_s "${prompt.replace(/"/g, '\\"')}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}
