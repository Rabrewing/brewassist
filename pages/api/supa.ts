import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  exec(`./overlays/brewsupa.sh`, { cwd: '/home/brewexec' }, (error, stdout) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ response: stdout.trim() });
  });
}
