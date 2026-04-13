import { classifyIntent } from '@/lib/intent-gatekeeper';
import { evaluateHandshake } from '@/lib/toolbelt/handshake';
import { CAPABILITY_REGISTRY } from '@/lib/capabilities/registry';
import type { BrewTruthReport } from '@/lib/brewtruth';

import type { AgentRuntime } from './runtime';
import type { CollabMessagePayload } from './types';

export function runIntentAgent(runtime: AgentRuntime) {
  const rawCommand = runtime.context.input.startsWith('/')
    ? runtime.context.input.split(' ')[0]
    : undefined;
  const commandCapabilityId =
    rawCommand &&
    CAPABILITY_REGISTRY[rawCommand] &&
    CAPABILITY_REGISTRY[rawCommand].surfaces.includes('command')
      ? rawCommand
      : undefined;
  const intent = classifyIntent(runtime.context.input, commandCapabilityId);

  runtime.state.intent = intent;
  runtime.state.commandCapabilityId = commandCapabilityId;
  runtime.setStage('intent');
  runtime.emit({
    agentId: 'intent_agent',
    eventType: 'intent.captured',
    summary: `Intent classified as ${intent}`,
    payload: {
      input: runtime.context.input,
      stage: 'intent',
      runLabel: `${runtime.context.personaId}:${intent}`,
      cockpitMode: runtime.context.cockpitMode,
      tier: runtime.context.tier,
      personaId: runtime.context.personaId,
      repoProvider: runtime.context.repoProvider,
      repoRoot: runtime.context.repoRoot,
    },
  });

  return { intent, commandCapabilityId };
}

export function runPlannerAgent(runtime: AgentRuntime) {
  const intent = runtime.state.intent ?? 'UNKNOWN';
  const requiresConfirm = Boolean(
    runtime.context.confirmApply === false || runtime.context.action
  );

  const plan = {
    stepCount: 3,
    summary: `Plan ${intent.toLowerCase()} request in ${runtime.context.mode.toLowerCase()} mode`,
    previewTargets: [runtime.context.repoRoot ?? 'workspace'],
    requiresConfirm,
  };

  runtime.state.plan = plan;
  runtime.setStage('plan');
  runtime.emit({
    agentId: 'planner_agent',
    eventType: 'plan.created',
    stage: 'plan',
    summary: plan.summary,
    payload: {
      stepCount: plan.stepCount,
      plannerChurnDelta: 1,
      previewTargets: plan.previewTargets,
      requiresConfirm: plan.requiresConfirm,
    },
  });

  return plan;
}

export function runPolicyAgent(runtime: AgentRuntime) {
  const policy = evaluateHandshake({
    intent: runtime.state.intent!,
    tier: runtime.context.tier,
    persona: runtime.context.persona,
    cockpitMode: runtime.context.cockpitMode,
    capabilityId:
      runtime.context.capabilityId || runtime.state.commandCapabilityId,
    action: runtime.context.action,
    confirmApply: runtime.context.confirmApply,
    gepHeaderPresent: runtime.context.gepHeaderPresent,
    truthScore: runtime.context.truthScore,
    truthFlags: runtime.context.truthFlags,
  });

  runtime.state.policy = policy;
  runtime.emit({
    agentId: 'policy_agent',
    eventType: 'policy.evaluated',
    stage: policy.requiresConfirm ? 'confirm' : 'preview',
    summary: policy.ok ? 'Policy approved request' : 'Policy blocked request',
    payload: {
      ok: policy.ok,
      route: policy.route,
      reason: policy.reason,
      requiresConfirm: policy.requiresConfirm,
    },
  });

  if (!policy.ok || policy.requiresConfirm) {
    runtime.setStage('confirm');
    runtime.updateTelemetry({
      policyGateFailures: policy.ok ? 0 : 1,
      truthScore:
        typeof runtime.context.truthScore === 'number'
          ? runtime.context.truthScore
          : 0.5,
      testConfidence:
        typeof runtime.context.truthScore === 'number'
          ? runtime.context.truthScore
          : 0.5,
      coverage:
        typeof runtime.context.truthScore === 'number'
          ? runtime.context.truthScore
          : 0.5,
    });
    runtime.emit({
      agentId: 'policy_agent',
      eventType: 'confirm.requested',
      stage: 'confirm',
      summary: policy.ok ? 'Confirmation required' : 'Blocked by policy',
      payload: {
        required: true,
        blockerCount: policy.ok ? 0 : 1,
      },
    });
    runtime.emit({
      agentId: 'telemetry_agent',
      eventType: 'telemetry.updated',
      stage: 'confirm',
      summary: 'Updated telemetry after policy evaluation',
      payload: runtime.state.telemetry,
    });
    return policy;
  }

  runtime.setStage('preview');
  runtime.emit({
    agentId: 'policy_agent',
    eventType: 'preview.ready',
    stage: 'preview',
    summary: 'Preview approved',
    payload: {
      diffFiles: 1,
      hasChanges: true,
    },
  });

  return policy;
}

export function runExecutorAgentStart(runtime: AgentRuntime) {
  runtime.setStage('execute');
  runtime.emit({
    agentId: 'executor_agent',
    eventType: 'execute.started',
    stage: 'execute',
    summary: 'Started execution stream',
    payload: { latencyMs: 0 },
  });
}

export function runExecutorAgentChunk(
  runtime: AgentRuntime,
  args: {
    text: string;
    hasFeedbackGap?: boolean;
    truthScore?: number;
    schemaDiffsDetected?: boolean;
  }
) {
  runtime.state.accumulatedText =
    (runtime.state.accumulatedText ?? '') + args.text;
  runtime.updateTelemetry({
    truthScore: args.truthScore ?? runtime.state.telemetry.truthScore,
    testConfidence: args.truthScore ?? runtime.state.telemetry.testConfidence,
    coverage: args.truthScore ?? runtime.state.telemetry.coverage,
    schemaDiffsDetected:
      args.schemaDiffsDetected ?? runtime.state.telemetry.schemaDiffsDetected,
  });
  runtime.emit({
    agentId: 'planner_agent',
    eventType: 'plan.created',
    stage: 'plan',
    summary: 'Planner updated during stream',
    payload: { stepCount: 1, plannerChurnDelta: 1 },
  });
  runtime.emit({
    agentId: 'telemetry_agent',
    eventType: 'telemetry.updated',
    stage: 'execute',
    summary: args.hasFeedbackGap
      ? 'Updated runtime telemetry after feedback gap'
      : 'Updated runtime telemetry during stream',
    payload: runtime.state.telemetry,
  });
  runtime.emit({
    agentId: 'planner_agent',
    eventType: 'preview.ready',
    stage: 'preview',
    summary: 'Preview remains ready during stream',
    payload: {
      diffFiles: 1,
      hasChanges: true,
    },
  });
}

export function runExecutorAgentComplete(
  runtime: AgentRuntime,
  args: {
    latencyMs: number;
    policyGateFailures: number;
    truthScore: number;
    schemaDiffsDetected: boolean;
  }
) {
  const accumulatedText = runtime.state.accumulatedText ?? '';
  const scopeWordCount = accumulatedText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  runtime.setStage('report');
  runtime.emit({
    agentId: 'executor_agent',
    eventType: 'execute.completed',
    stage: 'report',
    summary: 'Execution completed',
    payload: {
      latencyMs: args.latencyMs,
      truthScore: args.truthScore,
      coverage: args.truthScore,
      policyGateFailures: args.policyGateFailures,
      schemaDiffsDetected: args.schemaDiffsDetected,
      scope: {
        definedScopeItems: Math.max(scopeWordCount, 1),
        executedItems: accumulatedText ? Math.min(scopeWordCount, 8) : 0,
        scopeCreepIncidents: args.policyGateFailures,
        boundaryViolations: args.policyGateFailures,
        recentChecks: 1,
        coverage: args.truthScore,
        violations: args.policyGateFailures,
      },
    },
  });
}

export function runReporterAgent(
  runtime: AgentRuntime,
  report: BrewTruthReport
) {
  runtime.state.brewTruthReport = report;
  runtime.updateTelemetry({
    policyGateFailures: 0,
    truthScore: report.overallScore,
    testConfidence: report.overallScore,
    schemaDiffsDetected: Boolean(report.flags.length),
    coverage: report.overallScore,
  });
  runtime.emit({
    agentId: 'reporter_agent',
    eventType: 'report.emitted',
    stage: 'report',
    summary: 'BrewTruth report generated',
    payload: {
      truthScore: report.overallScore,
      coverage: report.overallScore,
      reportLabel: 'BrewTruth report generated',
    },
  });
  runtime.emit({
    agentId: 'telemetry_agent',
    eventType: 'telemetry.updated',
    stage: 'report',
    summary: 'Updated runtime telemetry from BrewTruth',
    payload: runtime.state.telemetry,
  });
}

export function runReporterAgentFailure(runtime: AgentRuntime, truthScore = 0) {
  runtime.updateTelemetry({
    policyGateFailures: 1,
    truthScore,
    testConfidence: truthScore,
    schemaDiffsDetected: true,
    coverage: truthScore,
  });
  runtime.emit({
    agentId: 'telemetry_agent',
    eventType: 'telemetry.updated',
    stage: 'report',
    summary: 'Updated runtime telemetry after stream error',
    payload: runtime.state.telemetry,
  });
}

export function runCollabAgent(
  runtime: AgentRuntime,
  payload: CollabMessagePayload
) {
  const nextCount = (runtime.state.collabSummary?.messageCount ?? 0) + 1;
  runtime.state.collabSummary = {
    messageCount: nextCount,
    lastAuthor: payload.author,
    lastMessage: payload.message,
  };

  runtime.emit({
    agentId: 'collab_agent',
    eventType: 'collab.message',
    stage: runtime.state.stage,
    summary: `${payload.author}: ${payload.message}`,
    payload: {
      ...payload,
      messageCount: nextCount,
    },
    uiHints: {
      surface: 'collab',
      emphasis: payload.kind,
    },
  });

  return runtime.state.collabSummary;
}

export function runReplayAgent(
  runtime: AgentRuntime,
  args: {
    provider?: string;
    model?: string;
    outcome: 'completed' | 'timeout' | 'error';
  }
) {
  const runLabel = `${args.outcome}:${args.provider ?? 'BrewAssist'}:${args.model ?? 'unknown-model'}`;
  runtime.state.replayLabel = runLabel;
  runtime.setStage('replay');
  runtime.emit({
    agentId: 'replay_agent',
    eventType: 'replay.available',
    stage: 'replay',
    summary: 'Replay trace available',
    payload: {
      runLabel,
      outcome: args.outcome,
    },
  });

  return {
    runLabel,
    eventCount: runtime.events.length,
    eventTypes: runtime.events.map((event) => event.eventType),
  };
}

export function buildBrewAssistEndPayload(
  runtime: AgentRuntime,
  args: {
    provider?: string;
    model?: string;
    route?: string;
    debugInfo?: unknown;
  }
) {
  return {
    provider: args.provider,
    model: args.model,
    route: args.route ?? 'brewassist',
    scopeCategory: runtime.state.intent,
    debugInfo: args.debugInfo,
    replay: runtime.state.replayLabel
      ? {
          runLabel: runtime.state.replayLabel,
          available: true,
        }
      : {
          available: false,
        },
  };
}
