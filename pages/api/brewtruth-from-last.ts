// pages/api/brewtruth-from-last.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { readBrewLast, writeBrewLast } from '@/lib/brewLastServer';
import { runTruthCheckForToolRun } from '@/lib/brewtruth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const projectRoot = process.env.BREW_PROJECT_ROOT || process.cwd();
    const state = await readBrewLast();

    if (!state.lastToolRun) {
      return res.status(400).json({
        ok: false,
        error: 'No lastToolRun found in BrewLast state.',
      });
    }

    const targetId =
      (req.body &&
        typeof req.body.toolRunId === 'string' &&
        req.body.toolRunId) ||
      state.lastToolRun.id;

    const run =
      state.history?.find((r) => r.id === targetId) || state.lastToolRun;

    if (!run) {
      return res.status(404).json({
        ok: false,
        error: `Tool run with ID '${targetId}' not found.`,
      });
    }

    // Type guard to ensure we're dealing with a tool run
    if (!('tool' in run)) {
      return res.status(400).json({
        ok: false,
        error: `The found history event with ID '${targetId}' is not a tool run.`,
      });
    }

    const truthReview = await runTruthCheckForToolRun(run);

    // Attach review to both lastToolRun and the specific history entry
    const updatedHistory = state.history?.map((r) =>
      r.id === targetId ? { ...r, truthReview } : r
    );

    const updatedState = {
      ...state,
      lastUpdated: new Date().toISOString(),
      lastToolRun:
        state.lastToolRun && state.lastToolRun.id === targetId
          ? { ...state.lastToolRun, truthReview }
          : state.lastToolRun,
      history: updatedHistory,
    };

    await writeBrewLast(updatedState);

    return res.status(200).json({
      ok: true,
      toolRunId: targetId,
      truthReview,
    });
  } catch (err: any) {
    console.error('Error in /api/brewtruth-from-last:', err);
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Unexpected error',
    });
  }
}
