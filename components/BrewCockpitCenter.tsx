import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import { SandboxDiffModal } from './modals/SandboxDiffModal';
import type { BrewTruthReport } from '@/lib/brewtruth'; // Import BrewTruthReport
import { ActionMenu } from './ActionMenu';
import type { BrewAssistApiRequest } from '@/pages/api/brewassist'; // Import BrewAssistApiRequest
import { useToolbelt } from '@/contexts/ToolbeltContext'; // Import useToolbelt
import { BrewTier } from '@/lib/commands/types'; // Import BrewTier
import { useCockpitMode } from '@/contexts/CockpitModeContext';
import { useRepoConnection } from '@/contexts/RepoConnectionContext';
import { useDevOps8Runtime } from '@/contexts/DevOps8RuntimeContext';
import { useEnterpriseSelection } from '@/contexts/EnterpriseSelectionContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { CockpitModeToggle } from './CockpitModeToggle';
import { InitWizardModal } from './InitWizardModal';
import { SlashCommandPalette } from './SlashCommandPalette';
import {
  CognitionState,
  assembleCognitionState,
  ReasoningMode,
  Intent,
  EmotionalState,
  RiskLevel,
} from '@/lib/brewCognition'; // Import CognitionState and assembleCognitionState
import { ScopeCategory } from '@/lib/intent-gatekeeper'; // Import ScopeCategory
import { getActivePersona, Persona } from '@/lib/brewIdentityEngine'; // Import getActivePersona and Persona
import { getMessageText } from '@/lib/ui/messageText';
import { UnifiedPolicyEnvelope } from '@/lib/toolbelt/handshake'; // Import UnifiedPolicyEnvelope
import {
  deriveWorkflowStageFromInput,
  getWorkflowStageHint,
  getWorkflowStageLabel,
  HYBRID_WORKFLOW_STAGES,
  type HybridWorkflowStage,
} from '@/lib/hybridWorkflow';
import { RichMarkdown } from './RichMarkdown';
import { NativeSummaryCard } from './NativeSummaryCard';
import {
  clearInitWizardDraft,
  shouldResumeInitWizard,
} from '@/lib/init/initWizardStorage';
import {
  normalizeNativeResponse,
  type NativeResponseSummary,
} from '@/lib/nativeResponseContract';
import {
  deriveBrewPmInitPath,
  describeInitBranch,
  type BrewPmInitPath,
} from '@/lib/init/initBranch';
import {
  describeWorkflowMode,
  getWorkflowModePromptRole,
  parseWorkflowCommand,
  toggleWorkflowMode,
  type WorkflowMode,
} from '@/lib/workflowMode';

type ToolbeltBrewMode = 'HRM' | 'LLM' | 'AGENT' | 'LOOP'; // Define ToolbeltBrewMode locally

type UiMessageRole = 'user' | 'assistant' | 'system';

interface UiMessage {
  id: string;
  role: UiMessageRole;
  content: string;
  truth?: BrewTruthReport | null; // Changed to BrewTruthReport
  blockedByTruth?: boolean;
  cognition?: CognitionState | null; // Allow null for cognition state
  route?: 'brewassist' | 'brewchat' | 'brewcore' | 'blocked'; // Add route to message
  scopeCategory?: ScopeCategory; // Add scopeCategory to message
  // S4.10c.2 Flow Mode
  fullText?: string;
  visibleText?: string;
  isTyping?: boolean;
  flowModeEnabled?: boolean;
}

type ReplayEvent = {
  run_id: string;
  event_type: string;
  payload: {
    summary?: string;
    stage?: string;
      payload?: {
        author?: string;
        message?: string;
        input?: string;
        kind?: string;
        decision?: 'apply' | 'always_apply' | 'reject_comment';
        comment?: string;
        files?: string[];
        presence?: string;
        source?: 'agent' | 'human';
      };
  };
  created_at: string;
};

type ReplayRun = {
  id: string;
  session_id?: string;
  status: string;
  closeout_status?: string | null;
  lane?: 'executor' | 'planner' | 'reviewer' | 'memory' | 'research';
  brewpm_verdict?: 'approved' | 'changes_requested' | 'rejected' | null;
  brewpm_reviewed_at?: string | null;
  brewpm_review_provider?: string | null;
  brewpm_review_model?: string | null;
  brewpm_review_summary?: string | null;
  brewpm_corrections?: string[] | null;
  brewpm_review_payload?: Record<string, unknown> | null;
  truth_score: number | null;
  created_at: string;
  events: ReplayEvent[];
};

type ReplayTrace = ReplayRun | null;
type ExecutionDecision = 'apply' | 'always_apply' | 'reject_comment';
type PendingExecutionAction = {
  payload: any;
  reason?: string;
  input: string;
};
type SessionRestoreContext = {
  latestEventType: string | null;
  stage: string;
  summary: string;
  assistantSummary: string;
  confirmDecision: 'apply' | 'always_apply' | 'reject_comment' | null;
  confirmFiles: string[];
  applySuccess: boolean | null;
  applyCommitHash: string | null;
  applyBranch: string | null;
  applyFiles: string[];
  brewpmVerdict: 'approved' | 'changes_requested' | 'rejected' | null;
  brewpmSummary: string | null;
  brewpmCorrections: string[];
};

type BrewAssistHealthResponse = {
  ok?: boolean;
  timestamp?: string;
  memoryStatus?: {
    enabled?: boolean;
    backend?: string;
    path?: string;
    lastUpdated?: string | null;
    hasHistory?: boolean;
  };
  hrmStatus?: {
    enabled?: boolean;
    model?: string;
    lastRunAt?: string | null;
    lastOk?: boolean | null;
    lastError?: string | null;
    lastInputSummary?: string | null;
    lastOutputSummary?: string | null;
  };
  engine?: {
    model?: string;
    hrmEngine?: string;
  };
};

const defaultSystemLine =
  'BrewAssist is online. Choose Build or Plan, then select HRM, LLM, Agent, or Loop and send a prompt to begin.';

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeResumeStage(
  value: string | null | undefined
): HybridWorkflowStage {
  if (
    value &&
    HYBRID_WORKFLOW_STAGES.includes(value as HybridWorkflowStage)
  ) {
    return value as HybridWorkflowStage;
  }
  return 'report';
}

function buildRestoredMessages(
  trace: ReplayRun,
  resumeStage: HybridWorkflowStage
): UiMessage[] {
  const intentEvent = trace.events.find(
    (event) => event.event_type === 'intent.captured'
  );
  const collabEvent = [...trace.events]
    .reverse()
    .find((event) => event.event_type === 'collab.message');
  const latestEvent = trace.events[trace.events.length - 1] ?? null;

  const userInput =
    typeof intentEvent?.payload?.payload?.input === 'string'
      ? intentEvent.payload.payload.input
      : null;

  const assistantSummary =
    collabEvent?.payload?.payload?.message ??
    (latestEvent?.event_type === 'confirm.requested'
      ? 'This run was waiting on confirmation. Review the restored session context before executing.'
      : latestEvent?.event_type === 'apply.completed'
        ? 'The sandbox apply completed in the restored session. Review the replay trace and result before continuing.'
      : latestEvent?.event_type === 'preview.ready'
        ? 'A preview was ready in the restored session. Review the trace and continue from the command center.'
      : latestEvent?.event_type === 'execute.completed'
        ? 'Execution completed in the restored session. Review report and replay details before making the next move.'
          : latestEvent?.event_type === 'report.emitted'
            ? 'A report was emitted for the restored session. Continue from the command center or open replay for the full trace.'
            : 'Session restored from persisted workflow events. Continue from the current stage or inspect replay for full trace.');

  const restoredMessages: UiMessage[] = [
    {
      id: `resume-system-${trace.id}`,
      role: 'system',
      content: `Resumed session from persisted run ${trace.id.slice(0, 8)} at ${getWorkflowStageLabel(
        resumeStage
      ).toLowerCase()} stage.`,
    },
  ];

  if (userInput) {
    restoredMessages.push({
      id: `resume-user-${trace.id}`,
      role: 'user',
      content: userInput,
    });
  }

  restoredMessages.push({
    id: `resume-assistant-${trace.id}`,
    role: 'assistant',
    content: assistantSummary,
    truth: null,
    blockedByTruth: false,
    cognition: null,
    route: 'brewassist',
    scopeCategory: 'UNKNOWN',
  });

  return restoredMessages;
}

function buildSessionRestoreMessages(
  sessionId: string,
  stage: HybridWorkflowStage,
  context: SessionRestoreContext | null
): UiMessage[] {
  const summary = context?.summary ?? 'Session restored from persisted state.';
  const assistantSummary =
    context?.assistantSummary ?? 'The session is ready to continue.';
  const extraLines = [
    context?.latestEventType
      ? `Latest event: ${context.latestEventType}`
      : null,
    context?.confirmDecision
      ? `Confirm decision: ${context.confirmDecision}`
      : null,
    context?.applySuccess === true
      ? `Apply result: ${context.applyCommitHash ?? 'completed'}`
      : context?.applySuccess === false
        ? 'Apply result: failed'
        : null,
    context?.brewpmVerdict
      ? `BrewPM verdict: ${context.brewpmVerdict}`
      : context?.brewpmSummary
        ? `BrewPM closeout: ${context.brewpmSummary}`
        : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return [
    {
      id: `resume-system-${sessionId}`,
      role: 'system',
      content: `Resumed session from persisted state at ${getWorkflowStageLabel(
        stage
      ).toLowerCase()} stage.`,
    },
    {
      id: `resume-assistant-${sessionId}`,
      role: 'assistant',
      content: `${summary}${extraLines ? `\n${extraLines}` : ''}\n${assistantSummary}`,
      truth: null,
      blockedByTruth: false,
      cognition: null,
      route: 'brewassist',
      scopeCategory: 'UNKNOWN',
    },
  ];
}

function getReplayDecisionLabel(trace: ReplayTrace) {
  const collabEvent = trace?.events
    ?.slice()
    .reverse()
    .find((event) => event.event_type === 'collab.message');

  return (
    collabEvent?.payload?.payload?.decision ??
    collabEvent?.payload?.payload?.kind ??
    'status'
  );
}

function getReplayConfirmTrail(trace: ReplayTrace) {
  const confirmEvent = trace?.events
    ?.slice()
    .reverse()
    .find((event) => event.event_type === 'confirm.requested');
  const payload = (confirmEvent?.payload?.payload ?? {}) as {
    decision?: ExecutionDecision;
    comment?: string;
    files?: string[];
  };

  return {
    decision: payload.decision,
    comment: typeof payload.comment === 'string' ? payload.comment : '',
    files: Array.isArray(payload.files)
      ? payload.files.filter((file): file is string => typeof file === 'string')
      : [],
    updatedAt: confirmEvent?.created_at ?? null,
  };
}

function getReplayApplyTrail(trace: ReplayTrace) {
  const applyEvent = trace?.events
    ?.slice()
    .reverse()
    .find((event) => event.event_type === 'apply.completed');
  const payload = (applyEvent?.payload?.payload ?? {}) as {
    success?: boolean;
    decision?: ExecutionDecision;
    commitHash?: string | null;
    branch?: string | null;
    changedFiles?: string[];
    output?: string | null;
    error?: string | null;
  };

  return {
    success: Boolean(payload.success),
    decision: payload.decision,
    commitHash: payload.commitHash ?? null,
    branch: payload.branch ?? null,
    changedFiles: Array.isArray(payload.changedFiles)
      ? payload.changedFiles.filter((file): file is string => typeof file === 'string')
      : [],
    output: typeof payload.output === 'string' ? payload.output : '',
    error: typeof payload.error === 'string' ? payload.error : '',
    updatedAt: applyEvent?.created_at ?? null,
  };
}

function getReplayLaneLabel(trace: ReplayTrace) {
  if (!trace) return 'executor';
  if (typeof trace.closeout_status === 'string' && trace.closeout_status) {
    return 'reviewer';
  }

  const reportEvent = trace.events
    .slice()
    .reverse()
    .find((event) => event.event_type === 'report.emitted');
  const executeEvent = trace.events
    .slice()
    .reverse()
    .find((event) => event.event_type === 'execute.completed');
  const reportPayload = reportEvent?.payload as any;
  const executePayload = executeEvent?.payload as any;
  const lane =
    reportPayload?.lane ??
    executePayload?.lane ??
    reportPayload?.role ??
    executePayload?.role;

  if (
    lane === 'planner' ||
    lane === 'reviewer' ||
    lane === 'memory' ||
    lane === 'research'
  ) {
    return lane;
  }

  return 'executor';
}

function getAgentAuditLiveLane(stage: HybridWorkflowStage) {
  switch (stage) {
    case 'intent':
      return 'Intent intake';
    case 'plan':
      return 'Planner lane';
    case 'preview':
      return 'Preview lane';
    case 'confirm':
      return 'Policy gate';
    case 'execute':
      return 'Executor lane';
    case 'report':
      return 'Reporter lane';
    case 'replay':
      return 'Replay lane';
    default:
      return 'Runtime lane';
  }
}

function shortenAuditText(text: string, limit = 140) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

function buildReplayNativeSummary(
  trace: ReplayTrace
): NativeResponseSummary | null {
  if (!trace) return null;
  const confirmTrail = getReplayConfirmTrail(trace);
  const applyTrail = getReplayApplyTrail(trace);

  const brewpmReviewPayload = trace.brewpm_review_payload as
    | {
        verdict?: 'approved' | 'changes_requested' | 'rejected';
        summary?: string;
        corrections?: string[];
        specChecks?: string[];
        evidence?: string[];
        risks?: string[];
        nextStep?: string;
        rawText?: string;
        model?: { providerId?: string; modelId?: string };
      }
    | null
    | undefined;
  const brewpmReview =
    brewpmReviewPayload ??
    (trace.brewpm_verdict
      ? {
          verdict: trace.brewpm_verdict,
          summary: trace.brewpm_review_summary ?? undefined,
          corrections: trace.brewpm_corrections ?? [],
          model:
            trace.brewpm_review_provider && trace.brewpm_review_model
              ? {
                  providerId: trace.brewpm_review_provider,
                  modelId: trace.brewpm_review_model,
                }
              : undefined,
        }
      : null);
  const collabEvent = trace.events
    .slice()
    .reverse()
    .find((event) => event.event_type === 'collab.message');
  const reportEvent = trace.events
    .slice()
    .reverse()
    .find((event) => event.event_type === 'report.emitted');
  const executeEvent = trace.events
    .slice()
    .reverse()
    .find((event) => event.event_type === 'execute.completed');
  const reportPayload = reportEvent?.payload as any;
  const executePayload = executeEvent?.payload as any;
  const summaryText =
    brewpmReview?.summary ??
    collabEvent?.payload?.payload?.message ??
    reportPayload?.summary ??
    executePayload?.summary ??
    'Replay trace loaded for inspection.';
  const changedFiles =
    brewpmReview?.corrections ??
    collabEvent?.payload?.payload?.files ??
    (reportPayload?.changed as string[] | undefined) ??
    [];
  const truthScore =
    typeof trace.truth_score === 'number' ? trace.truth_score : null;
  const decisionLabel =
    confirmTrail.decision === 'always_apply'
      ? 'Always apply'
      : confirmTrail.decision === 'reject_comment'
        ? 'Reject with comment'
        : confirmTrail.decision === 'apply'
          ? 'Apply once'
          : undefined;
  const decisionNote = decisionLabel
    ? `Recorded in the session trail${confirmTrail.updatedAt ? ` at ${new Date(confirmTrail.updatedAt).toLocaleString()}` : ''}${confirmTrail.comment ? ` · ${confirmTrail.comment}` : ''}`
    : undefined;
  const applyLabel =
    typeof applyTrail.success === 'boolean' && applyTrail.updatedAt
      ? applyTrail.success
        ? 'Apply completed'
        : 'Apply failed'
      : undefined;
  const applyNote =
    applyLabel && applyTrail.updatedAt
      ? `Recorded in the session trail at ${new Date(applyTrail.updatedAt).toLocaleString()}${applyTrail.commitHash ? ` · ${applyTrail.commitHash}` : ''}${applyTrail.error ? ` · ${applyTrail.error}` : ''}`
      : undefined;

  return normalizeNativeResponse({
    title: brewpmReview?.verdict ? 'BrewPM Review' : 'Replay summary',
    sourceLabel:
      brewpmReview?.model?.providerId && brewpmReview?.model?.modelId
        ? `${brewpmReview.model.providerId}/${brewpmReview.model.modelId}`
        : trace.id.slice(0, 8),
    lane: trace.lane ?? getReplayLaneLabel(trace),
    status:
      brewpmReview?.verdict ??
      (typeof trace.closeout_status === 'string'
        ? trace.closeout_status
        : typeof reportPayload?.status === 'string'
          ? reportPayload.status
          : typeof executePayload?.status === 'string'
            ? executePayload.status
            : trace.status),
    rawText: summaryText,
    summary: summaryText,
    changed: Array.isArray(changedFiles) ? changedFiles : [],
    verified: [
      ...(brewpmReview?.specChecks?.length
        ? brewpmReview.specChecks
        : [`Run status: ${trace.status}`]),
      typeof truthScore === 'number'
        ? `BrewTruth ${Math.round(truthScore * 100)}%`
        : 'BrewTruth unavailable',
      ...(brewpmReview?.evidence?.length
        ? brewpmReview.evidence
        : [trace.session_id ? 'Session-scoped replay' : 'Org replay']),
    ],
    remaining: [
      ...(brewpmReview?.verdict === 'approved'
        ? ['Inspect the trace below for event-by-event detail.']
        : ['Inspect the trace below for the BrewPM corrections.']),
      'Open the sandbox workspace for the live repo shadow.',
    ],
    risks: [
      ...(brewpmReview?.risks ?? []),
      ...(executePayload?.scope?.boundaryViolations ||
      executePayload?.scope?.scopeCreepIncidents
        ? ['Execution reported boundary or scope warnings.']
        : []),
    ],
    nextStep:
      brewpmReview?.nextStep ??
      'Review the run trace or continue from the command center.',
    truthScore,
    policyOk: true,
    decisionLabel: applyLabel ?? decisionLabel,
    decisionNote: applyNote ?? decisionNote,
  });
}

export const BrewCockpitCenter: React.FC = () => {
  // Removed props
  const { mode, setMode, tier, setTier } = useToolbelt(); // Consume from context
  const { mode: cockpitMode } = useCockpitMode();
  const { repoProvider, repoRoot } = useRepoConnection();
  const repoConnectionMissing = !repoRoot;
  const {
    orgId,
    workspaceId,
    selectedReplaySessionId,
    selectedReplayRunId,
    replayOpenRequestToken,
    setSelectedReplaySessionId,
    setSelectedReplayRunId,
  } = useEnterpriseSelection();
  const { session } = useSupabaseAuth();
  const { recordEvent: recordDevOps8Event } = useDevOps8Runtime();
  const [input, setInput] = useState('');
  const [showSandboxDiffModal, setShowSandboxDiffModal] = useState(false);
  const [hasPendingSandboxChanges, setHasPendingSandboxChanges] = useState(false);
  const [sandboxReviewSummary, setSandboxReviewSummary] = useState<{
    diffFiles: number;
    addedLines: number;
    removedLines: number;
    hasBinaryHint: boolean;
    hasChanges: boolean;
    files: string[];
    decision?: ExecutionDecision;
    updatedAt: number;
  } | null>(null);
  const sandboxPreviewNoticeShownRef = useRef(false);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: 'initial-system-message', // Use a static ID for the initial message
      role: 'system',
      content: defaultSystemLine,
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [cognitionState, setCognitionState] = useState<CognitionState | null>(
    null
  );
  const [cognitionPhase, setCognitionPhase] = useState<string>(
    'Initializing BrewAssist...'
  );
  const [lastError, setLastError] = useState<string | null>(null);
  const [workflowStage, setWorkflowStage] =
    useState<HybridWorkflowStage>('intent');
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>('BUILD');
  const [showInitWizard, setShowInitWizard] = useState(false);
  const [showFirstRunBanner, setShowFirstRunBanner] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [replayRuns, setReplayRuns] = useState<ReplayRun[]>([]);
  const [replayLoading, setReplayLoading] = useState(false);
  const [replayError, setReplayError] = useState<string | null>(null);
  const [selectedReplayTrace, setSelectedReplayTrace] =
    useState<ReplayTrace>(null);
  const [selectedReplayLoading, setSelectedReplayLoading] = useState(false);
  const [runtimeTruth, setRuntimeTruth] =
    useState<BrewAssistHealthResponse | null>(null);
  const [resumeTarget, setResumeTarget] = useState<{
    sessionId: string | null;
    runId: string | null;
    stage: HybridWorkflowStage;
  } | null>(null);
  const router = useRouter();

  const selectedCollabEvents = useMemo(
    () =>
      (selectedReplayTrace?.events ?? []).filter(
        (event) => event.event_type === 'collab.message'
      ),
    [selectedReplayTrace]
  );

  const selectedReplaySummary = useMemo(
    () => buildReplayNativeSummary(selectedReplayTrace),
    [selectedReplayTrace]
  );
  const selectedReplayConfirmTrail = useMemo(
    () => getReplayConfirmTrail(selectedReplayTrace),
    [selectedReplayTrace]
  );
  const selectedReplayApplyTrail = useMemo(
    () => getReplayApplyTrail(selectedReplayTrace),
    [selectedReplayTrace]
  );
  const lastAssistantMessage = useMemo(
    () => messages.filter((msg) => msg.role === 'assistant').pop() ?? null,
    [messages]
  );
  const agentAuditSnapshot = useMemo(() => {
    const stageLabel = getWorkflowStageLabel(workflowStage);
    const stageHint = getWorkflowStageHint(workflowStage);
    const liveLane = getAgentAuditLiveLane(workflowStage);
    const liveActivitySource = lastAssistantMessage
      ? 'Most recent assistant response in the live cockpit'
      : selectedReplayTrace
        ? `Replay trace ${selectedReplayTrace.id.slice(0, 8)}`
        : 'Waiting for the first assistant turn';
    const liveActivity = lastAssistantMessage
      ? shortenAuditText(getMessageText(lastAssistantMessage))
      : selectedReplaySummary?.summary
        ? shortenAuditText(selectedReplaySummary.summary)
        : selectedReplayTrace
          ? shortenAuditText(
              selectedReplayTrace.brewpm_review_summary ??
                'Replay trace loaded for inspection.'
            )
          : 'No agent output yet.';
    const trailState = selectedReplayTrace
      ? selectedReplayTrace.brewpm_verdict
        ? `BrewPM verdict ${selectedReplayTrace.brewpm_verdict}`
        : typeof selectedReplayTrace.closeout_status === 'string'
          ? `Closeout status ${selectedReplayTrace.closeout_status}`
          : 'Replay trail ready for review'
      : 'Confirm and apply trails will populate after the first run.';
    const trailSource = selectedReplayTrace
      ? selectedReplayTrace.brewpm_review_provider &&
        selectedReplayTrace.brewpm_review_model
        ? `${selectedReplayTrace.brewpm_review_provider}/${selectedReplayTrace.brewpm_review_model}`
        : `Trace ${selectedReplayTrace.id.slice(0, 8)}`
      : 'No replay trace selected';

    return {
      stageLabel,
      stageHint,
      liveLane,
      liveActivitySource,
      liveActivity,
      trailState,
      trailSource,
    };
  }, [
    lastAssistantMessage,
    selectedReplaySummary?.summary,
    selectedReplayTrace,
    workflowStage,
  ]);

  const roleLanes = [
    {
      name: 'Planner',
      role: 'HRM / command center',
      detail: 'Turns intent into plan and review context.',
    },
    {
      name: 'Executor',
      role: 'Sandbox / mirror',
      detail: 'Stages files, diffs, validation, and apply.',
    },
    {
      name: 'Reviewer',
      role: 'Replay / confirm',
      detail: 'Checks diffs, policy, and handoff summaries.',
    },
    {
      name: 'Memory',
      role: 'BrewLast / context',
      detail: 'Restores the last run, handoff, and workspace state.',
    },
    {
      name: 'Research',
      role: 'Source / bundle',
      detail: 'Gathers external context and supporting evidence.',
    },
  ];
  const agentAuditLanes = [
    {
      name: 'Intent',
      role: 'runtime / intake',
      detail: 'Classifies the request and seeds the execution stage.',
    },
    {
      name: 'Planner',
      role: 'runtime / plan',
      detail: 'Builds the plan and decides whether confirmation is required.',
    },
    {
      name: 'Policy',
      role: 'runtime / confirm',
      detail: 'Enforces gating and emits the confirm trail when needed.',
    },
    {
      name: 'Executor',
      role: 'runtime / execute',
      detail: 'Streams the work, updates telemetry, and emits closeout status.',
    },
    {
      name: 'Reporter / Replay',
      role: 'runtime / review',
      detail: 'Persists the closeout and makes the replay readable.',
    },
  ];

  useEffect(() => {
    if (!selectedReplayRunId || replayOpenRequestToken === 0) return;
    setWorkflowStage('replay');
  }, [replayOpenRequestToken, selectedReplayRunId]);

  useEffect(() => {
    if (!router.isReady) return;

    const resumeRunId =
      typeof router.query.resumeRunId === 'string'
        ? router.query.resumeRunId
        : null;
    const resumeSessionId =
      typeof router.query.resumeSessionId === 'string'
        ? router.query.resumeSessionId
        : null;

    if (!resumeRunId && !resumeSessionId) return;

    setResumeTarget({
      sessionId: resumeSessionId,
      runId: resumeRunId,
      stage: normalizeResumeStage(
        typeof router.query.resumeStage === 'string'
          ? router.query.resumeStage
          : null
      ),
    });

    void router.replace(
      {
        pathname: router.pathname,
        query: {},
      },
      undefined,
      { shallow: true }
    );
  }, [router, setSelectedReplayRunId, setSelectedReplaySessionId]);

  // S4.10c.2 Flow Mode State
  const [flowModeEnabled, setFlowModeEnabled] = useState(() => {
    if (typeof window === 'undefined') return cockpitMode === 'customer';
    const stored = localStorage.getItem('brewassist.flowMode');
    if (stored !== null) return JSON.parse(stored);
    return cockpitMode === 'customer';
  });
  const [nextUseDeepReasoning, setNextUseDeepReasoning] = useState(false);
  const [nextUseResearchModel, setNextUseResearchModel] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<PendingExecutionAction | null>(null);
  const [executionPreference, setExecutionPreference] =
    useState<Exclude<ExecutionDecision, 'reject_comment'>>('apply');
  const [executionRejectComment, setExecutionRejectComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [nativeExecutionSummary, setNativeExecutionSummary] =
    useState<NativeResponseSummary | null>(null);
  const [brewPmReviewSummary, setBrewPmReviewSummary] =
    useState<NativeResponseSummary | null>(null);
  const brewPmSummary = useMemo(
    () => {
      if (brewPmReviewSummary) {
        return brewPmReviewSummary;
      }

      return normalizeNativeResponse({
        title: 'BrewPM Review',
        sourceLabel: 'BrewPM · OpenAI/gpt-5.4-pro',
        lane: 'reviewer',
        status: nativeExecutionSummary?.status ?? 'ready_for_review',
        summary: nativeExecutionSummary
          ? 'BrewPM validates the phase closeout against brewdocs, the active phase plan, the diff, and the test output before greenlight.'
          : 'BrewPM is the reviewer lane that will validate structured closeouts against brewdocs, the active phase plan, the diff, and the test output.',
        changed: [
          nativeExecutionSummary
            ? 'Execution closeout captured in the cockpit'
            : 'Awaiting a structured closeout artifact',
          sandboxReviewSummary
            ? `Sandbox handoff covers ${sandboxReviewSummary.diffFiles} changed file${sandboxReviewSummary.diffFiles === 1 ? '' : 's'}`
            : 'Sandbox handoff still pending',
        ],
        verified: [
          'BrewPM contract is documented in brewdocs',
          'Reviewer lane is role-based and replayable',
          'Backing model set to OpenAI gpt-5.4-pro',
        ],
        remaining: nativeExecutionSummary
          ? ['Approve, request changes, or reject the closeout']
          : ['Run a phase and emit a closeout report'],
        risks: [
          'BrewPM is a reviewer lane, not the executor',
          'No copy/paste should be required for review',
        ],
        nextStep: nativeExecutionSummary
          ? 'Open replay and approve or correct the closeout.'
          : 'Complete an execution phase so BrewPM can review the closeout.',
      });
    },
    [brewPmReviewSummary, nativeExecutionSummary, sandboxReviewSummary]
  );
  const composerDraftKey = 'brewassist.cockpit.composerDraft';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedDraft = window.localStorage.getItem(composerDraftKey);
    if (storedDraft && !input) {
      setInput(storedDraft);
    }
  }, [composerDraftKey, input]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (input.trim()) {
      window.localStorage.setItem(composerDraftKey, input);
    } else {
      window.localStorage.removeItem(composerDraftKey);
    }
  }, [composerDraftKey, input]);

  const composerPlaceholder = showFirstRunBanner
    ? 'BrewAssist setup... Type / for commands or /init to onboard.'
    : `BrewAssist ${describeWorkflowMode(workflowMode).toLowerCase()}... Type / for commands.`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedMode = window.localStorage.getItem('brewassist.workflowMode');
    if (storedMode === 'BUILD' || storedMode === 'PLAN') {
      setWorkflowMode(storedMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('brewassist.workflowMode', workflowMode);
  }, [workflowMode]);

  const buildSandboxReviewNotice = useCallback(
    (summary: {
      diffFiles: number;
      addedLines: number;
      removedLines: number;
      hasBinaryHint: boolean;
      hasChanges: boolean;
      files: string[];
      decision?: ExecutionDecision;
    }) => {
      const fileCountLabel = `${summary.diffFiles} file${summary.diffFiles === 1 ? '' : 's'}`;
      const decisionLabel =
        summary.decision === 'always_apply'
          ? 'Always apply'
          : summary.decision === 'reject_comment'
            ? 'Reject with comment'
            : 'Apply once';
      const fileList =
        summary.files.length > 0
          ? summary.files.map((file) => `- ${file}`).join('\n')
          : '- No file list available yet';

      return [
        '### Sandbox code review ready',
        `- Pending changes: ${summary.hasChanges ? fileCountLabel : 'No pending changes'}`,
        `- Line stats: +${summary.addedLines} / -${summary.removedLines}`,
        `- Binary hint: ${summary.hasBinaryHint ? 'Yes' : 'No'}`,
        `- Decision: ${decisionLabel}`,
        '- Main panel now owns the code review summary; the sandbox modal is the detail layer.',
        '- Files:',
        fileList,
      ].join('\n');
    },
    []
  );

  const getSandboxDecisionLabel = useCallback(
    (decision?: ExecutionDecision) => {
      if (decision === 'always_apply') return 'Always apply';
      if (decision === 'reject_comment') return 'Reject with comment';
      return 'Apply once';
    },
    []
  );

  const scrollMessageStreamToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      if (!bottomRef.current) return;
      bottomRef.current.scrollIntoView({ behavior, block: 'end' });
    },
    []
  );

  const buildInitAnalysisPrompt = useCallback(
    (summary: string, nextPrompt: string, brewpmPath: BrewPmInitPath) =>
      [
        brewpmPath === 'planner'
          ? 'BrewPM planning lead mode: establish the project spec, execution protocol, and success outcomes before any code is changed.'
          : 'Analyze the connected repo using the completed onboarding profile.',
        brewpmPath === 'planner'
          ? 'Normalize the onboarding profile into the first execution plan and define the repo contract.'
          : 'Summarize the repo structure, likely stack, risk areas, and the best first plan.',
        'Use the onboarding profile below as the source of truth for what to inspect.',
        '',
        summary,
        '',
        nextPrompt,
      ].join('\n'),
    []
  );

  const buildInitBranchSummary = useCallback(
    (summary: string, brewpmPath: BrewPmInitPath, branchLabel: string) =>
      normalizeNativeResponse({
        title: brewpmPath === 'planner' ? 'BrewPM Planning Lead' : 'BrewPM Review Ready',
        sourceLabel: branchLabel,
        lane: brewpmPath,
        status: 'ready_for_review',
        summary:
          brewpmPath === 'planner'
            ? 'BrewPM will normalize the bootstrap repo spec, define success outcomes, and establish the execution protocol.'
            : 'BrewPM will validate the existing repo closeout against brewdocs, the active phase plan, the diff, and the test output.',
        changed:
          brewpmPath === 'planner'
            ? ['New repo bootstrap selected', 'Planning lead mode enabled']
            : ['Existing connected repo selected', 'Reviewer lane enabled'],
        verified:
          brewpmPath === 'planner'
            ? ['Planning lead contract loaded from brewdocs', 'Bootstrap onboarding captured']
            : ['Reviewer contract loaded from brewdocs', 'Existing repo onboarding captured'],
        remaining:
          brewpmPath === 'planner'
            ? ['Draft the first execution protocol', 'Define success outcomes and SDLC guardrails']
            : ['Run the repo analysis', 'Preview the diff before confirm'],
        risks:
          brewpmPath === 'planner'
            ? ['No repo shadow yet', 'Planning lead mode is pre-execution']
            : ['BrewPM is a reviewer lane, not the executor', 'No copy/paste should be required for review'],
        nextStep:
          brewpmPath === 'planner'
            ? 'Use the planning lane to write the first repo contract.'
            : 'Continue into planning and execution, then let BrewPM review the closeout.',
        rawText: summary,
      }),
    []
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('brewassist.executionPreference');
    if (stored === 'always_apply') {
      setExecutionPreference('always_apply');
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadRuntimeTruth = async () => {
      try {
        const response = await fetch('/api/brewassist-health');
        if (!response.ok) return;
        const data = (await response.json()) as BrewAssistHealthResponse;
        if (!active) return;
        setRuntimeTruth(data);
      } catch {
        if (!active) return;
        setRuntimeTruth(null);
      }
    };

    void loadRuntimeTruth();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const completed = localStorage.getItem('brewassist.init.complete');
    const dismissed = localStorage.getItem('brewassist.init.dismissed');
    const shouldResume = shouldResumeInitWizard();
    const shouldShow = shouldResume || (!completed && !dismissed);
    setShowFirstRunBanner(shouldShow);
    if (shouldShow) {
      setShowInitWizard(true);
      localStorage.removeItem('brewassist.init.dismissed');
    }
  }, [isClient]);

  useEffect(() => {
    if (input === '/') {
      setShowCommandPalette(true);
    }
  }, [input]);

  // Persist flowModeEnabled
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(
        'brewassist.flowMode',
        JSON.stringify(flowModeEnabled)
      );
    }
  }, [flowModeEnabled, isClient]);

  // S4.10c.2 Flow Mode Helpers
  const tokenizeWords = (text: string): string[] => {
    return text.split(/\s+/).filter((word) => word.length > 0);
  };

  const advanceVisibleText = (
    fullText: string,
    currentVisible: string
  ): string => {
    const words = tokenizeWords(fullText);
    const visibleWords = tokenizeWords(currentVisible);
    const wordsToAdd = Math.floor(Math.random() * 5) + 2; // 2-6 words
    const newVisibleWords = words.slice(0, visibleWords.length + wordsToAdd);
    return newVisibleWords.join(' ');
  };

  const getPauseMs = (lastChar: string): number => {
    if (['.', '!', '?', ':', ';'].includes(lastChar)) {
      return Math.floor(Math.random() * 100) + 150; // 150-250ms
    }
    if (lastChar === '\n') {
      return Math.floor(Math.random() * 80) + 120; // 120-200ms
    }
    return Math.floor(Math.random() * 40) + 80; // 80-120ms
  };

  // Typing animation
  useEffect(() => {
    const typingMessage = messages.find(
      (msg) => msg.isTyping && msg.role === 'assistant'
    );
    if (!typingMessage || !typingMessage.fullText) return;

    const interval = setInterval(
      () => {
        // @ts-ignore
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== typingMessage.id) return msg;

            const newVisible = advanceVisibleText(
              msg.fullText!,
              msg.visibleText || ''
            );
            const isComplete = newVisible === msg.fullText;

            if (isComplete) {
              clearInterval(interval);
              return {
                ...msg,
                visibleText: newVisible,
                content: newVisible,
                isTyping: false,
              };
            }

            // Auto-scroll if near bottom
            if (bottomRef.current && isNearBottom()) {
              bottomRef.current.scrollIntoView({ behavior: 'smooth' });
            }

            return { ...msg, visibleText: newVisible, content: newVisible };
          })
        );
      },
      getPauseMs(typingMessage.visibleText?.slice(-1) || '')
    );

    return () => clearInterval(interval);
  }, [messages]);

  // Skip typing function
  const skipTyping = (messageId: string) => {
    setMessages(
      (prev) =>
        prev.map((msg) =>
          msg.id === messageId && msg.isTyping
            ? ({
                ...msg,
                visibleText: msg.fullText,
                content: msg.fullText,
                isTyping: false,
              } as UiMessage)
            : msg
        ) as UiMessage[]
    );
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 1 && bottomRef.current && isNearBottom()) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages.length]);

  useEffect(() => {
    if (workflowStage !== 'replay') return;
    if (!orgId || !session?.access_token) return;

    let active = true;
    setReplayLoading(true);
    setReplayError(null);

    const loadReplayHistory = async () => {
      try {
        const replayParams = new URLSearchParams();
        if (selectedReplaySessionId) {
          replayParams.set('sessionId', selectedReplaySessionId);
        }

        const response = await fetch(
          `/api/replay-history${replayParams.size ? `?${replayParams.toString()}` : ''}`,
          {
            headers: {
              'x-brewassist-org-id': orgId,
              ...(workspaceId
                ? { 'x-brewassist-workspace-id': workspaceId }
                : {}),
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          const body = await response
            .json()
            .catch(() => ({ error: 'Unable to load replay history' }));
          throw new Error(body.error || 'Unable to load replay history');
        }

        const data = await response.json();
        if (!active) return;
        setReplayRuns(data.runs ?? []);
        const firstRunId = data.runs?.[0]?.id ?? null;
        setSelectedReplayRunId(selectedReplayRunId ?? firstRunId);
      } catch (error: any) {
        if (!active) return;
        setReplayError(error?.message ?? 'Unable to load replay history');
      } finally {
        if (active) setReplayLoading(false);
      }
    };

    void loadReplayHistory();

    return () => {
      active = false;
    };
  }, [
    workflowStage,
    orgId,
    selectedReplaySessionId,
    selectedReplayRunId,
    session,
    setSelectedReplayRunId,
    workspaceId,
  ]);

  useEffect(() => {
    if (workflowStage !== 'replay') return;
    if (!selectedReplayRunId || !orgId || !session?.access_token) return;

    let active = true;
    setSelectedReplayLoading(true);

    const loadReplayTrace = async () => {
      try {
        const response = await fetch(
          `/api/replay-history?runId=${encodeURIComponent(selectedReplayRunId)}`,
          {
            headers: {
              'x-brewassist-org-id': orgId,
              ...(workspaceId
                ? { 'x-brewassist-workspace-id': workspaceId }
                : {}),
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          const body = await response
            .json()
            .catch(() => ({ error: 'Unable to load replay trace' }));
          throw new Error(body.error || 'Unable to load replay trace');
        }

        const data = await response.json();
        if (!active) return;
        setSelectedReplayTrace(data.runs?.[0] ?? null);
      } catch (error: any) {
        if (!active) return;
        setReplayError(error?.message ?? 'Unable to load replay trace');
      } finally {
        if (active) setSelectedReplayLoading(false);
      }
    };

    void loadReplayTrace();

    return () => {
      active = false;
    };
  }, [workflowStage, selectedReplayRunId, orgId, workspaceId, session]);

  useEffect(() => {
    if (!resumeTarget || resumeTarget.runId) return;
    if (!orgId || !session?.access_token) return;

    let active = true;
    setSelectedReplayLoading(true);
    setReplayError(null);

    const restoreSession = async () => {
      try {
        const response = await fetch(
          `/api/sessions/restore?sessionId=${encodeURIComponent(
            resumeTarget.sessionId ?? ''
          )}`,
          {
            headers: {
              'x-brewassist-org-id': orgId,
              ...(workspaceId
                ? { 'x-brewassist-workspace-id': workspaceId }
                : {}),
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          const body = await response
            .json()
            .catch(() => ({ error: 'Unable to restore session context' }));
          throw new Error(body.error || 'Unable to restore session context');
        }

        const data = await response.json();
        const restore = (data.restore ?? null) as {
          sessionId: string;
          workspaceId: string | null;
          currentStage: string;
          lastSeenAt: string;
          latestRunId: string | null;
          latestRunStatus: string | null;
          latestCloseoutStatus: string | null;
          latestRunCreatedAt: string | null;
          context?: SessionRestoreContext | null;
        } | null;

        if (!active || !restore) return;

        const restoredStage = normalizeResumeStage(
          restore.currentStage as HybridWorkflowStage
        );
        const restoredMessages = buildSessionRestoreMessages(
          restore.sessionId,
          restoredStage,
          restore.context ?? null
        );

        if (restore.latestRunId) {
          setSelectedReplaySessionId(restore.sessionId);
          setWorkflowStage(restoredStage);
          setMessages(restoredMessages);
          setResumeTarget({
            sessionId: restore.sessionId,
            runId: restore.latestRunId,
            stage: restoredStage,
          });
          return;
        }

        setSelectedReplaySessionId(restore.sessionId);
        setWorkflowStage(restoredStage);
        setMessages(restoredMessages);
        setResumeTarget(null);
      } catch (error: any) {
        if (!active) return;
        setReplayError(error?.message ?? 'Unable to restore session context');
        setResumeTarget(null);
      } finally {
        if (active) setSelectedReplayLoading(false);
      }
    };

    void restoreSession();

    return () => {
      active = false;
    };
  }, [orgId, resumeTarget, session, setSelectedReplaySessionId, workspaceId]);

  useEffect(() => {
    if (!resumeTarget?.runId || !orgId || !session?.access_token) return;

    let active = true;
    setSelectedReplayLoading(true);
    setReplayError(null);

    const restoreFromRun = async () => {
      try {
        const response = await fetch(
          `/api/replay-history?runId=${encodeURIComponent(resumeTarget.runId!)}`,
          {
            headers: {
              'x-brewassist-org-id': orgId,
              ...(workspaceId
                ? { 'x-brewassist-workspace-id': workspaceId }
                : {}),
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          const body = await response
            .json()
            .catch(() => ({ error: 'Unable to restore session context' }));
          throw new Error(body.error || 'Unable to restore session context');
        }

        const data = await response.json();
        const trace = (data.runs?.[0] ?? null) as ReplayRun | null;
        if (!active || !trace) return;

        setSelectedReplaySessionId(resumeTarget.sessionId ?? trace.session_id ?? null);
        setSelectedReplayRunId(trace.id);
        setSelectedReplayTrace(trace);
        setMessages(buildRestoredMessages(trace, resumeTarget.stage));
        setWorkflowStage(resumeTarget.stage);
        setResumeTarget(null);
      } catch (error: any) {
        if (!active) return;
        setReplayError(error?.message ?? 'Unable to restore session context');
        setResumeTarget(null);
      } finally {
        if (active) setSelectedReplayLoading(false);
      }
    };

    void restoreFromRun();

    return () => {
      active = false;
    };
  }, [
    orgId,
    resumeTarget,
    session,
    setSelectedReplayRunId,
    setSelectedReplaySessionId,
    workspaceId,
  ]);

  // S4.9c.1: Handle manual scrolling to disable/enable auto-scroll
  const isNearBottom = useCallback(() => {
    const container = chatContainerRef.current;
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    return scrollHeight - scrollTop - clientHeight < 80;
  }, []);

  const handleScroll = useCallback(() => {
    setAutoScrollEnabled(isNearBottom());
  }, [isNearBottom]);

  useEffect(() => {
    if (!autoScrollEnabled) return;
    const animationFrame = window.requestAnimationFrame(() => {
      scrollMessageStreamToBottom(messages.length > 1 ? 'smooth' : 'auto');
    });
    return () => window.cancelAnimationFrame(animationFrame);
  }, [autoScrollEnabled, messages, isThinking, workflowStage, scrollMessageStreamToBottom]);

  const canPreview = [
    'preview',
    'confirm',
    'execute',
    'report',
    'replay',
  ].includes(workflowStage);
  const canConfirm = ['confirm', 'execute', 'report', 'replay'].includes(
    workflowStage
  );
  const canExecute = ['execute', 'report', 'replay'].includes(workflowStage);

  const appendSystemNotice = useCallback((message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        role: 'system',
        content: message,
      },
    ]);
  }, []);

  const handleSend = useCallback(
    async (overridePayload?: any) => {
      const currentInput = overridePayload?.input || input;
      const trimmed = currentInput.trim();
      if (!trimmed || isThinking) return;

      const parsedWorkflowCommand = parseWorkflowCommand(trimmed);
      const requestedWorkflowMode =
        parsedWorkflowCommand?.mode ?? workflowMode;
      const normalizedWorkflowInput =
        parsedWorkflowCommand?.remainder || trimmed;

      if (parsedWorkflowCommand) {
        setWorkflowMode(parsedWorkflowCommand.mode);
      }

      if (parsedWorkflowCommand && !parsedWorkflowCommand.remainder) {
        appendSystemNotice(
          `Workflow mode set to ${describeWorkflowMode(parsedWorkflowCommand.mode)}. Active role: ${getWorkflowModePromptRole(parsedWorkflowCommand.mode)}.`
        );
        setInput('');
        return;
      }

      const nextPayload = {
        input: normalizedWorkflowInput,
        mode,
        workflowMode: requestedWorkflowMode,
        tier,
        skillLevel: 'intermediate',
        useDeepReasoning: nextUseDeepReasoning,
        useResearchModel: nextUseResearchModel,
        repoProvider,
        repoRoot,
        ...overridePayload,
      };

      const requiresExecutionApproval = Boolean(nextPayload?.dangerousAction);

      if (
        requiresExecutionApproval &&
        executionPreference !== 'always_apply' &&
        nextPayload.executionDecision !== 'always_apply'
      ) {
        setPendingAction({
          payload: nextPayload,
          reason:
            'This action may write to files or change execution state. Review before proceeding.',
          input: trimmed,
        });
        setShowConfirmationModal(true);
        return;
      }

      if (
        normalizedWorkflowInput === '/init' ||
        normalizedWorkflowInput.startsWith('/init ')
      ) {
        setShowInitWizard(true);
        setInput('');
        return;
      }

      if (
        normalizedWorkflowInput === '/resume' ||
        normalizedWorkflowInput.startsWith('/resume ')
      ) {
        void router.push('/resume');
        setInput('');
        appendSystemNotice('Opening the hosted session picker.');
        return;
      }

      const requestStartedAt = performance.now();

      setLastError(null);
      const nextStage = deriveWorkflowStageFromInput(normalizedWorkflowInput);
      setWorkflowStage(nextStage);
      recordDevOps8Event({
        type: 'intent.captured',
        payload: {
          input: normalizedWorkflowInput,
          stage: nextStage,
          runLabel: normalizedWorkflowInput.slice(0, 120),
          cockpitMode,
          tier,
          personaId: cockpitMode === 'admin' ? 'admin' : 'customer',
          repoProvider,
          repoRoot,
        },
      });
      recordDevOps8Event({
        type: 'execute.started',
        payload: { latencyMs: 0 },
      });
      recordDevOps8Event({
        type: 'plan.created',
        payload: { stepCount: 1, plannerChurnDelta: 1 },
      });

      const userMsg: UiMessage = {
        id: makeId(),
        role: 'user',
        content: normalizedWorkflowInput,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsThinking(true);
      setCognitionPhase('Evaluating request...');
      setCognitionState(null);
      setAutoScrollEnabled(true);
      setNativeExecutionSummary(null);
      setBrewPmReviewSummary(null);

      const assistantMsgId = makeId();
      const assistantMsg: UiMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        truth: null,
        blockedByTruth: false,
        cognition: null,
        route: 'brewassist',
        scopeCategory: 'UNKNOWN',
        fullText: '',
        visibleText: '',
        isTyping: flowModeEnabled,
        flowModeEnabled,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const res = await fetch('/api/brewassist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-brewassist-mode': cockpitMode,
            'x-brewassist-repo-provider': repoProvider,
            'x-brewassist-repo-root': repoRoot,
            ...(orgId ? { 'x-brewassist-org-id': orgId } : {}),
            ...(workspaceId
              ? { 'x-brewassist-workspace-id': workspaceId }
              : {}),
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
        body: JSON.stringify({
          ...nextPayload,
          confirmApply:
            nextPayload.confirmApply ??
            (executionPreference === 'always_apply' ||
              nextPayload.executionDecision === 'apply' ||
              nextPayload.executionDecision === 'always_apply'),
          executionDecision:
            nextPayload.executionDecision ??
            (executionPreference === 'always_apply'
              ? 'always_apply'
              : nextPayload.dangerousAction
                  ? 'apply'
                  : undefined),
          }),
        });

        if (!res.ok) {
          const errorBody = await res
            .json()
            .catch(() => ({ message: 'Failed to connect to the API.' }));
          throw new Error(
            errorBody.message || 'Failed to connect to the streaming endpoint.'
          );
        }

        setWorkflowStage('execute');

        const ct = res.headers.get('content-type') || '';

        if (ct.includes('text/event-stream')) {
          if (res.body) {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const chunk = decoder.decode(value);
              const lines = chunk
                .split('\n')
                .filter((line) => line.trim() !== '');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.substring(6);
                  try {
                    const json = JSON.parse(data);
                    if (json?.type === 'chunk') {
                      const t = typeof json.text === 'string' ? json.text : '';
                      if (t) {
                        const previewSummary = {
                          diffFiles: 1,
                          addedLines:
                            sandboxReviewSummary?.addedLines ?? 0,
                          removedLines:
                            sandboxReviewSummary?.removedLines ?? 0,
                          hasBinaryHint:
                            sandboxReviewSummary?.hasBinaryHint ?? false,
                          hasChanges: true,
                          files: sandboxReviewSummary?.files ?? [],
                        };

                        setSandboxReviewSummary({
                          ...previewSummary,
                          updatedAt: Date.now(),
                        });

                        recordDevOps8Event({
                          type: 'preview.ready',
                          payload: previewSummary,
                        });

                        if (json.needsPreviewRefresh) {
                          setHasPendingSandboxChanges(true);
                          setWorkflowStage('preview');
                          if (!sandboxPreviewNoticeShownRef.current) {
                            sandboxPreviewNoticeShownRef.current = true;
                            appendSystemNotice(
                              buildSandboxReviewNotice({
                                ...previewSummary,
                                decision:
                                  sandboxReviewSummary?.decision ?? 'apply',
                              })
                            );
                          }
                        }

                        setMessages((prev) =>
                          prev.map((msg) =>
                            msg.id === assistantMsgId
                              ? { ...msg, fullText: (msg.fullText ?? '') + t }
                              : msg
                          )
                        );
                      }
                    } else if (json.type === 'end') {
                      const policyOk = Boolean(json?.policy?.ok);
                      const responseText =
                        typeof json?.text === 'string' ? json.text : '';
                      const truthScore =
                        typeof json?.truth?.overallScore === 'number'
                          ? json.truth.overallScore
                          : null;
                      const summary = normalizeNativeResponse({
                        title: policyOk
                          ? 'Execution summary'
                          : 'Blocked execution summary',
                        sourceLabel:
                          typeof json?.payload?.provider === 'string' &&
                          typeof json?.payload?.model === 'string'
                            ? `${json.payload.provider}/${json.payload.model}`
                            : 'BrewAssist',
                        rawText: responseText,
                        summary: responseText || 'Execution completed.',
                        changed: sandboxReviewSummary?.files ?? [],
                        lane: 'executor',
                        verified: [
                          policyOk
                            ? 'Policy gate passed'
                            : 'Policy gate blocked',
                          typeof truthScore === 'number'
                            ? `BrewTruth ${Math.round(truthScore * 100)}%`
                            : 'BrewTruth unavailable',
                          json?.payload?.replay?.available
                            ? 'Replay available'
                            : 'Replay pending',
                        ],
                        remaining: policyOk
                          ? ['Review replay trace', 'Continue with the next task']
                          : [
                              'Fix the policy blocker',
                              'Retry with the required approval context',
                            ],
                        risks: Array.isArray(json?.truth?.flags)
                          ? json.truth.flags.map((flag: string) => flag.replaceAll('_', ' '))
                          : [],
                        nextStep: policyOk
                          ? 'Open replay or continue with the next prompt.'
                          : 'Resolve the blocker and rerun the request.',
                        truthScore,
                        policyOk,
                      });
                      setNativeExecutionSummary(summary);
                      const brewpmReview = json?.payload?.brewpmReview as
                        | {
                            verdict?: 'approved' | 'changes_requested' | 'rejected';
                            status?: 'approved' | 'changes_requested' | 'rejected';
                            summary?: string;
                            corrections?: string[];
                            specChecks?: string[];
                            evidence?: string[];
                            risks?: string[];
                            nextStep?: string;
                            rawText?: string;
                            model?: {
                              providerId?: string;
                              modelId?: string;
                            };
                          }
                        | undefined;
                      if (brewpmReview) {
                        const verdict =
                          brewpmReview.verdict ??
                          brewpmReview.status ??
                          'changes_requested';
                        setBrewPmReviewSummary(
                          normalizeNativeResponse({
                            title: 'BrewPM Review',
                            sourceLabel:
                              brewpmReview.model?.providerId &&
                              brewpmReview.model?.modelId
                                ? `${brewpmReview.model.providerId}/${brewpmReview.model.modelId}`
                                : 'BrewPM',
                            lane: 'reviewer',
                            status: verdict,
                            summary:
                              brewpmReview.summary ||
                              'BrewPM completed the reviewer pass.',
                            changed:
                              brewpmReview.corrections?.length
                                ? brewpmReview.corrections
                                : ['No corrections required'],
                            verified:
                              brewpmReview.specChecks?.length ||
                              brewpmReview.evidence?.length
                                ? [
                                    ...(brewpmReview.specChecks ?? []),
                                    ...(brewpmReview.evidence ?? []),
                                  ]
                                : ['Reviewer pass recorded'],
                            remaining:
                              verdict === 'approved'
                                ? [
                                    'Review replay trace',
                                    'Continue with the next task',
                                  ]
                                : brewpmReview.corrections?.length
                                  ? brewpmReview.corrections
                                  : ['Resolve the corrections and rerun review'],
                            risks: brewpmReview.risks ?? [],
                            nextStep:
                              brewpmReview.nextStep ||
                              (verdict === 'approved'
                                ? 'Greenlight the phase and continue.'
                                : 'Address the corrections and rerun BrewPM review.'),
                            rawText: brewpmReview.rawText,
                          })
                        );
                      }
                      const scopeWords = responseText
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean).length;
                        recordDevOps8Event({
                          type: 'execute.completed',
                          payload: {
                            latencyMs: Math.round(
                              performance.now() - requestStartedAt
                            ),
                            status: policyOk
                              ? 'ready_for_review'
                              : 'blocked',
                            truthScore:
                              typeof json?.truth?.overallScore === 'number'
                                ? json.truth.overallScore
                              : 1,
                          coverage:
                            typeof json?.truth?.overallScore === 'number'
                              ? json.truth.overallScore
                              : 1,
                          policyGateFailures: policyOk ? 0 : 1,
                          schemaDiffsDetected: Boolean(
                            json?.truth?.flags?.length
                          ),
                          responseText,
                          scope: {
                            definedScopeItems: Math.max(scopeWords, 1),
                            executedItems: responseText
                              ? Math.min(scopeWords, 8)
                              : 0,
                            scopeCreepIncidents: policyOk ? 0 : 1,
                            boundaryViolations: policyOk ? 0 : 1,
                            recentChecks: 1,
                            coverage:
                              typeof json?.truth?.overallScore === 'number'
                                ? json.truth.overallScore
                                : 1,
                            violations: policyOk ? 0 : 1,
                          },
                        },
                      });
                      recordDevOps8Event({
                        type: 'report.emitted',
                        payload: {
                          status: policyOk ? 'complete' : 'needs_changes',
                          truthScore:
                            typeof json?.truth?.overallScore === 'number'
                              ? json.truth.overallScore
                              : 1,
                          coverage:
                            typeof json?.truth?.overallScore === 'number'
                              ? json.truth.overallScore
                              : 1,
                          reportLabel: responseText.slice(0, 120),
                        },
                      });
                    } else if (json.type === 'error') {
                      throw new Error(json.payload.message);
                    }
                  } catch (e) {
                    console.error('Error parsing stream chunk:', e);
                  }
                }
              }
            } // End of while (true)
          } // End of if (res.body)
          // After stream ends, ensure full content is set
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    fullText: msg.fullText ?? '',
                    content: flowModeEnabled
                      ? (msg.visibleText ?? '')
                      : (msg.fullText ?? ''),
                    isTyping: false,
                  }
                : msg
            )
          );
        } else {
          // Handle non-streaming JSON response
          const body = await res.json();
          const newText = typeof body?.text === 'string' ? body.text : '';
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    fullText: newText,
                    content:
                      flowModeEnabled && newText.length > 40 ? '' : newText,
                    visibleText:
                      flowModeEnabled && newText.length > 40 ? '' : newText,
                    isTyping: flowModeEnabled && newText.length > 40,
                  }
                : msg
            )
          );
          recordDevOps8Event({
            type: 'report.emitted',
            payload: {
              status: 'complete',
              truthScore: 1,
              coverage: 1,
              reportLabel: newText.slice(0, 120),
            },
          });
          setNativeExecutionSummary(
            normalizeNativeResponse({
              title: 'Execution summary',
              sourceLabel: 'BrewAssist',
              rawText: newText,
              summary: newText || 'Execution completed.',
              changed: sandboxReviewSummary?.files ?? [],
              lane: 'executor',
              verified: ['Policy gate passed', 'Replay pending'],
              remaining: ['Review replay trace', 'Continue with the next task'],
              nextStep: 'Open replay or continue with the next prompt.',
              policyOk: true,
              truthScore: 1,
            })
          );
          setWorkflowStage('report');
        }
      } catch (err) {
        console.error('BrewAssist fetch error:', err);
        const errLine =
          err instanceof Error
            ? err.message
            : 'BrewAssist hit a network issue or the server restarted. Please try again.';
        setLastError(errLine);
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: 'system',
            content: errLine,
          },
        ]);
        recordDevOps8Event({
          type: 'telemetry.updated',
          payload: {
            policyGateFailures: 1,
            truthScore: 0,
            testConfidence: 0,
            schemaDiffsDetected: true,
            coverage: 0,
          },
        });
        setWorkflowStage('intent');
      } finally {
        setIsThinking(false);
        setCognitionPhase('BrewAssist ready.');
        setCognitionState(null);
        setNextUseDeepReasoning(false);
        setNextUseResearchModel(false);
      }
    },
    [
      input,
      mode,
      workflowMode,
      tier,
      isThinking,
      nextUseDeepReasoning,
      nextUseResearchModel,
      cockpitMode,
      repoProvider,
      repoRoot,
      executionPreference,
      appendSystemNotice,
    ]
  ); // Add cockpitMode to dependencies

  const handleForceRun = useCallback(() => {
    if (pendingAction) {
      const newPayload = {
        ...pendingAction.payload,
        dangerousAction: false,
        confirmApply: true,
        executionDecision: 'apply' as ExecutionDecision,
      };
      void handleSend(newPayload);
      setShowConfirmationModal(false);
      setPendingAction(null);
      setExecutionRejectComment('');
    }
  }, [pendingAction, handleSend]);

  const handleAlwaysApply = useCallback(() => {
    if (pendingAction) {
      const newPayload = {
        ...pendingAction.payload,
        dangerousAction: false,
        confirmApply: true,
        executionDecision: 'always_apply' as ExecutionDecision,
      };
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('brewassist.executionPreference', 'always_apply');
      }
      setExecutionPreference('always_apply');
      void handleSend(newPayload);
      setShowConfirmationModal(false);
      setPendingAction(null);
      setExecutionRejectComment('');
    }
  }, [pendingAction, handleSend]);

  const handleRejectExecution = useCallback(() => {
    if (!pendingAction) return;

    const comment =
      executionRejectComment.trim() || 'Execution rejected by the operator.';
    appendSystemNotice(`Execution rejected: ${comment}`);
    recordDevOps8Event({
      type: 'collab.message',
      payload: {
        author: 'Operator',
        message: comment,
        presence: 'execution-rejected',
      },
    });
    setShowConfirmationModal(false);
    setPendingAction(null);
    setExecutionRejectComment('');
    sandboxPreviewNoticeShownRef.current = false;
  }, [appendSystemNotice, executionRejectComment, pendingAction, recordDevOps8Event]);

  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmationModal(false);
    setPendingAction(null);
  }, []);

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    } else if (e.key === '/' && !input.trim()) {
      setShowCommandPalette(true);
    }
  };

  const applyMarkdownFormat = useCallback(
    (format: 'bold' | 'italic' | 'h1' | 'h2' | 'bullet' | 'code') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      const value = input ?? '';
      const selected = value.slice(start, end);

      let before = value.slice(0, start);
      let after = value.slice(end);
      let nextValue = value;
      let insert = '';

      switch (format) {
        case 'bold':
          insert = selected ? `**${selected}**` : `**bold text**`;
          break;
        case 'italic':
          insert = selected ? `*${selected}*` : `*italic text*`;
          break;
        case 'h1':
          insert = selected ? `# ${selected}` : `# Heading 1`;
          break;
        case 'h2':
          insert = selected ? `## ${selected}` : `## Heading 2`;
          break;
        case 'bullet':
          insert = selected
            ? selected
                .split('\n')
                .map((line) => (line.trim() ? `- ${line.trim()}` : ''))
                .join('\n')
            : '- list item';
          break;
        case 'code':
          insert = selected ? `\`${selected}\`` : '`code`';
          break;
      }

      nextValue = before + insert + after;
      setInput(nextValue);

      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = before.length + insert.length;
        textarea.selectionStart = textarea.selectionEnd = cursorPos;
      });
    },
    [input]
  );

  const renderBubble = (msg: UiMessage) => {
    const isUser = msg.role === 'user';
    const isAssistant = msg.role === 'assistant';
    const isSystem = msg.role === 'system';

    let lineClass = 'log-system';
    if (isUser) lineClass = 'log-user';
    if (isAssistant) lineClass = 'log-assistant';

    let truthBadge = null;
    // Only show truthBadge in admin mode
    if (cockpitMode === 'admin' && isAssistant && msg.truth) {
      // Add cockpitMode check
      const truthScore = Math.round(msg.truth.overallScore * 100); // Changed from truthScore to overallScore
      let badgeClass = 'truth-badge';
      let riskLevelDisplay: RiskLevel = 'Low'; // Default for display
      let emotionalStateDisplay: EmotionalState = 'Neutral';

      if (msg.cognition) {
        riskLevelDisplay = msg.cognition.riskLevel;
        emotionalStateDisplay = msg.cognition.emotionalState;
      } else {
        // Fallback if cognition state is not available (e.g., old messages)
        switch (
          msg.truth.tier // Changed from riskLevel to tier
        ) {
          case 'gold':
          case 'silver':
            riskLevelDisplay = 'Low';
            emotionalStateDisplay = 'Confident';
            break;
          case 'bronze':
            riskLevelDisplay = 'Moderate';
            emotionalStateDisplay = 'Cautious';
            break;
          case 'red':
            riskLevelDisplay = 'Critical';
            emotionalStateDisplay = 'Uncertain';
            break;
          default:
            riskLevelDisplay = 'Low'; // Fallback
            emotionalStateDisplay = 'Neutral';
            break;
        }
      }

      switch (riskLevelDisplay) {
        case 'Low':
          badgeClass += ' truth-badge--low';
          break;
        case 'Moderate':
          badgeClass += ' truth-badge--medium';
          break;
        case 'High':
        case 'Critical':
          badgeClass += ' truth-badge--high';
          break;
      }

      truthBadge = (
        <div className={badgeClass}>
          Confidence: {truthScore}% · Risk: {riskLevelDisplay} · State:{' '}
          {emotionalStateDisplay}
        </div>
      );
    }

    return (
      <div key={msg.id} className={`log-line ${lineClass}`}>
        <div className="cosmic-bubble">
          <div className="bubble-content">
            <RichMarkdown
              content={
                msg.isTyping ? msg.visibleText || '' : getMessageText(msg)
              }
            />
          </div>
          {truthBadge}
          {cockpitMode === 'admin' && msg.cognition && (
            <div className="cognition-summary">
              <p>
                <strong>Cognition Summary:</strong>
              </p>
              <ul>
                <li>Persona: {msg.cognition.persona}</li>
                <li>Emotional State: {msg.cognition.emotionalState}</li>
                <li>User Role: {msg.cognition.userRole}</li>
                <li>Toolbelt Tier: {msg.cognition.toolbeltTier}</li>
                <li>Intent: {msg.cognition.intent}</li>
                <li>Reasoning Mode: {msg.cognition.reasoningMode}</li>
                <li>Risk Level: {msg.cognition.riskLevel}</li>
                <li>
                  Execution Permission:{' '}
                  {msg.cognition.executionPermission as unknown as string}
                </li>
                <li>Truth Validation: {msg.cognition.truthValidationStatus}</li>
                {msg.scopeCategory && (
                  <li>Scope Category: {msg.scopeCategory}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="cockpit-center">
      <div
        className="cockpit-center-scroll"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {showFirstRunBanner && !showInitWizard && (
          <div className="first-run-banner">
            <div className="first-run-banner-copy">
              <span className="first-run-banner-kicker">First run</span>
              <strong>
                Set up your provider, repo, and role before the first safe run.
              </strong>
              <p>
                BrewAssist can guide vibe coders, developers, and enterprise
                teams through the same Intent → Plan → Preview → Confirm →
                Execute → Report → Replay flow.
              </p>
            </div>
            <div className="first-run-banner-actions">
              <button
                type="button"
                className="first-run-banner-action"
                onClick={() => setShowInitWizard(true)}
              >
                Start setup
              </button>
              <button
                type="button"
                className="first-run-banner-action first-run-banner-action--ghost"
                onClick={() => {
                  setShowFirstRunBanner(false);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('brewassist.init.dismissed', 'true');
                  }
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="workflow-strip" data-testid="workflow-strip">
          {HYBRID_WORKFLOW_STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              className={`workflow-stage ${workflowStage === stage ? 'is-active' : ''}`}
              onClick={() => setWorkflowStage(stage)}
              title={getWorkflowStageHint(stage)}
            >
              {getWorkflowStageLabel(stage)}
            </button>
          ))}
          <span className="workflow-stage-hint">
            {getWorkflowStageHint(workflowStage)}
          </span>
        </div>

        <div className="cockpit-runtime-truth-card">
          <div className="cockpit-runtime-truth-card__header">
            <div>
              <span className="console-card-label">Runtime Truth</span>
              <h3>Online Intelligent TUI with BrewLast memory</h3>
            </div>
            <span className="hud-badge workflow-badge workflow-badge--on">
              {runtimeTruth?.memoryStatus?.hasHistory ? 'Memory warm' : 'Memory cold'}
            </span>
          </div>
          <div className="cockpit-runtime-truth-card__grid">
            <div>
              <span className="mcp-summary-label">Memory</span>
              <strong>{runtimeTruth?.memoryStatus?.backend ?? 'unknown'}</strong>
              <p>
                Last updated{' '}
                {runtimeTruth?.memoryStatus?.lastUpdated
                  ? new Date(runtimeTruth.memoryStatus.lastUpdated).toLocaleString()
                  : 'n/a'}
              </p>
            </div>
            <div>
              <span className="mcp-summary-label">HRM</span>
              <strong>
                {runtimeTruth?.hrmStatus?.enabled ? 'Enabled' : 'Disabled'}
              </strong>
              <p>{runtimeTruth?.hrmStatus?.model ?? 'No HRM model reported'}</p>
            </div>
            <div>
              <span className="mcp-summary-label">Last HRM Run</span>
              <strong>
                {runtimeTruth?.hrmStatus?.lastRunAt
                  ? new Date(runtimeTruth.hrmStatus.lastRunAt).toLocaleString()
                  : 'No run yet'}
              </strong>
              <p>
                {runtimeTruth?.hrmStatus?.lastOk === false
                  ? 'Last run reported an error.'
                  : runtimeTruth?.hrmStatus?.lastOk === true
                    ? 'Last run completed successfully.'
                    : 'Awaiting the first HRM run.'}
              </p>
            </div>
          </div>
        <div className="cockpit-runtime-truth-card__footer">
          BrewLast is the memory layer. HRM is the strategy lane. Replay and
          review stay recoverable from the same cockpit state.
        </div>
      </div>

      <div className="cockpit-role-contract-card">
          <div className="cockpit-role-contract-card__header">
            <div>
              <span className="console-card-label">Role Contract</span>
              <h3>Planner, executor, reviewer, memory, and research stay separated.</h3>
          </div>
          <span className="hud-badge workflow-badge workflow-badge--on">
            Stable roles
          </span>
        </div>
        <div className="cockpit-role-contract-card__grid">
          {roleLanes.map((lane) => (
            <div key={lane.name} className="cockpit-role-contract-card__item">
              <strong>{lane.name}</strong>
              <span>{lane.role}</span>
              <p>{lane.detail}</p>
            </div>
          ))}
        </div>
          <div className="cockpit-role-contract-card__footer">
          The implementation can use multiple agents, but the product contract stays
          role-based, observable, and replayable rather than a hidden agent swarm.
        </div>
      </div>

      <div className="cockpit-role-contract-card cockpit-agent-audit-card">
        <div className="cockpit-role-contract-card__header">
          <div>
            <span className="console-card-label">Agent Audit</span>
            <h3>
              Live agent activity stays visible while recursive toolcall
              auto-execution remains tracked.
            </h3>
          </div>
          <span className="hud-badge workflow-badge workflow-badge--on">
            Audit visible
          </span>
        </div>
        <div className="cockpit-agent-audit-card__intro">
          <strong>{agentAuditSnapshot.liveLane}</strong>
          <span>
            {agentAuditSnapshot.stageLabel} · {workflowMode}
          </span>
          <p>{agentAuditSnapshot.stageHint}</p>
        </div>
        <div className="cockpit-role-contract-card__grid">
          <div className="cockpit-role-contract-card__item">
            <strong>Live activity</strong>
            <span>{agentAuditSnapshot.liveActivitySource}</span>
            <p>{agentAuditSnapshot.liveActivity}</p>
          </div>
          <div className="cockpit-role-contract-card__item">
            <strong>Trail state</strong>
            <span>{agentAuditSnapshot.trailSource}</span>
            <p>{agentAuditSnapshot.trailState}</p>
          </div>
          {agentAuditLanes.map((lane) => (
            <div key={lane.name} className="cockpit-role-contract-card__item">
              <strong>{lane.name}</strong>
              <span>{lane.role}</span>
              <p>{lane.detail}</p>
            </div>
          ))}
        </div>
        <div className="cockpit-role-contract-card__footer">
          BrewAssist shows the hosted agent-fabric stages, the current
          decision/apply trail, and the live cockpit activity summary. The
          fully recursive toolcall loop is still a tracked parity gap with Brew
          Agentic, not an implied capability.
        </div>
      </div>

      <NativeSummaryCard summary={brewPmSummary} />

      <div className="cockpit-message-log">
          {messages.map(renderBubble)}

          {isThinking && (
            <div className="log-line log-assistant">
              <div className="cosmic-bubble">
                <span className="brewassist-thinking-dot" /> Cognition: {cognitionPhase}
                {cockpitMode === 'admin' && cognitionState && (
                  <div className="cognition-summary">
                    <p>
                      <strong>Current Cognition:</strong>
                    </p>
                    <ul>
                      <li>Persona: {cognitionState.persona}</li>
                      <li>Emotional State: {cognitionState.emotionalState}</li>
                      <li>User Role: {cognitionState.userRole}</li>
                      <li>Toolbelt Tier: {cognitionState.toolbeltTier}</li>
                      <li>Intent: {cognitionState.intent}</li>
                      <li>Reasoning Mode: {cognitionState.reasoningMode}</li>
                      <li>Risk Level: {cognitionState.riskLevel}</li>
                      <li>
                        Execution Permission:{' '}
                        {
                          cognitionState.executionPermission as unknown as string
                        }
                      </li>
                      <li>
                        Truth Validation: {cognitionState.truthValidationStatus}
                      </li>
                    </ul>
                  </div>
                )}
                {/* Skip button removed due to lint issues - functionality works without it */}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {nativeExecutionSummary ? (
          <NativeSummaryCard summary={nativeExecutionSummary} />
        ) : null}

        {sandboxReviewSummary ? (
          <section className="cockpit-sandbox-preview-card">
            <div className="cockpit-sandbox-preview-card__header">
              <div>
                <span className="console-card-label">Review Handoff</span>
                <h3>The command center owns review context</h3>
              </div>
              <div className="cockpit-sandbox-preview-card__badges">
                <span className="hud-badge workflow-badge workflow-badge--on">
                  {sandboxReviewSummary.hasChanges ? 'Changes pending' : 'No changes'}
                </span>
                <span className="hud-badge">
                  {getSandboxDecisionLabel(sandboxReviewSummary.decision)}
                </span>
              </div>
            </div>
            <div className="sandbox-diff-summary cockpit-sandbox-preview-card__summary">
              <div className="sandbox-diff-stat">
                <strong>{sandboxReviewSummary.diffFiles}</strong>
                <span>Files</span>
              </div>
              <div className="sandbox-diff-stat">
                <strong>{sandboxReviewSummary.addedLines}</strong>
                <span>Added</span>
              </div>
              <div className="sandbox-diff-stat">
                <strong>{sandboxReviewSummary.removedLines}</strong>
                <span>Removed</span>
              </div>
              <div className="sandbox-diff-stat">
                <strong>{sandboxReviewSummary.hasBinaryHint ? 'Yes' : 'No'}</strong>
                <span>Binary hint</span>
              </div>
            </div>
            <div className="cockpit-sandbox-preview-card__copy">
              <strong>Files in review</strong>
              <span className="sandbox-review-strip__detail">
                The handoff is the point where the command center passes review
                context into the sandbox workspace for detailed inspection and
                apply.
              </span>
              <span className="sandbox-review-strip__detail">
                Line stats: +{sandboxReviewSummary.addedLines} / -{sandboxReviewSummary.removedLines}
                {sandboxReviewSummary.hasBinaryHint ? ' · binary hint detected' : ''}
              </span>
              <div className="sandbox-review-strip__files">
                {sandboxReviewSummary.files.length > 0 ? (
                  sandboxReviewSummary.files.map((file) => (
                    <span
                      key={file}
                      className="sandbox-review-strip__file-pill"
                    >
                      {file}
                    </span>
                  ))
                ) : (
                  <span className="sandbox-review-strip__detail">
                    No file list available yet.
                  </span>
                )}
              </div>
            </div>
            <div className="cockpit-sandbox-preview-card__actions">
              <button
                type="button"
                className="console-meta-button"
                onClick={() => setShowSandboxDiffModal(true)}
              >
                Open Diff Review
              </button>
              <button
                type="button"
                className="console-meta-button"
                onClick={() => router.push('/console/sandbox')}
              >
                Open Sandbox Workspace
              </button>
            </div>
          </section>
        ) : null}
      </div>

      <div className="brew-input-area">
        {repoConnectionMissing ? (
          <div className="brew-repo-banner brew-repo-banner--missing">
            <strong>You haven&apos;t connected your repo yet.</strong>
            <span>
              Use the repo picker in the top frame to connect a workspace. The
              banner disappears once the repo is bound.
            </span>
          </div>
        ) : null}

        <div className="cockpit-format-toolbar">
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat('bold')}
          >
            B
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat('italic')}
          >
            I
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat('h1')}
          >
            H1
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat('h2')}
          >
            H2
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat('bullet')}
          >
            •
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => applyMarkdownFormat('code')}
          >
            {'</>'}
          </button>
          <button
            type="button"
            className="format-btn format-btn--setup"
            onClick={() => setShowInitWizard(true)}
          >
            Init
          </button>
          <button
            type="button"
            className="format-btn format-btn--setup"
            onClick={() => setShowCommandPalette(true)}
          >
            Commands
          </button>
          <button
            type="button"
            className={`format-btn ${
              workflowMode === 'BUILD' ? 'format-btn--setup' : ''
            }`}
            onClick={() => setWorkflowMode('BUILD')}
            aria-pressed={workflowMode === 'BUILD'}
            title="Build mode"
          >
            Build
          </button>
          <button
            type="button"
            className={`format-btn ${
              workflowMode === 'PLAN' ? 'format-btn--setup' : ''
            }`}
            onClick={() => setWorkflowMode('PLAN')}
            aria-pressed={workflowMode === 'PLAN'}
            title="Plan mode"
          >
            Plan
          </button>
        </div>

        <div className="cockpit-input-row">
          {isClient && (
            <span className="brew-action-inline-hint">Message helpers</span>
          )}
          {isClient && (
            <ActionMenu
              onUploadFile={(files, dangerousAction) => {
                appendSystemNotice(
                  `Prepared file helper for ${files[0]?.name || 'uploaded file'}.`
                );
                void handleSend({
                  input: `Uploaded ${files[0].name}`,
                  dangerousAction: dangerousAction,
                });
              }}
              onSelectDeepReasoning={() => setNextUseDeepReasoning(true)}
              onSelectNimsResearch={() => setNextUseResearchModel(true)}
              onUploadImage={() =>
                appendSystemNotice(
                  'Upload Image / Screenshot is a stub for now. Use file upload or paste context while media capture is wired.'
                )
              }
              onTakePhoto={() =>
                appendSystemNotice(
                  'Take Photo is a stub for now. Camera capture will be added in a later phase.'
                )
              }
              onImportFromGoogleDrive={() =>
                appendSystemNotice(
                  'Import from Google Drive is a stub for now. Drive integration will be added in a later phase.'
                )
              }
            />
          )}
          <textarea
            ref={textareaRef}
            className="workspace-input"
            placeholder={composerPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            className="workspace-send-button"
            onClick={() => void handleSend()}
            disabled={!input.trim() || isThinking}
          >
            Send
          </button>
          
          {hasPendingSandboxChanges && (
            <div className="sandbox-review-strip">
              <div className="sandbox-review-strip__copy">
                <strong>Sandbox changes ready</strong>
                <span>
                  The main pane now carries the review summary. Open the sandbox
                  workspace for file-by-file inspection and apply controls.
                </span>
                <span className="sandbox-review-strip__detail">
                  Decision: {getSandboxDecisionLabel(sandboxReviewSummary?.decision)}
                </span>
                <div className="sandbox-review-strip__stages">
                  <span>Preview</span>
                  <span>Confirm</span>
                  <span>Apply</span>
                </div>
                <div className="sandbox-review-strip__detail">
                  Sandbox workspace mirrors the live repo shadow, file preview,
                  and diff/apply surface.
                </div>
              </div>
              <div className="sandbox-review-strip__actions">
                <button
                  className="workspace-send-button sandbox-review-strip__button"
                  onClick={() => setShowSandboxDiffModal(true)}
                >
                  {sandboxReviewSummary?.decision === 'always_apply'
                    ? 'Review Always Apply'
                    : sandboxReviewSummary?.decision === 'reject_comment'
                      ? 'Review Rejection'
                      : 'Open Review'}
                </button>
                <button
                  className="workspace-send-button sandbox-review-strip__button sandbox-review-strip__button--ghost"
                  onClick={() => router.push('/console/sandbox')}
                >
                  Open Sandbox Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="cockpit-hud">
          {cockpitMode === 'admin' ? (
            <span className="hud-badge admin-mode">
              Admin Mode · Sandbox available
            </span>
          ) : (
            <span className="hud-badge customer-mode">
              Customer Mode · Sandbox locked (internal only)
            </span>
          )}
          <span
            className={`hud-badge workflow-badge workflow-badge--${workflowStage}`}
          >
            Stage: {getWorkflowStageLabel(workflowStage)}
          </span>
          <button
            type="button"
            className="hud-badge workflow-badge workflow-badge--on"
            onClick={() => setWorkflowMode(toggleWorkflowMode(workflowMode))}
            title="Toggle BUILD / PLAN"
          >
            Flow: {workflowMode}
          </button>
          <span
            className={`hud-badge ${canPreview ? 'workflow-badge--on' : 'workflow-badge--off'}`}
          >
            Preview
          </span>
          <span
            className={`hud-badge ${canConfirm ? 'workflow-badge--on' : 'workflow-badge--off'}`}
          >
            Confirm
          </span>
          <span
            className={`hud-badge ${canExecute ? 'workflow-badge--on' : 'workflow-badge--off'}`}
          >
            Execute
          </span>
          {lastAssistantMessage && (
            <button
              type="button"
              className="hud-badge"
              onClick={() => setWorkflowStage('replay')}
            >
              Replay last run
            </button>
          )}
          <span
            className={`hud-badge ${showFirstRunBanner ? 'workflow-badge--on' : 'workflow-badge--off'}`}
          >
            Onboarding {showFirstRunBanner ? 'Ready' : 'Done'}
          </span>
        </div>
      </div>

      <div className="cockpit-mode-row">
        {(['HRM', 'LLM', 'AGENT', 'LOOP'] as ToolbeltBrewMode[]).map(
          // Use ToolbeltBrewMode

          (m) => (
            <button
              key={m}
              className={`mode-tab ${mode === m ? 'mode-tab--active' : ''}`}
              onClick={() => setMode(m)}
            >
              {m.toUpperCase()}
            </button>
          )
        )}
        <div className="brew-tier-selector">
          <span className="brew-tier-badge">
            Toolbelt: Tier{' '}
            {tier
              .replace('T', '')
              .replace('_SAFE', '')
              .replace('_GUIDED', '')
              .replace('_POWER', '')}
          </span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as BrewTier)}
            className="brew-tier-dropdown"
          >
            <option value="T1_SAFE">Tier 1 — Safe</option>
            <option value="T2_GUIDED">Tier 2 — Guided</option>
            <option value="T3_POWER">Tier 3 — Power</option>
          </select>
        </div>
        <CockpitModeToggle />
      </div>

      {workflowStage === 'replay' ? (
        <section className="replay-history-panel">
          <div className="replay-history-header">
            <strong>Replay History</strong>
            <span>
              {workspaceId ? 'Workspace-scoped runs' : 'Recent org runs'}
            </span>
          </div>
          {replayLoading ? (
            <div className="code-viewer-status">Loading replay history…</div>
          ) : replayError ? (
            <div className="code-viewer-status error">{replayError}</div>
          ) : replayRuns.length === 0 ? (
            <div className="code-viewer-status">No persisted runs yet.</div>
          ) : (
            <div className="replay-history-layout">
              <div className="replay-history-list">
                {replayRuns.map((run) => (
                  <button
                    key={run.id}
                    type="button"
                    className={`replay-history-card ${selectedReplayRunId === run.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedReplayRunId(run.id)}
                  >
                    <div className="replay-history-meta">
                      <strong>{run.status}</strong>
                      <span>{new Date(run.created_at).toLocaleString()}</span>
                      <span>
                        Truth{' '}
                        {typeof run.truth_score === 'number'
                          ? run.truth_score
                          : 'n/a'}
                      </span>
                      <span>Lane {getReplayLaneLabel(run)}</span>
                      {run.brewpm_verdict ? (
                        <span>BrewPM {run.brewpm_verdict}</span>
                      ) : null}
                      {run.brewpm_review_provider && run.brewpm_review_model ? (
                        <span>
                          {run.brewpm_review_provider}/{run.brewpm_review_model}
                        </span>
                      ) : null}
                      {run.brewpm_reviewed_at ? (
                        <span>
                          Reviewed {new Date(run.brewpm_reviewed_at).toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                    <div className="replay-history-decision">
                      {run.brewpm_verdict
                        ? `BrewPM ${run.brewpm_verdict}`
                        : getReplayDecisionLabel(run)}
                    </div>
                    {run.brewpm_review_summary ? (
                      <div className="replay-trace-summary">
                        {run.brewpm_review_summary}
                      </div>
                    ) : null}
                    <div className="replay-history-events">
                      {run.events.slice(-3).map((event, index) => (
                        <div
                          key={`${run.id}-${event.created_at}-${index}`}
                          className="replay-history-event"
                        >
                          <span>{event.event_type}</span>
                          <span>
                            {event.payload?.summary ??
                              event.payload?.stage ??
                              'event'}
                          </span>
                        </div>
                      ))}
                    </div>
                    {run.events
                      .find((event) => event.event_type === 'collab.message')
                      ?.payload?.payload?.files?.length ? (
                      <div className="replay-history-files">
                        {run.events
                          .find((event) => event.event_type === 'collab.message')
                          ?.payload?.payload?.files?.map((file) => (
                            <span key={`${run.id}-${file}`} className="replay-history-file">
                              {file}
                            </span>
                          ))}
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>

              <div className="replay-trace-panel">
                {selectedReplayLoading ? (
                  <div className="code-viewer-status">Loading run trace…</div>
                ) : !selectedReplayTrace ? (
                  <div className="code-viewer-status">
                    Select a run to inspect its full trace.
                  </div>
                ) : (
                  <>
                    <div className="replay-history-header">
                      <strong>Run Trace</strong>
                      <span>{selectedReplayTrace.id}</span>
                    </div>
                    {selectedReplaySummary ? (
                      <NativeSummaryCard summary={selectedReplaySummary} />
                    ) : null}
                    {selectedReplayConfirmTrail.decision ||
                    selectedReplayConfirmTrail.comment ||
                    selectedReplayConfirmTrail.files.length ? (
                      <div className="replay-brewpm-callout">
                        <div className="replay-history-header">
                          <strong>Confirm Trail</strong>
                          <span>
                            {selectedReplayConfirmTrail.decision === 'always_apply'
                              ? 'Always apply'
                              : selectedReplayConfirmTrail.decision === 'reject_comment'
                                ? 'Reject with comment'
                                : selectedReplayConfirmTrail.decision === 'apply'
                                  ? 'Apply once'
                                  : 'Recorded'}
                          </span>
                        </div>
                        <div className="replay-trace-summary">
                          {selectedReplayConfirmTrail.comment ||
                            'Decision recorded in the session trail.'}
                        </div>
                        {selectedReplayConfirmTrail.files.length ? (
                          <div className="replay-trace-files">
                            {selectedReplayConfirmTrail.files.map((file) => (
                              <span
                                key={`${selectedReplayTrace.id}-confirm-${file}`}
                                className="replay-history-file"
                              >
                                {file}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {selectedReplayApplyTrail.updatedAt ? (
                      <div className="replay-brewpm-callout">
                        <div className="replay-history-header">
                          <strong>Apply Result</strong>
                          <span>
                            {selectedReplayApplyTrail.success
                              ? 'Completed'
                              : 'Failed'}
                          </span>
                        </div>
                        <div className="replay-trace-summary">
                          {selectedReplayApplyTrail.success
                            ? selectedReplayApplyTrail.output ||
                              'Sandbox apply completed and recorded in the trail.'
                            : selectedReplayApplyTrail.error ||
                              'Sandbox apply failed and was recorded in the trail.'}
                        </div>
                        <div className="replay-collab-meta">
                          {selectedReplayApplyTrail.commitHash ||
                            selectedReplayApplyTrail.branch
                            ? [
                                selectedReplayApplyTrail.commitHash,
                                selectedReplayApplyTrail.branch,
                              ]
                                .filter(Boolean)
                                .join(' • ')
                            : 'Apply result recorded'}
                        </div>
                        {selectedReplayApplyTrail.changedFiles.length ? (
                          <div className="replay-trace-files">
                            {selectedReplayApplyTrail.changedFiles.map((file) => (
                              <span
                                key={`${selectedReplayTrace.id}-apply-${file}`}
                                className="replay-history-file"
                              >
                                {file}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    {selectedReplayTrace.brewpm_verdict ? (
                      <div className="replay-brewpm-callout">
                        <div className="replay-history-header">
                          <strong>BrewPM Verdict</strong>
                          <span>
                            {selectedReplayTrace.brewpm_review_provider &&
                            selectedReplayTrace.brewpm_review_model
                              ? `${selectedReplayTrace.brewpm_review_provider}/${selectedReplayTrace.brewpm_review_model}`
                              : 'Reviewer lane'}
                          </span>
                        </div>
                        <div className="replay-trace-summary">
                          {selectedReplayTrace.brewpm_verdict}
                          {selectedReplayTrace.brewpm_review_summary
                            ? ` • ${selectedReplayTrace.brewpm_review_summary}`
                            : ''}
                        </div>
                        {selectedReplayTrace.brewpm_corrections?.length ? (
                          <div className="replay-trace-files">
                            {selectedReplayTrace.brewpm_corrections.map((correction) => (
                              <span key={`${selectedReplayTrace.id}-${correction}`} className="replay-history-file">
                                {correction}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="replay-collab-lane">
                      <div className="replay-history-header">
                        <strong>Collab Handoffs</strong>
                        <span>
                          {selectedCollabEvents.length > 0
                            ? `${selectedCollabEvents.length} note(s)`
                            : 'No collab notes'}
                        </span>
                      </div>
                      {selectedCollabEvents.length === 0 ? (
                        <div className="code-viewer-status">
                          No persisted `collab.message` events for this run yet.
                        </div>
                      ) : (
                        <div className="replay-collab-list">
                          {selectedCollabEvents.map((event, index) => (
                            <div
                              key={`${selectedReplayTrace.id}-collab-${event.created_at}-${index}`}
                              className="replay-collab-event"
                            >
                              <div className="replay-history-meta">
                                <strong>
                                  {event.payload?.payload?.author ?? 'System'}
                                </strong>
                                <span>
                                  {event.payload?.payload?.decision ??
                                    event.payload?.payload?.kind ??
                                    'status'}
                                </span>
                                <span>
                                  {event.payload?.payload?.source ?? 'agent'}
                                </span>
                                <span>
                                  {new Date(event.created_at).toLocaleString()}
                                </span>
                              </div>
                              <div className="replay-trace-summary">
                                {event.payload?.payload?.message ??
                                  event.payload?.summary ??
                                  'Collab note'}
                              </div>
                              {event.payload?.payload?.files?.length ? (
                                <div className="replay-trace-files">
                                  {event.payload.payload.files.map((file) => (
                                    <span key={file} className="replay-trace-file">
                                      {file}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              <div className="replay-collab-meta">
                                {event.payload?.stage ?? 'replay'}
                                {' • '}
                                {event.payload?.payload?.presence ?? 'ready'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="replay-trace-list">
                      {selectedReplayTrace.events.map((event, index) => (
                        <div
                          key={`${selectedReplayTrace.id}-${event.created_at}-${index}`}
                          className="replay-trace-event"
                        >
                          <div className="replay-history-meta">
                            <strong>{event.event_type}</strong>
                            <span>
                              {new Date(event.created_at).toLocaleString()}
                            </span>
                          </div>
                          <div className="replay-trace-summary">
                            {event.payload?.summary ??
                              event.payload?.stage ??
                              'event'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </section>
      ) : null}

      <InitWizardModal
        open={showInitWizard}
        onClose={() => {
          setShowInitWizard(false);
          clearInitWizardDraft();
          if (typeof window !== 'undefined') {
            localStorage.setItem('brewassist.init.dismissed', 'true');
          }
        }}
        onComplete={(result) => {
          const { summary, nextPrompt, brewpmPath, branchLabel } = result;
          setShowInitWizard(false);
          clearInitWizardDraft();
          if (typeof window !== 'undefined') {
            localStorage.setItem('brewassist.init.complete', 'true');
            localStorage.removeItem('brewassist.init.dismissed');
          }

          // --- Checks & Balances ---
          const hasRepo = !!repoRoot;
          const githubToken = window.localStorage.getItem('github_token');
          const gitlabToken = window.localStorage.getItem('gitlab_token');
          const bitbucketToken = window.localStorage.getItem('bitbucket_token');
          
          const hasToken =
            (repoProvider === 'github' && !!githubToken) ||
            (repoProvider === 'gitlab' && !!gitlabToken) ||
            (repoProvider === 'bitbucket' && !!bitbucketToken) ||
            repoProvider === 'local';

          const isEnvironmentReady =
            brewpmPath === 'planner' ? true : hasRepo && hasToken;
          const initAnalysisPrompt = buildInitAnalysisPrompt(
            summary,
            nextPrompt,
            brewpmPath
          );
          setWorkflowMode(brewpmPath === 'planner' ? 'PLAN' : 'BUILD');

          setMessages((prev) => [
            ...prev,
            {
              id: makeId(),
              role: 'system',
              content: `Onboarding complete.\n\n${summary}\n\nBrewPM branch: ${branchLabel}`,
            },
            {
              id: makeId(),
              role: 'system',
              content:
                brewpmPath === 'planner'
                  ? '✅ Bootstrap mode verified: BrewPM is acting as the planning lead for a new repo or new environment. Define the spec and execution protocol first.'
                  : isEnvironmentReady
                    ? `✅ Environment Verified: ${repoProvider} connected to ${repoRoot}. Ready for planning and BrewPM review.`
                    : `⚠️ Environment Warning: Your repo is not fully connected yet. Please use the top navigation to connect ${repoProvider} before starting.`,
            },
          ]);

          setBrewPmReviewSummary(buildInitBranchSummary(summary, brewpmPath, branchLabel));

          if (isEnvironmentReady) {
            setWorkflowStage('plan');
            void handleSend({
              input: initAnalysisPrompt,
              dangerousAction: false,
              confirmApply: false,
            });
          }
        }}
      />

      <SlashCommandPalette
        open={showCommandPalette}
        onClose={() => {
          setShowCommandPalette(false);
          if (input === '/') {
            setInput('');
          }
          textareaRef.current?.focus();
        }}
        onInsert={(command) => {
          setInput(command + ' ');
          setShowCommandPalette(false);
          textareaRef.current?.focus();
        }}
        onRun={(command) => {
          setShowCommandPalette(false);
          void handleSend({ input: command });
        }}
      />

      {}

      {showConfirmationModal && pendingAction && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <p className="confirmation-modal-message">
              ⚠ This action may write files or change execution state. Review
              the pending step before proceeding.
            </p>
            {pendingAction.reason ? (
              <p className="confirmation-modal-message confirmation-modal-message--subtle">
                {pendingAction.reason}
              </p>
            ) : null}
            <textarea
              className="confirmation-modal-comment"
              value={executionRejectComment}
              onChange={(e) => setExecutionRejectComment(e.target.value)}
              placeholder="Optional rejection comment for audit trail"
              rows={3}
            />
            <div className="confirmation-modal-actions">
              <button
                onClick={handleCancelConfirmation}
                className="confirmation-modal-button confirmation-modal-button--cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleForceRun}
                className="confirmation-modal-button confirmation-modal-button--force"
              >
                Apply once
              </button>
              <button
                onClick={handleAlwaysApply}
                className="confirmation-modal-button confirmation-modal-button--force"
              >
                Always apply
              </button>
              <button
                onClick={handleRejectExecution}
                className="confirmation-modal-button confirmation-modal-button--cancel"
              >
                Reject with comment
              </button>
            </div>
          </div>
        </div>
      )}
        <SandboxDiffModal 
        open={showSandboxDiffModal} 
        onClose={() => setShowSandboxDiffModal(false)}
        onPreviewSummary={(summary) =>
          setSandboxReviewSummary((prev) => ({
            diffFiles: summary.diffFiles,
            addedLines: summary.addedLines,
            removedLines: summary.removedLines,
            hasBinaryHint: summary.hasBinaryHint,
            hasChanges: summary.hasChanges,
            files: summary.files,
            decision: summary.decision ?? prev?.decision ?? 'apply',
            updatedAt: summary.updatedAt,
          }))
        }
        onSuccess={({ commitHash, branch, changedFiles }) => {
          setShowSandboxDiffModal(false);
          setHasPendingSandboxChanges(false);
          setSandboxReviewSummary(null);
          sandboxPreviewNoticeShownRef.current = false;
          setWorkflowStage('report');
          appendSystemNotice(
            `✅ Changes pushed${commitHash ? ` at ${commitHash}` : ''}${branch ? ` on ${branch}` : ''}${changedFiles?.length ? ` · ${changedFiles.length} file(s)` : ''}.`
          );
        }}
      />
    </div>
  );
};
