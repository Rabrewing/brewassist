import React, { useMemo } from 'react';
import { useCockpitMode } from '@/contexts/CockpitModeContext';
import { useDevOps8Runtime } from '@/contexts/DevOps8RuntimeContext';
import { computeFlowIntegrity } from '@/lib/devops8/adapters/flow';
import { computeFeedbackVelocity } from '@/lib/devops8/adapters/feedback';
import { computeLearningMemoryIntegrity } from '@/lib/devops8/adapters/memory';
import { computeBuildChangeQuality } from '@/lib/devops8/adapters/quality';
import { computeScopeContainment } from '@/lib/devops8/adapters/scope';
import { computeSafetyPolicyEnforcement } from '@/lib/devops8/adapters/policy';
import { computeReasoningVisibility } from '@/lib/devops8/adapters/reasoning';
import { computeExecutionEfficiency } from '@/lib/devops8/adapters/efficiency';
import type { DevOpsSignal } from '@/lib/devops8/types';

interface DevOps8SignalsPanelProps {}

const SIGNAL_ORDER: Array<{ id: DevOpsSignal['id']; icon: string }> = [
  { id: 'flow_integrity', icon: '🌊' },
  { id: 'feedback_velocity', icon: '⚡' },
  { id: 'learning_memory_integrity', icon: '🧠' },
  { id: 'build_change_quality', icon: '✅' },
  { id: 'scope_containment', icon: '🚧' },
  { id: 'safety_policy_enforcement', icon: '🔒' },
  { id: 'reasoning_visibility', icon: '👁️' },
  { id: 'execution_efficiency', icon: '🚀' },
];

function toneForStatus(status: DevOpsSignal['status']) {
  switch (status) {
    case 'optimal':
      return 'signal-chip--optimal';
    case 'degraded':
      return 'signal-chip--degraded';
    case 'stalled':
      return 'signal-chip--stalled';
    default:
      return 'signal-chip--unknown';
  }
}

export const DevOps8SignalsPanel: React.FC<DevOps8SignalsPanelProps> = () => {
  const { mode: cockpitMode } = useCockpitMode();
  const { runtime } = useDevOps8Runtime();

  const signals = useMemo(() => {
    return [
      computeFlowIntegrity({
        isStreaming: runtime.isStreaming,
        plannerChurnCount: runtime.plannerChurnCount,
        interruptions: runtime.interruptions,
        currentStep: runtime.chunkCount,
        totalSteps: Math.max(runtime.chunkCount + 1, 1),
        replans: runtime.plannerChurnCount,
      }),
      computeFeedbackVelocity({
        chunkCount: runtime.chunkCount,
        feedbackGaps: runtime.feedbackGaps,
        isStreaming: runtime.isStreaming,
      }),
      computeLearningMemoryIntegrity({
        brewLastWrites: runtime.brewLastWrites,
        memorySkips: runtime.memorySkips,
        permissionGatingBlocks: runtime.permissionGatingBlocks,
        conflicts: runtime.conflicts,
      }),
      computeBuildChangeQuality({
        policyGateFailures: runtime.policyGateFailures,
        brewTruthScore: runtime.brewTruthScore,
        testConfidence: runtime.testConfidence,
        schemaDiffsDetected: runtime.schemaDiffsDetected,
      }),
      computeScopeContainment({
        definedScopeItems: runtime.definedScopeItems,
        executedItems: runtime.executedItems,
        scopeCreepIncidents: runtime.scopeCreepIncidents,
        boundaryViolations: runtime.boundaryViolations,
      }),
      computeSafetyPolicyEnforcement({
        tier: runtime.tier,
        cockpitMode,
        personaId: runtime.personaId,
        recentHandshakes: runtime.recentChecks,
        violations: runtime.violations,
      }),
      computeReasoningVisibility({
        coverage: runtime.coverage,
        recentChecks: runtime.recentChecks,
      }),
      computeExecutionEfficiency({
        planChurn: runtime.plannerChurnCount,
        repeatedToolCalls: Math.max(runtime.chunkCount - 1, 0),
        stepCount: runtime.chunkCount,
        avgLatencyMs: runtime.lastLatencyMs,
        retries: runtime.interruptions,
      }),
    ];
  }, [cockpitMode, runtime]);

  const statusChip = runtime.isStreaming ? 'Live' : 'Idle';

  return (
    <div className="devops-8-signals-panel">
      <div className="panel-header">
        <h3 className="panel-title">DevOps 8</h3>
        <span className="panel-subtitle">
          {runtime.currentStage} • {runtime.lastRunLabel || 'No active run'}
        </span>
        <span className={`status-chip status-chip-${statusChip.toLowerCase()}`}>
          {statusChip}
        </span>
      </div>
      <div className="panel-body">
        {signals.map((signal, index) => {
          const meta = SIGNAL_ORDER[index];
          return (
            <div key={signal.id} className="signal-row">
              <span className="signal-icon">{meta.icon}</span>
              <span className="principle-name">{signal.label}</span>
              <span className={`signal-status ${toneForStatus(signal.status)}`}>
                {signal.value}% • {signal.status}
              </span>
              <span className="signal-notes">{signal.notes}</span>
              {cockpitMode === 'admin' && signal.adminDebugInfo && (
                <span className="admin-debug-info">
                  {JSON.stringify(signal.adminDebugInfo)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
