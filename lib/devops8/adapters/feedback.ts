// lib/devops8/adapters/feedback.ts

import type { DevOpsSignal } from '../types';
import { DEVOPS_SIGNAL_DEFINITIONS } from '../constants';
import { createNormalizedSignal } from '../normalize';

interface FeedbackContext {
  chunkCount?: number;
  lastChunkTime?: number;
  feedbackGaps?: number;
  isStreaming?: boolean;
}

export function computeFeedbackVelocity(
  context: FeedbackContext = {}
): DevOpsSignal {
  const { chunkCount = 0, feedbackGaps = 0, isStreaming = false } = context;

  let status: DevOpsSignal['status'] = 'optimal';
  let value = 100;
  let confidence = 0.9;
  let notes = 'Feedback is fast and incremental.';

  if (feedbackGaps > 0) {
    status = 'degraded';
    value = 50;
    confidence = 0.7;
    notes = `Feedback is delayed due to ${feedbackGaps} gaps.`;
  } else if (chunkCount === 0 && isStreaming) {
    status = 'degraded';
    value = 40;
    confidence = 0.6;
    notes = 'Streaming is active but no chunks received yet.';
  } else if (!isStreaming) {
    status = 'degraded';
    value = 60;
    confidence = 0.5;
    notes = 'System is not streaming, feedback is not incremental.';
  }

  return createNormalizedSignal(
    'feedback_velocity',
    DEVOPS_SIGNAL_DEFINITIONS.feedback_velocity.label,
    status,
    value,
    'streaming_engine',
    confidence,
    notes,
    { chunkCount, feedbackGaps, isStreaming }
  );
}
