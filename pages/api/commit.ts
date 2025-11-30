// This is a placeholder for /api/commit.ts
// It should handle requests for the commit overlay.
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const msg = req.body.message;
  if (!msg)
    return res.status(400).json({ error: 'No commit message provided.' });

  exec(
    `echo "${msg}" | /home/brewexec/overlays/brewcommit.sh`,
    (error, stdout) => {
      if (error) return res.status(500).json({ error: 'Git commit failed.' });
      res.json({ response: stdout.trim() });
    }
  );
}
