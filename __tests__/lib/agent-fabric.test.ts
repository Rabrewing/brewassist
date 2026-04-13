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
} from '../../lib/agent-fabric/agents';
import {
  AgentRuntime,
  createAgentRuntimeContext,
} from '../../lib/agent-fabric/runtime';

function createRuntime(
  overrides?: Partial<ReturnType<typeof createAgentRuntimeContext>>
) {
  return new AgentRuntime(
    createAgentRuntimeContext({
      userId: 'user-1',
      role: 'admin',
      cockpitMode: 'admin',
      tier: 'basic',
      personaId: 'admin',
      persona: {
        id: 'admin',
        label: 'Admin',
        tone: 'Neutral',
        emotionTier: 3,
        safetyMode: 'hard-stop',
        memoryWindow: 3,
        systemPrompt: 'admin',
      },
      input: 'explain the docs',
      mode: 'LLM',
      ...overrides,
    })
  );
}

describe('agent fabric runtime', () => {
  it('classifies intent and creates a plan event', () => {
    const runtime = createRuntime({ input: 'explain the docs for onboarding' });

    const intentResult = runIntentAgent(runtime);
    const planResult = runPlannerAgent(runtime);

    expect(intentResult.intent).toBe('DOCS_KB');
    expect(planResult.stepCount).toBe(3);
    expect(runtime.events.map((event) => event.eventType)).toEqual([
      'intent.captured',
      'plan.created',
    ]);
  });

  it('requests confirmation when policy requires it', () => {
    const runtime = createRuntime({
      input: 'apply a patch',
      mode: 'TOOL',
      capabilityId: 'fs_write',
      action: 'W',
      confirmApply: false,
    });

    runIntentAgent(runtime);
    runPlannerAgent(runtime);
    const policy = runPolicyAgent(runtime);

    expect(policy.ok).toBe(false);
    expect(runtime.state.stage).toBe('confirm');
    expect(runtime.events.map((event) => event.eventType)).toContain(
      'confirm.requested'
    );
  });

  it('marks preview ready when policy allows the request', () => {
    const runtime = createRuntime({
      input: 'show me repo status',
      mode: 'LLM',
    });

    runIntentAgent(runtime);
    runPlannerAgent(runtime);
    const policy = runPolicyAgent(runtime);

    expect(policy.ok).toBe(true);
    expect(runtime.state.stage).toBe('preview');
    expect(runtime.events.map((event) => event.eventType)).toContain(
      'preview.ready'
    );
  });

  it('tracks execution and reporting through wave 2 agents', () => {
    const runtime = createRuntime({
      input: 'show me repo status',
      mode: 'LLM',
    });

    runIntentAgent(runtime);
    runPlannerAgent(runtime);
    runPolicyAgent(runtime);
    runExecutorAgentStart(runtime);
    runExecutorAgentChunk(runtime, {
      text: 'stream output',
      truthScore: 0.9,
      schemaDiffsDetected: false,
    });
    runReporterAgent(runtime, {
      overallScore: 0.9,
      flags: [],
      verdict: 'PASS',
      summary: 'ok',
      policyVersion: 'test',
      timestamp: new Date().toISOString(),
    });
    runExecutorAgentComplete(runtime, {
      latencyMs: 120,
      truthScore: 0.9,
      policyGateFailures: 0,
      schemaDiffsDetected: false,
    });

    expect(runtime.state.stage).toBe('report');
    expect(runtime.state.accumulatedText).toContain('stream output');
    expect(runtime.events.map((event) => event.eventType)).toEqual(
      expect.arrayContaining([
        'execute.started',
        'report.emitted',
        'execute.completed',
      ])
    );
  });

  it('updates telemetry on execution failure', () => {
    const runtime = createRuntime();

    runReporterAgentFailure(runtime, 0.2);

    expect(runtime.state.telemetry.policyGateFailures).toBe(1);
    expect(runtime.state.telemetry.truthScore).toBe(0.2);
    expect(runtime.events[runtime.events.length - 1]?.eventType).toBe(
      'telemetry.updated'
    );
  });

  it('emits typed collaboration handoff notes', () => {
    const runtime = createRuntime({
      input: 'ship the replay handoff',
      mode: 'AGENT',
    });

    const collab = runCollabAgent(runtime, {
      author: 'Planner',
      message: 'Execution handoff is ready for teammate review.',
      kind: 'handoff',
      source: 'agent',
      presence: 'live',
      reportReady: false,
    });

    expect(collab).toMatchObject({
      messageCount: 1,
      lastAuthor: 'Planner',
    });
    expect(runtime.events[runtime.events.length - 1]).toMatchObject({
      agentId: 'collab_agent',
      eventType: 'collab.message',
      payload: expect.objectContaining({
        author: 'Planner',
        kind: 'handoff',
        source: 'agent',
        messageCount: 1,
      }),
    });
  });

  it('emits replay availability and shapes end payloads', () => {
    const runtime = createRuntime({
      input: 'show me repo status',
      mode: 'LLM',
    });

    runIntentAgent(runtime);
    runPlannerAgent(runtime);
    runPolicyAgent(runtime);
    const replay = runReplayAgent(runtime, {
      provider: 'mockProvider',
      model: 'mockModel',
      outcome: 'completed',
    });
    const payload = buildBrewAssistEndPayload(runtime, {
      provider: 'mockProvider',
      model: 'mockModel',
      route: 'brewassist',
      debugInfo: { sample: true },
    });

    expect(replay.runLabel).toContain('completed:mockProvider:mockModel');
    expect(runtime.state.stage).toBe('replay');
    expect(runtime.events.map((event) => event.eventType)).toContain(
      'replay.available'
    );
    expect(payload).toMatchObject({
      provider: 'mockProvider',
      model: 'mockModel',
      route: 'brewassist',
      scopeCategory: 'PLATFORM_DEVOPS',
      replay: {
        available: true,
      },
    });
  });
});
