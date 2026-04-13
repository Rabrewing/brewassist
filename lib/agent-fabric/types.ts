import type { Persona, PersonaId } from '@/lib/brewIdentityEngine';
import type { CockpitMode } from '@/lib/brewTypes';
import type { BrewTier } from '@/lib/commands/types';
import type { EnterpriseRole } from '@/lib/enterpriseContext';
import type { HybridWorkflowStage } from '@/lib/hybridWorkflow';
import type { UnifiedPolicyEnvelope } from '@/lib/toolbelt/handshake';
import type { RWX } from '@/lib/capabilities/registry';
import type { ScopeCategory } from '@/lib/intent-gatekeeper';
import type { BrewTruthReport } from '@/lib/brewtruth';

export type AgentId =
  | 'intent_agent'
  | 'planner_agent'
  | 'policy_agent'
  | 'executor_agent'
  | 'reporter_agent'
  | 'replay_agent'
  | 'telemetry_agent'
  | 'collab_agent';

export type AgentEventType =
  | 'intent.captured'
  | 'plan.created'
  | 'policy.evaluated'
  | 'preview.ready'
  | 'confirm.requested'
  | 'execute.started'
  | 'execute.completed'
  | 'report.emitted'
  | 'replay.available'
  | 'telemetry.updated'
  | 'collab.message';

export type AgentRuntimeContext = {
  sessionId: string;
  runId: string;
  tenantId?: string;
  orgId?: string;
  workspaceId?: string;
  repoProvider?: string;
  repoRoot?: string;
  repoId?: string;
  projectId?: string;
  userId: string;
  role: EnterpriseRole;
  cockpitMode: CockpitMode;
  tier: BrewTier;
  personaId: PersonaId;
  persona: Persona;
  input: string;
  mode: 'HRM' | 'LLM' | 'AGENT' | 'LOOP' | 'TOOL';
  capabilityId?: string;
  action?: RWX;
  confirmApply?: boolean;
  gepHeaderPresent?: boolean;
  truthScore?: number;
  truthFlags?: string[];
};

export type AgentRuntimeTelemetry = {
  policyGateFailures: number;
  truthScore: number;
  testConfidence: number;
  schemaDiffsDetected: boolean;
  coverage: number;
};

export type AgentRuntimeState = {
  stage: HybridWorkflowStage;
  intent?: ScopeCategory;
  commandCapabilityId?: string;
  plan?: {
    stepCount: number;
    summary: string;
    previewTargets: string[];
    requiresConfirm: boolean;
  };
  policy?: UnifiedPolicyEnvelope;
  brewTruthReport?: BrewTruthReport | null;
  accumulatedText?: string;
  replayLabel?: string;
  collabSummary?: {
    messageCount: number;
    lastAuthor?: string;
    lastMessage?: string;
  };
  telemetry: AgentRuntimeTelemetry;
};

export type CollabMessageKind = 'handoff' | 'review' | 'status' | 'report';

export type CollabMessagePayload = {
  author: string;
  message: string;
  kind: CollabMessageKind;
  source: 'agent' | 'human';
  presence?: string;
  screenShareActive?: boolean;
  reportReady?: boolean;
};

export type AgentEvent = {
  sessionId: string;
  runId: string;
  stage: HybridWorkflowStage;
  agentId: AgentId;
  eventType: AgentEventType;
  timestamp: string;
  actor: string;
  summary: string;
  payload: Record<string, unknown>;
  policyState?: UnifiedPolicyEnvelope;
  telemetry: AgentRuntimeTelemetry;
  uiHints?: Record<string, unknown>;
};
