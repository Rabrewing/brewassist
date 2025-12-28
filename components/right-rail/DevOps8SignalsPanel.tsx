import React from "react";
import { useCockpitMode } from "@/contexts/CockpitModeContext";

interface DevOps8SignalsPanelProps {
  // Props for dynamic data will be added here later
}

// Mock data for DevOps 8 signals (for UI representation)
const devOps8Signals = [
  {
    id: 'flowOverBatch',
    icon: '🌊',
    principle: 'Flow over batch',
    customerSignal: 'chunking = optimal',
    adminSignal: 'chunking = optimal | degraded (from execution planner)',
    status: 'optimal', // Mock status
  },
  {
    id: 'fastFeedback',
    icon: '⚡',
    principle: 'Fast feedback',
    customerSignal: 'incremental responses = on',
    adminSignal: 'incremental responses = on | off (from streaming + partial outputs)',
    status: 'on', // Mock status
  },
  {
    id: 'continuousLearning',
    icon: '🧠',
    principle: 'Continuous learning',
    customerSignal: 'memory write = success',
    adminSignal: 'memory write = success | skipped (from BrewLast / memory layer)',
    status: 'success', // Mock status
  },
  {
    id: 'buildQualityIn',
    icon: '✅',
    principle: 'Build quality in',
    customerSignal: 'pre-validation = passed',
    adminSignal: 'pre-validation = passed | bypassed (from policy + validation gate)',
    status: 'passed', // Mock status
  },
  {
    id: 'limitWIP',
    icon: '🚧',
    principle: 'Limit work in progress',
    customerSignal: 'scope size = contained',
    adminSignal: 'scope size = contained | expanding (from intent + scope evaluation)',
    status: 'contained', // Mock status
  },
  {
    id: 'automateSafely',
    icon: '🔒',
    principle: 'Automate safely',
    customerSignal: 'policy gates = enforced',
    adminSignal: 'policy gates = enforced | overridden (from capability registry + handshake)',
    status: 'enforced', // Mock status
  },
  {
    id: 'makeWorkVisible',
    icon: '👁️',
    principle: 'Make work visible',
    customerSignal: 'reasoning surfaced = yes',
    adminSignal: 'reasoning surfaced = yes | partial (from BrewTruth + explanation hooks)',
    status: 'yes', // Mock status
  },
  {
    id: 'optimizeForFlow',
    icon: '🚀',
    principle: 'Optimize for flow',
    customerSignal: 'steps reduced = yes',
    adminSignal: 'steps reduced = yes | no (from execution plan delta)',
    status: 'yes', // Mock status
  },
];

export const DevOps8SignalsPanel: React.FC<DevOps8SignalsPanelProps> = () => {
  const { mode: cockpitMode } = useCockpitMode();

  // Mock status chip
  const statusChip = "Live"; // Can be dynamic later: Live | Idle | Executing

  return (
    <div className="devops-8-signals-panel">
      <div className="panel-header">
        <h3 className="panel-title">DevOps 8</h3>
        <span className="panel-subtitle">Operational Signals</span>
        <span className={`status-chip status-chip-${statusChip.toLowerCase()}`}>{statusChip}</span>
      </div>
      <div className="panel-body">
        {devOps8Signals.map((signal) => (
          <div key={signal.id} className="signal-row">
            <span className="signal-icon">{signal.icon}</span>
            <span className="principle-name">{signal.principle}</span>
            <span className={`signal-status signal-status-${signal.status}`}>
              {cockpitMode === 'customer' ? signal.customerSignal : signal.adminSignal}
            </span>
            {cockpitMode === 'admin' && (
              <span className="admin-debug-info">
                {/* Placeholder for deeper metrics, debug hooks, policy traces, cognition links */}
                (Admin Debug Info)
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
