// pages/api/list-directory.js

import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const dir = req.query.path || 'overlays';
  const dirPath = path.join(process.cwd(), dir);

  try {
    const files = fs.readdirSync(dirPath);
    res.status(200).json({ files });
  } catch (err) {
    console.error('❌ Directory listing error:', err);
    res.status(500).json({ error: 'Failed to list directory.' });
  }
}
