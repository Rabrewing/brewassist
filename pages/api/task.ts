// This is a placeholder for /api/task.ts
// It should handle requests for the task overlay.
import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action, target, content } = req.body;
  if (!action || !target)
    return res.status(400).json({ error: 'Missing task parameters.' });

  const safeContent = content ? `"${content.replace(/"/g, '\\"')}"` : '';
  exec(
    `/home/brewexec/overlays/brewtask.sh ${action} "${target}" ${safeContent}`,
    (error, stdout) => {
      if (error)
        return res.status(500).json({ error: 'Task execution failed.' });
      res.json({ response: stdout.trim() });
    }
  );
}
