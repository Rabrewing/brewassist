import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
      kind?: string;
      presence?: string;
      source?: 'agent' | 'human';
    };
  };
  created_at: string;
};

type ReplayRun = {
  id: string;
  status: string;
  truth_score: number | null;
  created_at: string;
  events: ReplayEvent[];
};

type ReplayTrace = ReplayRun | null;

const defaultSystemLine =
  'BrewAssist is online. Select HRM, LLM, Agent, or Loop, then send a prompt to begin.';

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const BrewCockpitCenter: React.FC = () => {
  // Removed props
  const { mode, setMode, tier, setTier } = useToolbelt(); // Consume from context
  const { mode: cockpitMode } = useCockpitMode();
  const { repoProvider, repoRoot } = useRepoConnection();
  const {
    orgId,
    workspaceId,
    selectedReplayRunId,
    replayOpenRequestToken,
    setSelectedReplayRunId,
  } = useEnterpriseSelection();
  const { session } = useSupabaseAuth();
  const { recordEvent: recordDevOps8Event } = useDevOps8Runtime();
  const [input, setInput] = useState('');
  const [showSandboxDiffModal, setShowSandboxDiffModal] = useState(false);
  const [hasPendingSandboxChanges, setHasPendingSandboxChanges] = useState(false);
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
  const [showInitWizard, setShowInitWizard] = useState(false);
  const [showFirstRunBanner, setShowFirstRunBanner] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [replayRuns, setReplayRuns] = useState<ReplayRun[]>([]);
  const [replayLoading, setReplayLoading] = useState(false);
  const [replayError, setReplayError] = useState<string | null>(null);
  const [selectedReplayTrace, setSelectedReplayTrace] =
    useState<ReplayTrace>(null);
  const [selectedReplayLoading, setSelectedReplayLoading] = useState(false);

  const selectedCollabEvents = useMemo(
    () =>
      (selectedReplayTrace?.events ?? []).filter(
        (event) => event.event_type === 'collab.message'
      ),
    [selectedReplayTrace]
  );

  useEffect(() => {
    if (!selectedReplayRunId || replayOpenRequestToken === 0) return;
    setWorkflowStage('replay');
  }, [replayOpenRequestToken, selectedReplayRunId]);

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
  const [pendingAction, setPendingAction] = useState<any | null>(null);
  const logRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(logRef.current); // Use logRef for chatContainerRef
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false); // S4.10c.2 Auto-Scroll Fix

  const composerPlaceholder = showFirstRunBanner
    ? 'BrewAssist setup... Type / for commands or /init to onboard.'
    : `BrewAssist ${getWorkflowStageLabel(workflowStage).toLowerCase()}... Type / for commands.`;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const completed = localStorage.getItem('brewassist.init.complete');
    const dismissed = localStorage.getItem('brewassist.init.dismissed');
    const shouldShow = !completed && !dismissed;
    setShowFirstRunBanner(shouldShow);
    if (shouldShow) {
      setShowInitWizard(true);
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
  }, [messages, userHasScrolledUp]);

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
        const response = await fetch('/api/replay-history', {
          headers: {
            'x-brewassist-org-id': orgId,
            ...(workspaceId
              ? { 'x-brewassist-workspace-id': workspaceId }
              : {}),
            Authorization: `Bearer ${session.access_token}`,
          },
        });

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

  // S4.9c.1: Handle manual scrolling to disable/enable auto-scroll
  const isNearBottom = () => {
    if (!chatContainerRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    return scrollHeight - scrollTop - clientHeight < 80;
  };

  const handleScroll = useCallback(() => {
    setAutoScrollEnabled(isNearBottom());
  }, []);

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

  const handleSend = useCallback(
    async (overridePayload?: any) => {
      const currentInput = overridePayload?.input || input;
      const trimmed = currentInput.trim();
      if (!trimmed || isThinking) return;

      if (trimmed === '/init' || trimmed.startsWith('/init ')) {
        setShowInitWizard(true);
        setInput('');
        return;
      }

      const requestStartedAt = performance.now();

      setLastError(null);
      const nextStage = deriveWorkflowStageFromInput(trimmed);
      setWorkflowStage(nextStage);
      recordDevOps8Event({
        type: 'intent.captured',
        payload: {
          input: trimmed,
          stage: nextStage,
          runLabel: trimmed.slice(0, 120),
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
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsThinking(true);
      setCognitionPhase('Evaluating request...');
      setCognitionState(null);
      setAutoScrollEnabled(true);

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
        const payload = {
          input: trimmed,
          mode,
          tier,
          skillLevel: 'intermediate',
          useDeepReasoning: nextUseDeepReasoning,
          useResearchModel: nextUseResearchModel,
          repoProvider,
          repoRoot,
          ...overridePayload,
        };

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
          body: JSON.stringify(payload),
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
                        recordDevOps8Event({
                          type: 'preview.ready',
                          payload: {
                            diffFiles: 1,
                            hasChanges: true,
                            },
                            });

                            if (json.needsPreviewRefresh) {
                            setHasPendingSandboxChanges(true);
                            setWorkflowStage('preview');
                            appendSystemNotice('AI modifications completed in Sandbox. Review diff before applying.');
                            }

                            setMessages((prev) =>                          prev.map((msg) =>
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
              truthScore: 1,
              coverage: 1,
              reportLabel: newText.slice(0, 120),
            },
          });
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
      tier,
      isThinking,
      nextUseDeepReasoning,
      nextUseResearchModel,
      cockpitMode,
      repoProvider,
      repoRoot,
    ]
  ); // Add cockpitMode to dependencies

  const handleForceRun = useCallback(() => {
    if (pendingAction) {
      const newPayload = { ...pendingAction.payload, dangerousAction: false };
      void handleSend(newPayload);
      setShowConfirmationModal(false);
      setPendingAction(null);
    }
  }, [pendingAction, handleSend]);

  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmationModal(false);
    setPendingAction(null);
  }, []);

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

  const lastAssistantMessage = messages
    .filter((msg) => msg.role === 'assistant')
    .pop();

  return (
    <div className="cockpit-center">
      <div className="cockpit-center-scroll" onScroll={handleScroll}>
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

        <div className="cockpit-message-log" ref={logRef}>
          {messages.map(renderBubble)}

          {isThinking && (
            <div className="log-line log-assistant">
              <div className="cosmic-bubble">
                <span className="brewassist-thinking-dot" /> {cognitionPhase}
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
      </div>

      <div className="brew-input-area">
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
            <button
              className="workspace-send-button"
              style={{ background: '#22d3ee', color: '#020617', marginLeft: '0.5rem', minWidth: 'max-content' }}
              onClick={() => setShowSandboxDiffModal(true)}
            >
              Review & Apply
            </button>
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
                    </div>
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
                                  {event.payload?.payload?.kind ?? 'status'}
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
          if (typeof window !== 'undefined') {
            localStorage.setItem('brewassist.init.dismissed', 'true');
          }
        }}
        onComplete={(summary, nextPrompt) => {
          setShowInitWizard(false);
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

          const isEnvironmentReady = hasRepo && hasToken;

          setMessages((prev) => [
            ...prev,
            {
              id: makeId(),
              role: 'system',
              content: `Onboarding complete.\n\n${summary}`,
            },
            {
              id: makeId(),
              role: 'system',
              content: isEnvironmentReady
                ? `✅ Environment Verified: ${repoProvider} connected to ${repoRoot}. Ready for planning.`
                : `⚠️ Environment Warning: Your repo is not fully connected yet. Please use the top navigation to connect ${repoProvider} before starting.`,
            },
          ]);

          if (isEnvironmentReady) {
            setInput(nextPrompt);
            setWorkflowStage('plan');
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
              ⚠ BrewTruth is not confident this is safe. Truth score:{' '}
              {Math.round(pendingAction.truth.truthScore * 100)}% · Risk:{' '}
              {pendingAction.truth.riskLevel}. Are you sure you want to proceed?
            </p>
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
                Force run anyway
              </button>
            </div>
          </div>
        </div>
      )}
      <SandboxDiffModal 
        open={showSandboxDiffModal} 
        onClose={() => setShowSandboxDiffModal(false)}
        onSuccess={() => {
          setShowSandboxDiffModal(false);
          setHasPendingSandboxChanges(false);
          setWorkflowStage('report');
          appendSystemNotice('✅ Changes successfully committed and pushed to remote repository!');
        }}
      />
    </div>
  );
};
