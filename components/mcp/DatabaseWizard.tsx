// components/mcp/DatabaseWizard.tsx
import React from 'react';
import McpWizardModal from './McpWizardModal';

interface DatabaseWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const DatabaseWizard: React.FC<DatabaseWizardProps> = ({ isOpen, onClose }) => {
  return (
    <McpWizardModal isOpen={isOpen} onClose={onClose} title="Database Assistant Wizard">
      <div>
        <p>This is the Database Assistant Wizard.</p>
        {/* Future implementation for database operations */}
      </div>
    </McpWizardModal>
  );
};

export default DatabaseWizard;
