// pages/api/brewassist.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { runBrewAssistEngineStream } from '@/lib/brewassist-engine';
import { BrewTruthReport, runBrewTruth } from '@/lib/brewtruth';
import { PersonaId } from '@/lib/brewIdentityEngine';
import { CAPABILITY_REGISTRY, RWX } from '@/lib/capabilities/registry'; // Import CAPABILITY_REGISTRY, RWX
import { BrewTier } from '@/lib/commands/types'; // Import BrewTier
import { UnifiedPolicyEnvelope } from '@/lib/toolbelt/handshake';
import {
  BREWASSIST_CANONICAL_DEFINITION,
  BREWASSIST_IDENTITY_PROMPTS,
} from '@/lib/brand/brewassist.definition'; // Import brand definition
import { Persona } from '@/lib/brewIdentityEngine'; // Import Persona
import { getDevOpsFeedbackState } from '@/lib/devops8/registry';
import { parseEnterpriseContext } from '@/lib/enterpriseContext';
import {
  getAuthenticatedUser,
  getSupabaseEnterpriseRole,
} from '@/lib/supabase/server';
import {
  buildBrewAssistEndPayload,
  runCollabAgent,
  runExecutorAgentChunk,
  runExecutorAgentComplete,
  runExecutorAgentStart,
  runIntentAgent,
  runPlannerAgent,
  runPolicyAgent,
  runReplayAgent,
  runReporterAgent,
  runReporterAgentFailure,
} from '@/lib/agent-fabric/agents';
import {
  AgentRuntime,
  createAgentRuntimeContext,
} from '@/lib/agent-fabric/runtime';
import { persistAgentRun } from '@/lib/agent-fabric/persistence';

export type BrewAssistApiRequest = {
  input: string;
  mode: 'HRM' | 'LLM' | 'AGENT' | 'LOOP' | 'TOOL'; // Add "TOOL" mode
  tier?: BrewTier; // Use BrewTier
  persona?: Persona; // Add persona
  skillLevel?: 'beginner' | 'intermediate' | 'expert';
  useDeepReasoning?: boolean;
  useResearchModel?: boolean;
  dangerousAction?: boolean;
  capabilityId?: string; // Use capabilityId
  action?: RWX; // Use action
  toolRequest?: any;
  confirmApply?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({
      ok: false,
      error: 'Method Not Allowed',
      code: 'METHOD_NOT_ALLOWED',
    });
    return;
  }

  const enterpriseContext = parseEnterpriseContext(req);
  const authUser = await getAuthenticatedUser(req, res);

  if (!authUser) {
    return res.status(401).json({
      ok: false,
      error: 'Sign in required',
      code: 'UNAUTHENTICATED',
    });
  }

  const resolvedRole = await getSupabaseEnterpriseRole(
    req,
    res,
    enterpriseContext.orgId
  );
  enterpriseContext.role = resolvedRole;

  const {
    input,
    mode,
    tier, // Use 'tier' directly
    persona: requestPersona, // Capture persona from body if provided
    skillLevel,
    useDeepReasoning,
    useResearchModel,
    dangerousAction,
    capabilityId, // Use capabilityId
    action, // Use action
    toolRequest,
    confirmApply,
    truthScore,
    truthFlags,
  }: BrewAssistApiRequest & {
    truthScore?: number;
    truthFlags?: string[];
  } = req.body;

  const cockpitMode = enterpriseContext.cockpitMode;
  const currentPersona: PersonaId =
    requestPersona?.id || (resolvedRole === 'admin' ? 'admin' : 'customer'); // Determine persona
  const normalizedTier: BrewTier = tier || 'basic'; // Default to basic if not provided

  if (!input) {
    return res.status(400).json({
      ok: false,
      error: 'Missing required field: input',
      code: 'INVALID_REQUEST',
    });
  }

  // S4.10c.2 Patch: Brand Anchor - Detect identity/definition intents
  const lowerCaseInput = input.toLowerCase();
  const isIdentityIntent = BREWASSIST_IDENTITY_PROMPTS.some((p) =>
    lowerCaseInput.includes(p)
  );

  if (isIdentityIntent) {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      ok: true,
      text: BREWASSIST_CANONICAL_DEFINITION,
      truth: null,
      blockedByTruth: false,
      policy: {
        ok: true,
        route: 'brewassist',
        tier: normalizedTier,
        reason: 'Brand Anchor response',
        capabilityId: '/identity', // Placeholder capability for identity
      },
      route: 'brewassist',
      scopeCategory: 'PLATFORM_DEVOPS', // Identity is always platform devops
    });
    return;
  }

  const resolvedPersona: Persona = {
    id: resolvedRole === 'customer' ? 'customer' : currentPersona,
    label: `Resolved Persona: ${currentPersona}`, // Placeholder label
    tone: 'Neutral', // Placeholder tone
    emotionTier: 1, // Placeholder tier
    safetyMode: 'soft-stop', // Placeholder safety mode
    memoryWindow: 1, // Placeholder memory window
    systemPrompt: `Persona derived from request: ${currentPersona}; org=${enterpriseContext.orgId ?? 'none'}; repo=${enterpriseContext.repoId ?? 'none'}`, // Placeholder system prompt
  };
  const runtime = new AgentRuntime(
    createAgentRuntimeContext({
      tenantId: enterpriseContext.tenantId,
      orgId: enterpriseContext.orgId,
      workspaceId: enterpriseContext.workspaceId,
      repoProvider: enterpriseContext.repoProvider,
      repoRoot: enterpriseContext.repoRoot,
      repoId: enterpriseContext.repoId,
      projectId: enterpriseContext.projectId,
      userId: authUser.id,
      role: resolvedRole,
      cockpitMode,
      tier: normalizedTier,
      personaId: currentPersona,
      persona: resolvedPersona,
      input,
      mode,
      capabilityId,
      action,
      confirmApply,
      gepHeaderPresent: !!req.headers['x-gemini-execution-protocol'],
      truthScore,
      truthFlags,
    })
  );
  runtime.emit({
    agentId: 'telemetry_agent',
    eventType: 'telemetry.updated',
    stage: 'intent',
    summary: 'Initialized runtime telemetry',
    payload: runtime.state.telemetry,
  });
  const { intent, commandCapabilityId } = runIntentAgent(runtime);
  runPlannerAgent(runtime);
  const policyEnvelope: UnifiedPolicyEnvelope = runPolicyAgent(runtime);

  // Handle policy decisions
  if (!policyEnvelope.ok) {
    runCollabAgent(runtime, {
      author: 'Policy',
      message:
        'Run blocked before execution. Review policy gate and retry with the required approval context.',
      kind: 'review',
      source: 'agent',
      presence: 'needs-review',
      reportReady: false,
    });

    let statusCode = 403; // Forbidden
    if (policyEnvelope.reason?.includes('TOOLBELT_GEP_REQUIRED')) {
      statusCode = 412; // Precondition Failed
    } else if (policyEnvelope.requiresConfirm) {
      statusCode = 409; // Conflict (requires user action)
    }

    // Record permission gating block
    await persistAgentRun({ runtime, status: 'blocked' }).catch((error) => {
      console.error('[agent-fabric/persist] blocked persist failed', error);
    });

    return res.status(statusCode).json({
      ok: false,
      error: policyEnvelope.reason,
      policy: policyEnvelope,
      route: policyEnvelope.route,
    });
  }

  // If a command was identified and allowed by policy, execute it (mock for now)
  if (commandCapabilityId && policyEnvelope.ok) {
    // In a real scenario, this would trigger the actual command handler
    return res.status(200).json({
      ok: true,
      message: `Command '${commandCapabilityId}' mocked successfully.`,
      policy: policyEnvelope,
      route: 'command_executed',
      commandResult: {
        status: 'success',
        output: `Mocked output for ${commandCapabilityId}`,
      },
    });
  }

  // If a tool was identified and allowed by policy, execute it (mock for now)
  if (capabilityId && policyEnvelope.ok) {
    // In a real scenario, this would trigger the actual tool handler
    return res.status(200).json({
      ok: true,
      message: `Tool '${capabilityId}' mocked successfully.`,
      policy: policyEnvelope,
      route: 'tool_executed',
      toolResult: {
        status: 'success',
        output: `Mocked output for ${capabilityId}`,
      },
    });
  }

  if (cockpitMode === 'customer' && intent === 'GENERAL_KNOWLEDGE') {
    const redirectMessage =
      'This question seems to be outside of my scope as a DevOps assistant. For general knowledge questions, please use BrewChat or BrewCore.';
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      ok: true,
      text: redirectMessage,
      truth: null,
      policy: {
        ok: false,
        route: 'blocked',
        tier: normalizedTier,
        reason: 'GENERAL_KNOWLEDGE_BLOCKED_CUSTOMER_MODE',
      },
      route: 'blocked',
      scopeCategory: 'GENERAL_KNOWLEDGE',
    });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  // Update flow state: streaming is active
  runExecutorAgentStart(runtime);
  runCollabAgent(runtime, {
    author: 'Planner',
    message:
      'Execution handoff is live. Capture notes in replay after the run settles.',
    kind: 'handoff',
    source: 'agent',
    presence: 'live',
    screenShareActive: false,
    reportReady: false,
  });

  let accumulatedText = '';
  let providerUsed: string | undefined;
  let modelUsed: string | undefined;
  let brewTruthReport: BrewTruthReport | null = null;
  let debugInfo: any | undefined; // Declare debugInfo here
  const startTime = process.hrtime.bigint(); // Start timer for latency

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Run BrewTruth if enabled
    if (process.env.BREWTRUTH_ENABLED === 'true') {
      brewTruthReport = await runBrewTruth({ prompt: input, response: '' });
      runReporterAgent(runtime, brewTruthReport);
      runCollabAgent(runtime, {
        author: 'Reporter',
        message: `BrewTruth report is ready with score ${brewTruthReport.overallScore.toFixed(2)}.`,
        kind: 'report',
        source: 'agent',
        presence: 'report-ready',
        reportReady: true,
      });
    }

    // Evaluate Handshake for policy decision (even if not TOOL mode, for reporting)
    // policyEnvelope is already determined above, so we just use it here.

    let hasEngineCompleted = false; // Moved inside handler

    const engineRunPromise = new Promise<any>((resolve, reject) => {
      runBrewAssistEngineStream(
        {
          prompt: input,
          mode: mode.toLowerCase() as 'hrm' | 'llm' | 'agent' | 'loop',
          preferredProvider: undefined,
          tier: normalizedTier,
          cockpitMode,
          intent, // Pass intent here
        },
        (chunk) => {
          const text = String(chunk ?? '');
          if (!text) return;
          accumulatedText += text;
          sendEvent({ type: 'chunk', text });
          const now = Date.now();
          runExecutorAgentChunk(runtime, {
            text,
            hasFeedbackGap:
              getDevOpsFeedbackState().lastChunkTime > 0 &&
              now - getDevOpsFeedbackState().lastChunkTime > 1000,
            truthScore: brewTruthReport?.overallScore ?? 1,
            schemaDiffsDetected: Boolean(brewTruthReport?.flags?.length),
          });
        },
        (result) => {
          // onEnd callback
          providerUsed = result.provider;
          modelUsed = result.model;
          hasEngineCompleted = true;
          debugInfo = result.debugInfo; // Capture debugInfo
          resolve({ status: 'completed' }); // Resolve here on successful completion
        }
      ).catch((err) => {
        reject(err); // Reject if runBrewAssistEngineStream throws an error
      });
    });

    const timeoutPromise = new Promise<any>((resolve) => {
      setTimeout(() => {
        if (!hasEngineCompleted && (mode === 'AGENT' || mode === 'LOOP')) {
          resolve({ status: 'timeout' });
        } else {
          resolve({ status: 'no_timeout' }); // Resolve without timeout action if engine already completed or not agent/loop
        }
      }, 10000); // 10 seconds timeout
    });

    const raceResult = await Promise.race([engineRunPromise, timeoutPromise]);

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    runtime.state.accumulatedText = accumulatedText;
    runExecutorAgentComplete(runtime, {
      latencyMs: durationMs,
      truthScore: brewTruthReport?.overallScore ?? 1,
      policyGateFailures: policyEnvelope.ok ? 0 : 1,
      schemaDiffsDetected: Boolean(brewTruthReport?.flags?.length),
    });

    if (raceResult.status === 'timeout') {
      const message = `Agent/Loop mode is not fully wired yet. Please use HRM or LLM mode.`;
      runCollabAgent(runtime, {
        author: 'Executor',
        message:
          'Execution timed out. Handoff replay trace to the next teammate before retrying.',
        kind: 'review',
        source: 'agent',
        presence: 'timeout',
        reportReady: Boolean(brewTruthReport),
      });
      runReplayAgent(runtime, {
        provider: 'BrewAssist',
        model: 'Fallback',
        outcome: 'timeout',
      });
      await persistAgentRun({ runtime, status: 'timeout' }).catch((error) => {
        console.error('[agent-fabric/persist] timeout persist failed', error);
      });
      sendEvent({ type: 'chunk', text: message });
      sendEvent({
        type: 'end',
        payload: buildBrewAssistEndPayload(runtime, {
          provider: 'BrewAssist',
          model: 'Fallback',
          route: 'brewassist',
          debugInfo,
        }),
        text: message,
        truth: brewTruthReport,
        policy: policyEnvelope,
      });
    } else if (raceResult.status === 'completed') {
      runCollabAgent(runtime, {
        author: 'Executor',
        message:
          'Execution completed. Replay is ready for async review in the collab rail.',
        kind: 'status',
        source: 'agent',
        presence: 'complete',
        reportReady: Boolean(brewTruthReport),
      });
      runReplayAgent(runtime, {
        provider: providerUsed,
        model: modelUsed,
        outcome: 'completed',
      });
      await persistAgentRun({ runtime, status: 'completed' }).catch((error) => {
        console.error('[agent-fabric/persist] completed persist failed', error);
      });
      sendEvent({
        type: 'end',
        payload: buildBrewAssistEndPayload(runtime, {
          provider: providerUsed,
          model: modelUsed,
          route: 'brewassist',
          debugInfo,
        }),
        text: accumulatedText,
        truth: brewTruthReport,
        policy: policyEnvelope,
        needsPreviewRefresh: raceResult.value?.needsPreviewRefresh,
      });
    }
  } catch (error) {
    console.error('Error in brewassist-stream:', error);
    sendEvent({
      type: 'error',
      payload: { message: (error as Error).message },
    });
    // Record interruption
    runReporterAgentFailure(runtime, brewTruthReport?.overallScore ?? 0);
    runCollabAgent(runtime, {
      author: 'Executor',
      message:
        'Execution failed. Review replay and error telemetry before the next attempt.',
      kind: 'review',
      source: 'agent',
      presence: 'error',
      reportReady: Boolean(brewTruthReport),
    });
    runReplayAgent(runtime, {
      provider: 'BrewAssist',
      model: 'ErrorFallback',
      outcome: 'error',
    });
    await persistAgentRun({ runtime, status: 'error' }).catch(
      (persistError) => {
        console.error(
          '[agent-fabric/persist] error persist failed',
          persistError
        );
      }
    );
    // Always send an end event on error to ensure client stream closes
    sendEvent({
      type: 'end',
      payload: buildBrewAssistEndPayload(runtime, {
        provider: 'BrewAssist',
        model: 'ErrorFallback',
        route: 'brewassist',
        debugInfo,
      }),
      text: 'An error occurred during processing.',
      truth: brewTruthReport,
      policy: policyEnvelope,
    });
  } finally {
    res.end();
  }
}
