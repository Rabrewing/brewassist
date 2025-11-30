import { exec } from 'child_process';

export function runRouter(command: string, args = ''): Promise<string> {
  return new Promise((resolve, reject) => {
    const safeArgs = args.replace(/"/g, '\\"');
    const cmd = `brewrouter ${command} "${safeArgs}"`;
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout.trim());
    });
  });
}
