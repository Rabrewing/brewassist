// components/CognitionSurface.tsx
import React from 'react';

// Allowed Cognition States
const ALLOWED_COGNITION_STATES = [
  'Identity Check',
  'Context Awareness',
  'Scope Validation',
  'Risk Assessment',
  'Capability Matching',
  'Policy Enforcement',
  'Execution Planning',
  'Result Evaluation',
];

// DevOps 8 Principles
const DEVOPS_8_PRINCIPLES = [
  'Flow over batch',
  'Fast feedback',
  'Continuous learning',
  'Build quality in',
  'Limit work in progress',
  'Automate everything safe',
  'Make work visible',
  'Systems thinking',
];

interface CognitionSurfaceProps {
  currentCognitionState?: string;
  highlightedPrinciple?: string;
}

export const CognitionSurface: React.FC<CognitionSurfaceProps> = ({
  currentCognitionState,
  highlightedPrinciple,
}) => {
  return (
    <div className="cognition-surface-container">
      <div className="cognition-states-section">
        <h3>Cognition States</h3>
        <ul>
          {ALLOWED_COGNITION_STATES.map((state) => (
            <li key={state} className={currentCognitionState === state ? 'highlighted' : ''}>
              {state}
            </li>
          ))}
        </ul>
      </div>

      <div className="devops-principles-section">
        <h3>DevOps 8 Principles</h3>
        <ul>
          {DEVOPS_8_PRINCIPLES.map((principle) => (
            <li key={principle} className={highlightedPrinciple === principle ? 'highlighted' : ''}>
              {principle}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
