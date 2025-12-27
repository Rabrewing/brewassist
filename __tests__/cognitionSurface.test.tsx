import React from 'react';
import { render, screen } from '@testing-library/react';
import { CognitionSurface } from '../components/CognitionSurface';

// Allowed Cognition States (copied from CognitionSurface.tsx for testing)
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

// DevOps 8 Principles (copied from CognitionSurface.tsx for testing)
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

describe('CognitionSurface', () => {
  // Test Case 1: Renders without crashing.
  it('renders without crashing', () => {
    render(<CognitionSurface />);
    expect(screen.getByText('Cognition States')).toBeInTheDocument();
    expect(screen.getByText('DevOps 8 Principles')).toBeInTheDocument();
  });

  // Test Case 2: Displays all cognition states.
  it('displays all cognition states', () => {
    render(<CognitionSurface />);
    ALLOWED_COGNITION_STATES.forEach((state) => {
      expect(screen.getByText(state)).toBeInTheDocument();
    });
  });

  // Test Case 3: Displays all DevOps principles.
  it('displays all DevOps principles', () => {
    render(<CognitionSurface />);
    DEVOPS_8_PRINCIPLES.forEach((principle) => {
      expect(screen.getByText(principle)).toBeInTheDocument();
    });
  });

  // Test Case 4: Highlights the current cognition state.
  it('highlights the current cognition state', () => {
    const highlightedState = 'Scope Validation';
    render(<CognitionSurface currentCognitionState={highlightedState} />);
    const stateElement = screen.getByText(highlightedState);
    expect(stateElement).toHaveClass('highlighted');
  });

  // Test Case 5: Highlights the specified DevOps principle.
  it('highlights the specified DevOps principle', () => {
    const highlightedPrinciple = 'Make work visible';
    render(<CognitionSurface highlightedPrinciple={highlightedPrinciple} />);
    const principleElement = screen.getByText(highlightedPrinciple);
    expect(principleElement).toHaveClass('highlighted');
  });

  // Test Case 6: Does not highlight unselected items.
  it('does not highlight unselected cognition states or principles', () => {
    const highlightedState = 'Risk Assessment';
    const highlightedPrinciple = 'Flow over batch';
    render(
      <CognitionSurface
        currentCognitionState={highlightedState}
        highlightedPrinciple={highlightedPrinciple}
      />
    );

    ALLOWED_COGNITION_STATES.filter((s) => s !== highlightedState).forEach((state) => {
      expect(screen.getByText(state)).not.toHaveClass('highlighted');
    });

    DEVOPS_8_PRINCIPLES.filter((p) => p !== highlightedPrinciple).forEach((principle) => {
      expect(screen.getByText(principle)).not.toHaveClass('highlighted');
    });
  });
});
