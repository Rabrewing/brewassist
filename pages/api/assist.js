// pages/api/assist.js

import { spawn } from 'child_process';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt.' });

  const process = spawn('bash', ['overlays/brewassist.sh', prompt]);

  let output = '';
  process.stdout.on('data', (data) => {
    output += data.toString();
  });

  process.stderr.on('data', (data) => {
    console.error('❌ BrewAssist error:', data.toString());
  });

  process.on('close', () => {
    res.status(200).json({ response: output.trim() });
  });
}
