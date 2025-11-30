// This is a placeholder for /api/guide.ts
// It should handle requests for the guide overlay.
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  exec(`bash /home/brewexec/overlays/brewguide.sh`, (error, stdout) => {
    if (error) return res.status(500).json({ error: error.message });
    res.json({ response: stdout.trim() });
  });
}
