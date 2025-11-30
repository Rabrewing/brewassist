import { exec } from 'child_process';

export function runAgent(task: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = `brewrouter /agent "${task.replace(/"/g, '\\"')}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}
