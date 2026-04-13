import type { CockpitMode } from '@/lib/brewTypes';
import type { HybridWorkflowStage } from '@/lib/hybridWorkflow';
import {
  getDevOpsFeedbackState,
  getDevOpsFlowState,
  getDevOpsMemoryState,
  getDevOpsQualityState,
  updateDevOpsFeedbackState,
  updateDevOpsFlowState,
  updateDevOpsMemoryState,
  updateDevOpsQualityState,
} from './registry';

export interface DevOps8RuntimeSnapshot {
  isStreaming: boolean;
  plannerChurnCount: number;
  lastLatencyMs: number;
  interruptions: number;
  chunkCount: number;
  feedbackGaps: number;
  brewLastWrites: number;
  memorySkips: number;
  permissionGatingBlocks: number;
  conflicts: number;
  policyGateFailures: number;
  brewTruthScore: number;
  testConfidence: number;
  schemaDiffsDetected: boolean;
  definedScopeItems: number;
  executedItems: number;
  scopeCreepIncidents: number;
  boundaryViolations: number;
  recentChecks: number;
  coverage: number;
  violations: number;
  cockpitMode: CockpitMode;
  tier: 'basic' | 'pro' | 'rb';
  personaId: string;
  currentStage: HybridWorkflowStage;
  lastRunLabel: string;
  lastUpdatedAt: string;
}

export const DEVOPS8_DEFAULT_RUNTIME: DevOps8RuntimeSnapshot = {
  isStreaming: false,
  plannerChurnCount: 0,
  lastLatencyMs: 0,
  interruptions: 0,
  chunkCount: 0,
  feedbackGaps: 0,
  brewLastWrites: 0,
  memorySkips: 0,
  permissionGatingBlocks: 0,
  conflicts: 0,
  policyGateFailures: 0,
  brewTruthScore: 1,
  testConfidence: 1,
  schemaDiffsDetected: false,
  definedScopeItems: 1,
  executedItems: 0,
  scopeCreepIncidents: 0,
  boundaryViolations: 0,
  recentChecks: 0,
  coverage: 1,
  violations: 0,
  cockpitMode: 'admin',
  tier: 'basic',
  personaId: 'customer',
  currentStage: 'intent',
  lastRunLabel: '',
  lastUpdatedAt: new Date().toISOString(),
};

export type DevOps8RuntimeEventType =
  | 'intent.captured'
  | 'plan.created'
  | 'preview.ready'
  | 'confirm.requested'
  | 'execute.started'
  | 'execute.completed'
  | 'report.emitted'
  | 'replay.available'
  | 'telemetry.updated'
  | 'collab.message';

export type DevOps8RuntimeEventPayloadMap = {
  'intent.captured': {
    input: string;
    stage: HybridWorkflowStage;
    runLabel: string;
    cockpitMode: CockpitMode;
    tier: 'basic' | 'pro' | 'rb';
    personaId: string;
    repoProvider?: string;
    repoRoot?: string;
  };
  'plan.created': {
    stepCount: number;
    plannerChurnDelta?: number;
  };
  'preview.ready': {
    diffFiles?: number;
    hasChanges?: boolean;
  };
  'confirm.requested': {
    required: boolean;
    blockerCount?: number;
  };
  'execute.started': {
    latencyMs?: number;
  };
  'execute.completed': {
    latencyMs: number;
    truthScore?: number;
    coverage?: number;
    policyGateFailures?: number;
    schemaDiffsDetected?: boolean;
    responseText?: string;
    scope?: Partial<
      Pick<
        DevOps8RuntimeSnapshot,
        | 'definedScopeItems'
        | 'executedItems'
        | 'scopeCreepIncidents'
        | 'boundaryViolations'
        | 'recentChecks'
        | 'coverage'
        | 'violations'
      >
    >;
  };
  'report.emitted': {
    truthScore?: number;
    coverage?: number;
    reportLabel?: string;
  };
  'replay.available': {
    runLabel?: string;
  };
  'telemetry.updated': {
    policyGateFailures?: number;
    truthScore?: number;
    testConfidence?: number;
    schemaDiffsDetected?: boolean;
    coverage?: number;
  };
  'collab.message': {
    author: string;
    message: string;
    presence?: string;
    screenShareActive?: boolean;
    reportReady?: boolean;
  };
};

export type DevOps8RuntimeEvent<
  T extends DevOps8RuntimeEventType = DevOps8RuntimeEventType,
> = {
  type: T;
  at?: string;
  payload: DevOps8RuntimeEventPayloadMap[T];
};

export function reduceDevOps8Runtime(
  state: DevOps8RuntimeSnapshot,
  event: DevOps8RuntimeEvent
): DevOps8RuntimeSnapshot {
  const at = event.at ?? new Date().toISOString();
  const payload = event.payload as Record<string, unknown>;

  switch (event.type) {
    case 'intent.captured':
      return {
        ...state,
        cockpitMode: payload.cockpitMode as CockpitMode,
        tier: payload.tier as DevOps8RuntimeSnapshot['tier'],
        personaId: String(payload.personaId ?? state.personaId),
        currentStage: payload.stage as HybridWorkflowStage,
        lastRunLabel: String(payload.runLabel ?? state.lastRunLabel),
        lastUpdatedAt: at,
      };
    case 'plan.created':
      return {
        ...state,
        plannerChurnCount:
          state.plannerChurnCount + Number(payload.plannerChurnDelta ?? 1),
        currentStage: 'plan',
        lastUpdatedAt: at,
      };
    case 'preview.ready':
      return {
        ...state,
        currentStage: 'preview',
        lastUpdatedAt: at,
      };
    case 'confirm.requested':
      return {
        ...state,
        currentStage: 'confirm',
        permissionGatingBlocks:
          state.permissionGatingBlocks + Number(payload.blockerCount ?? 0),
        lastUpdatedAt: at,
      };
    case 'execute.started':
      return {
        ...state,
        isStreaming: true,
        currentStage: 'execute',
        lastLatencyMs: Number(payload.latencyMs ?? state.lastLatencyMs),
        lastUpdatedAt: at,
      };
    case 'execute.completed':
      return {
        ...state,
        isStreaming: false,
        currentStage: 'report',
        lastLatencyMs: Number(payload.latencyMs ?? state.lastLatencyMs),
        brewTruthScore:
          typeof payload.truthScore === 'number'
            ? payload.truthScore
            : state.brewTruthScore,
        testConfidence:
          typeof payload.truthScore === 'number'
            ? payload.truthScore
            : state.testConfidence,
        schemaDiffsDetected:
          typeof payload.schemaDiffsDetected === 'boolean'
            ? payload.schemaDiffsDetected
            : state.schemaDiffsDetected,
        coverage:
          typeof payload.coverage === 'number'
            ? payload.coverage
            : state.coverage,
        policyGateFailures:
          state.policyGateFailures + Number(payload.policyGateFailures ?? 0),
        definedScopeItems: Number(
          (payload.scope as Record<string, unknown> | undefined)
            ?.definedScopeItems ?? state.definedScopeItems
        ),
        executedItems: Number(
          (payload.scope as Record<string, unknown> | undefined)
            ?.executedItems ?? state.executedItems
        ),
        scopeCreepIncidents: Number(
          (payload.scope as Record<string, unknown> | undefined)
            ?.scopeCreepIncidents ?? state.scopeCreepIncidents
        ),
        boundaryViolations: Number(
          (payload.scope as Record<string, unknown> | undefined)
            ?.boundaryViolations ?? state.boundaryViolations
        ),
        recentChecks: Number(
          (payload.scope as Record<string, unknown> | undefined)
            ?.recentChecks ?? state.recentChecks
        ),
        violations: Number(
          (payload.scope as Record<string, unknown> | undefined)?.violations ??
            state.violations
        ),
        lastUpdatedAt: at,
      };
    case 'report.emitted':
      return {
        ...state,
        currentStage: 'report',
        brewTruthScore:
          typeof payload.truthScore === 'number'
            ? payload.truthScore
            : state.brewTruthScore,
        coverage:
          typeof payload.coverage === 'number'
            ? payload.coverage
            : state.coverage,
        lastRunLabel: String(payload.reportLabel ?? state.lastRunLabel),
        lastUpdatedAt: at,
      };
    case 'replay.available':
      return {
        ...state,
        currentStage: 'replay',
        lastRunLabel: String(payload.runLabel ?? state.lastRunLabel),
        lastUpdatedAt: at,
      };
    case 'telemetry.updated':
      return {
        ...state,
        policyGateFailures:
          typeof payload.policyGateFailures === 'number'
            ? payload.policyGateFailures
            : state.policyGateFailures,
        brewTruthScore:
          typeof payload.truthScore === 'number'
            ? payload.truthScore
            : state.brewTruthScore,
        testConfidence:
          typeof payload.testConfidence === 'number'
            ? payload.testConfidence
            : state.testConfidence,
        schemaDiffsDetected:
          typeof payload.schemaDiffsDetected === 'boolean'
            ? payload.schemaDiffsDetected
            : state.schemaDiffsDetected,
        coverage:
          typeof payload.coverage === 'number'
            ? payload.coverage
            : state.coverage,
        lastUpdatedAt: at,
      };
    case 'collab.message':
      return {
        ...state,
        lastRunLabel: String(payload.message ?? state.lastRunLabel).slice(
          0,
          120
        ),
        lastUpdatedAt: at,
      };
    default:
      return state;
  }
}

export function applyDevOps8RuntimeEvent(event: DevOps8RuntimeEvent) {
  const payload = event.payload as Record<string, unknown>;

  switch (event.type) {
    case 'intent.captured':
      updateDevOpsFlowState({ isStreaming: false });
      break;
    case 'plan.created':
      updateDevOpsFlowState({
        plannerChurnCount:
          getDevOpsFlowState().plannerChurnCount +
          Number(payload.plannerChurnDelta ?? 1),
      });
      break;
    case 'preview.ready':
      updateDevOpsFeedbackState({
        chunkCount: getDevOpsFeedbackState().chunkCount + 1,
        lastChunkTime: Date.now(),
      });
      break;
    case 'confirm.requested':
      updateDevOpsMemoryState({
        permissionGatingBlocks:
          getDevOpsMemoryState().permissionGatingBlocks +
          Number(payload.blockerCount ?? 0),
      });
      break;
    case 'execute.started':
      updateDevOpsFlowState({ isStreaming: true });
      break;
    case 'execute.completed':
      updateDevOpsFlowState({
        isStreaming: false,
        lastLatencyMs: Number(payload.latencyMs ?? 0),
      });
      updateDevOpsFeedbackState({
        chunkCount: getDevOpsFeedbackState().chunkCount + 1,
        lastChunkTime: Date.now(),
      });
      if (typeof payload.truthScore === 'number') {
        updateDevOpsQualityState({
          brewTruthScore: payload.truthScore,
          testConfidence: payload.truthScore,
          schemaDiffsDetected: Boolean(payload.schemaDiffsDetected),
          policyGateFailures:
            getDevOpsQualityState().policyGateFailures +
            Number(payload.policyGateFailures ?? 0),
        });
      }
      break;
    case 'report.emitted':
      updateDevOpsMemoryState({
        brewLastWrites: getDevOpsMemoryState().brewLastWrites + 1,
      });
      if (typeof payload.truthScore === 'number') {
        updateDevOpsQualityState({
          brewTruthScore: payload.truthScore,
          testConfidence: payload.truthScore,
        });
      }
      break;
    case 'replay.available':
      updateDevOpsFlowState({ isStreaming: false });
      break;
    case 'telemetry.updated':
      updateDevOpsQualityState({
        policyGateFailures:
          typeof payload.policyGateFailures === 'number'
            ? payload.policyGateFailures
            : getDevOpsQualityState().policyGateFailures,
        brewTruthScore:
          typeof payload.truthScore === 'number'
            ? payload.truthScore
            : getDevOpsQualityState().brewTruthScore,
        testConfidence:
          typeof payload.testConfidence === 'number'
            ? payload.testConfidence
            : getDevOpsQualityState().testConfidence,
        schemaDiffsDetected:
          typeof payload.schemaDiffsDetected === 'boolean'
            ? payload.schemaDiffsDetected
            : getDevOpsQualityState().schemaDiffsDetected,
      });
      break;
    case 'collab.message':
      updateDevOpsFeedbackState({
        lastChunkTime: Date.now(),
      });
      break;
  }

  return event.at ?? new Date().toISOString();
}
