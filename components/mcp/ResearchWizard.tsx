// components/mcp/ResearchWizard.tsx
import React from 'react';
import McpWizardModal from './McpWizardModal';

interface ResearchWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResearchWizard: React.FC<ResearchWizardProps> = ({ isOpen, onClose }) => {
  return (
    <McpWizardModal isOpen={isOpen} onClose={onClose} title="Research & Validation Wizard">
      <div>
        <p>This is the Research & Validation Wizard.</p>
        {/* Future implementation for NIMs web research, BrewTruth comparison, etc. */}
      </div>
    </McpWizardModal>
  );
};

export default ResearchWizard;
