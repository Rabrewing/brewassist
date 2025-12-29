import React from 'react';

// Mock data for now, will be replaced with live data from lib/devops8.ts
const devOps8Signals = [
  { principle: 'Flow over batch', signal: 'chunking = optimal', status: 'ok' },
  { principle: 'Fast feedback', signal: 'incremental responses = on', status: 'ok' },
  { principle: 'Continuous learning', signal: 'memory write = success', status: 'ok' },
  { principle: 'Build quality in', signal: 'pre-validation = passed', status: 'ok' },
  { principle: 'Limit work in progress', signal: 'scope size = contained', status: 'ok' },
  { principle: 'Automate safely', signal: 'policy gates = enforced', status: 'ok' },
  { principle: 'Make work visible', signal: 'reasoning surfaced = yes', status: 'ok' },
  { principle: 'Optimize for flow', signal: 'steps reduced = yes', status: 'ok' },
];

const DevOps8Panel: React.FC = () => {
  return (
    <div className="devops8-panel">
      <div className="devops8-header">
        <h2>DevOps 8</h2>
        <p>Operational Signals</p>
      </div>
      <div className="devops8-signals">
        {devOps8Signals.map(item => (
          <div key={item.principle} className={`devops8-signal-row status-${item.status}`}>
            <span className="devops8-principle">{item.principle}</span>
            <span className="devops8-signal">{item.signal}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevOps8Panel;
