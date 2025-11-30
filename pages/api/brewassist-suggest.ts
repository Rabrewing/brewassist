// pages/api/brewassist-suggest.ts
// S4.4 — Returns maintenance suggestions for BrewAssist / BrewTruth / Toolbelt.

import type { NextApiRequest, NextApiResponse } from 'next';
import { generateMaintenanceSuggestions } from '../../lib/brewassistMaintenance';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const suggestions = generateMaintenanceSuggestions();
    return res.status(200).json({
      ok: true,
      suggestions,
    });
  } catch (error: any) {
    console.error('[brewassist-suggest]', error);
    return res.status(500).json({
      ok: false,
      error: error?.message ?? 'Unknown error',
    });
  }
}
