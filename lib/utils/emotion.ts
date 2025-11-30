// Emotion utilities — lightweight, deterministic when seed provided.

export type EmotionTier =
  | 'calm'
  | 'confident'
  | 'celebratory'
  | 'reassuring'
  | 'analytical'
  | 'urgent'
  | 'playful';

const EMOJI: Record<EmotionTier, string> = {
  calm: '🌊',
  confident: '🦾',
  celebratory: '✨',
  reassuring: '🤝',
  analytical: '🧠',
  urgent: '⚡',
  playful: '🎈',
};

const TONES: Record<EmotionTier, string> = {
  calm: 'Even tempo. Low shimmer. Clear steps.',
  confident: 'Decisive. Short sentences. Action first.',
  celebratory: 'High energy. Positive reinforcement.',
  reassuring: 'Supportive. Guidance with safety rails.',
  analytical: 'Structured. Bullet points and checks.',
  urgent: 'Priority callouts. Fast, direct, safe.',
  playful: 'Light, witty, but still useful.',
};

const ORDER: EmotionTier[] = [
  'calm',
  'confident',
  'celebratory',
  'reassuring',
  'analytical',
  'urgent',
  'playful',
];

export function randomEmotion(seed?: string): EmotionTier {
  if (!seed) return ORDER[Math.floor(Math.random() * ORDER.length)];
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const index = ((h % ORDER.length) + ORDER.length) % ORDER.length;
  return ORDER[index];
}

export function describeEmotion(tier: EmotionTier): string {
  return TONES[tier];
}

export function decorate(tier: EmotionTier, message: string): string {
  return `${EMOJI[tier]} ${message}`;
}

export function emojiFor(tier: EmotionTier): string {
  return EMOJI[tier];
}

export function synthesize(
  promptOrSeed: string,
  seedOverride?: string
): { tier: EmotionTier; emoji: string; label: string; message: string } {
  const tier = randomEmotion(seedOverride ?? promptOrSeed);
  const emoji = emojiFor(tier);
  const label = `${emoji} ${tier.toUpperCase()}`;
  const message = describeEmotion(tier);
  return { tier, emoji, label, message };
}
