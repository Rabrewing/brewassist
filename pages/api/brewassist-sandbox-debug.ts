// File: pages/api/brewassist-sandbox-debug.ts
// Phase: 6.2 Create API: pages/api/brewassist-sandbox-debug.ts
// Summary: API endpoint for triggering self-debugging analysis.

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  analyzeFailure,
  SelfDebugInput,
  SelfDebugResult,
} from '../../lib/brewSelfDebug';

type ApiResponse = {
  ok: boolean;
  error?: string;
  data?: SelfDebugResult;
  meta?: { timestamp: string };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const timestamp = new Date().toISOString();

  if (req.method === 'POST') {
    const { errorMessage, filePath, logSnippet, context } = req.body;

    if (!errorMessage) {
      return res.status(400).json({
        ok: false,
        error: 'errorMessage is required for self-debug analysis.',
        meta: { timestamp },
      });
    }

    const input: SelfDebugInput = {
      errorMessage,
      filePath,
      logSnippet,
      context,
    };

    try {
      const result = await analyzeFailure(input);
      return res.status(200).json({
        ok: true,
        data: result,
        meta: { timestamp },
      });
    } catch (error: any) {
      console.error('Error running self-debug:', error);
      return res.status(500).json({
        ok: false,
        error: `Failed to run self-debug: ${error.message || error}`,
        meta: { timestamp },
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
