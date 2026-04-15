import type { NextApiRequest, NextApiResponse } from 'next';
import { getModelProviders } from '@/lib/model-router';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const providers = getModelProviders();
  
  // Strip out API keys before sending to frontend
  const safeProviders = Object.keys(providers).reduce((acc, key) => {
    const k = key as keyof typeof providers;
    acc[k] = {
      enabled: providers[k].enabled,
      primaryModel: providers[k].primaryModel,
      preferredModel: providers[k].preferredModel,
    };
    return acc;
  }, {} as any);

  return res.status(200).json({ providers: safeProviders });
}
