// components/mcp/FileWizard.tsx
import React from 'react';
import McpWizardModal from './McpWizardModal';

interface FileWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const FileWizard: React.FC<FileWizardProps> = ({ isOpen, onClose }) => {
  return (
    <McpWizardModal isOpen={isOpen} onClose={onClose} title="File Operations Wizard">
      <div>
        <p>This is the File Operations Wizard.</p>
        {/* Future implementation for file creation, deletion, renaming, etc. */}
      </div>
    </McpWizardModal>
  );
};

export default FileWizard;
