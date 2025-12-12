// components/mcp/GitWizard.tsx
import React from 'react';
import McpWizardModal from './McpWizardModal';

interface GitWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const GitWizard: React.FC<GitWizardProps> = ({ isOpen, onClose }) => {
  return (
    <McpWizardModal isOpen={isOpen} onClose={onClose} title="Git Command Center Wizard">
      <div>
        <p>This is the Git Command Center Wizard.</p>
        {/* Future implementation for git operations */}
      </div>
    </McpWizardModal>
  );
};

export default GitWizard;
