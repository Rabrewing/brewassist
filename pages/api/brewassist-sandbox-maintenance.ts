// File: pages/api/brewassist-sandbox-maintenance.ts
// Phase: 5.2 Create API: pages/api/brewassist-sandbox-maintenance.ts
// Summary: API endpoint for triggering and querying self-maintenance runs.

import type { NextApiRequest, NextApiResponse } from 'next';
import {
  runSelfMaintenance,
  SelfMaintenanceResult,
} from '../../lib/brewSelfMaintenance';
import { getRunDir, getSandboxRoot } from '../../lib/brewSandbox';
import path from 'path';
import fs from 'fs/promises';
import { InsightSummary } from '../../lib/brewInsightEngine';
import { BrewLastState } from '../../lib/brewLast'; // Assuming BrewLastState is defined here
import { readBrewLast } from '../../lib/brewLastServer';

type ApiResponse = {
  ok: boolean;
  error?: string;
  data?:
    | SelfMaintenanceResult
    | {
        runId: string;
        insights?: InsightSummary;
        metadata?: any;
        truthReview?: any;
      };
  meta?: { timestamp: string };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  const timestamp = new Date().toISOString();

  if (req.method === 'POST') {
    const { action } = req.query;

    if (action === 'run') {
      try {
        const result = await runSelfMaintenance({ mode: 'manual' });
        return res.status(200).json({
          ok: true,
          data: result,
          meta: { timestamp },
        });
      } catch (error: any) {
        console.error('Error running self-maintenance:', error);
        return res.status(500).json({
          ok: false,
          error: `Failed to run self-maintenance: ${error.message || error}`,
          meta: { timestamp },
        });
      }
    } else {
      return res.status(400).json({
        ok: false,
        error: 'Invalid action for POST request.',
        meta: { timestamp },
      });
    }
  } else if (req.method === 'GET') {
    const { action } = req.query;

    if (action === 'last') {
      try {
        const brewLastState: BrewLastState = await readBrewLast();
        const lastSandboxRun = brewLastState.lastSandboxRun;

        if (!lastSandboxRun) {
          return res.status(404).json({
            ok: false,
            error: 'No previous sandbox maintenance run found.',
            meta: { timestamp },
          });
        }

        const runId = lastSandboxRun.runId;
        const runDirectory = getRunDir(runId);

        let insights: InsightSummary | undefined;
        let metadata: any;
        let truthReview: any;

        try {
          insights = JSON.parse(
            await fs.readFile(path.join(runDirectory, 'insights.json'), 'utf8')
          );
        } catch (e) {
          /* ignore if not found */
        }
        try {
          metadata = JSON.parse(
            await fs.readFile(path.join(runDirectory, 'metadata.json'), 'utf8')
          );
        } catch (e) {
          /* ignore if not found */
        }
        try {
          truthReview = JSON.parse(
            await fs.readFile(
              path.join(runDirectory, 'truthReview.json'),
              'utf8'
            )
          );
        } catch (e) {
          /* ignore if not found */
        }

        return res.status(200).json({
          ok: true,
          data: {
            runId,
            insights,
            metadata,
            truthReview,
          },
          meta: { timestamp },
        });
      } catch (error: any) {
        console.error('Error fetching last self-maintenance run:', error);
        return res.status(500).json({
          ok: false,
          error: `Failed to fetch last self-maintenance run: ${error.message || error}`,
          meta: { timestamp },
        });
      }
    } else {
      return res.status(400).json({
        ok: false,
        error: 'Invalid action for GET request.',
        meta: { timestamp },
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
