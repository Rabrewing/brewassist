import { randomUUID } from 'node:crypto';

import { applyDevOps8RuntimeEvent } from '@/lib/devops8/runtimeBus';
import type { HybridWorkflowStage } from '@/lib/hybridWorkflow';
import type { DevOps8RuntimeEventType } from '@/lib/devops8/runtimeBus';
import type {
  AgentEvent,
  AgentEventType,
  AgentRuntimeContext,
  AgentRuntimeState,
} from './types';

function toDevOps8EventType(
  eventType: AgentEventType
): DevOps8RuntimeEventType | null {
  switch (eventType) {
    case 'intent.captured':
    case 'plan.created':
    case 'preview.ready':
    case 'confirm.requested':
    case 'execute.started':
    case 'execute.completed':
    case 'report.emitted':
    case 'replay.available':
    case 'telemetry.updated':
    case 'collab.message':
      return eventType;
    case 'policy.evaluated':
      return null;
  }
}

export class AgentRuntime {
  readonly context: AgentRuntimeContext;
  readonly state: AgentRuntimeState;
  readonly events: AgentEvent[] = [];

  constructor(context: AgentRuntimeContext) {
    this.context = context;
    this.state = {
      stage: 'intent',
      brewTruthReport: null,
      accumulatedText: '',
      replayLabel: '',
      telemetry: {
        policyGateFailures: 0,
        truthScore: 1,
        testConfidence: 1,
        schemaDiffsDetected: false,
        coverage: 1,
      },
    };
  }

  emit(args: {
    agentId: AgentEvent['agentId'];
    eventType: AgentEventType;
    stage?: HybridWorkflowStage;
    summary: string;
    payload?: Record<string, unknown>;
    uiHints?: Record<string, unknown>;
  }): AgentEvent {
    const event: AgentEvent = {
      sessionId: this.context.sessionId,
      runId: this.context.runId,
      stage: args.stage ?? this.state.stage,
      agentId: args.agentId,
      eventType: args.eventType,
      timestamp: new Date().toISOString(),
      actor: this.context.userId,
      summary: args.summary,
      payload: args.payload ?? {},
      policyState: this.state.policy,
      telemetry: { ...this.state.telemetry },
      uiHints: args.uiHints,
    };

    this.events.push(event);

    const devopsEventType = toDevOps8EventType(args.eventType);
    if (devopsEventType) {
      applyDevOps8RuntimeEvent({
        type: devopsEventType,
        at: event.timestamp,
        payload: event.payload as never,
      });
    }

    return event;
  }

  setStage(stage: HybridWorkflowStage) {
    this.state.stage = stage;
  }

  updateTelemetry(patch: Partial<AgentRuntimeState['telemetry']>) {
    this.state.telemetry = {
      ...this.state.telemetry,
      ...patch,
    };
  }
}

export function createAgentRuntimeContext(
  input: Omit<AgentRuntimeContext, 'sessionId' | 'runId'>
): AgentRuntimeContext {
  return {
    sessionId: randomUUID(),
    runId: randomUUID(),
    ...input,
  };
}
