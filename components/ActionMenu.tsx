import React, { useRef, useState, useEffect } from "react";
import { useToolbelt } from '@/contexts/ToolbeltContext'; // Import useToolbelt
import type { ToolPermission } from '@/lib/toolbeltConfig'; // Import ToolbeltPermission
import { useCockpitMode } from "@/contexts/CockpitModeContext"; // Import useCockpitMode


interface ActionMenuProps {
  onUploadFile?: (files: FileList, dangerousAction?: boolean) => void;
  onSelectDeepReasoning?: () => void;
  onSelectNimsResearch?: () => void;
  onUploadImage?: () => void; // New prop for image upload
  onTakePhoto?: () => void; // New prop for take photo
  onImportFromGoogleDrive?: () => void; // New prop for Google Drive import
}


export const ActionMenu: React.FC<ActionMenuProps> = ({
  onUploadFile,
  onSelectDeepReasoning,
  onSelectNimsResearch,
  onUploadImage,
  onTakePhoto,
  onImportFromGoogleDrive,
}) => {
  const { effectiveRules } = useToolbelt(); // Consume from context
  const { mode: cockpitMode } = useCockpitMode(); // Get cockpitMode from context
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const fileWritePermission = effectiveRules.actions.fileWrite;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }


    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }


    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Render empty fragment in customer mode AFTER all hooks are called
  if (cockpitMode === "customer") {
    return <></>;
  }


  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && onUploadFile) {
      // Mark file upload as a dangerous action if permission is needs_confirm
      const dangerousAction = fileWritePermission === 'needs_confirm';
      onUploadFile(files, dangerousAction);
    }
    // Reset input so same file can be selected twice
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsOpen(false);
  };


  return (
    <div className="action-menu-root" ref={menuRef}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="action-menu-file-input"
        onChange={handleFileChange}
        multiple={false}
        style={{ display: "none" }}
      />


      {/* + button */}
      <button
        type="button"
        className="action-menu-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open BrewAssist action menu"
      >
        <span className="action-menu-trigger-icon">+</span>
      </button>


      {isOpen && (
        <div className="brew-action-menu">
          <div className="action-menu-popover">
            <ActionMenuItem
              kind="upload"
              label="Upload File" // Changed label to be more generic for file upload
              description="Upload a file for analysis or modification"
              onClick={handleUploadClick} // Use handleUploadClick for the file input
              permission={fileWritePermission} // Pass permission to the item
            />

            <ActionMenuItem
              kind="upload"
              label="Upload Image / Screenshot"
              description="Attach errors, logs, whiteboards"
              onClick={() => {
                onUploadImage && onUploadImage();
                setIsOpen(false);
              }}
              permission={fileWritePermission} // Pass permission to the item
            />

            <ActionMenuItem
              kind="camera"
              label="Take Photo"
              description="Capture whiteboard or console"
              onClick={() => {
                onTakePhoto && onTakePhoto();
                setIsOpen(false);
              }}
              permission={fileWritePermission} // Pass permission to the item
            />

            <ActionMenuItem
              kind="drive"
              label="Import from Drive"
              description="Pick a file from Google Drive"
              onClick={() => {
                onImportFromGoogleDrive && onImportFromGoogleDrive();
                setIsOpen(false);
              }}
              permission={fileWritePermission} // Pass permission to the item
            />

            <ActionMenuItem
              kind="hrm"
              label="Use HRM Deep Reasoning"
              description="Think deeply before answering"
              onClick={() => {
                onSelectDeepReasoning && onSelectDeepReasoning();
                setIsOpen(false);
              }}
              permission={'allowed'} // HRM is always allowed for deep reasoning
            />

            <ActionMenuItem
              kind="nims"
              label="Send to NIMs Research"
              description="Compare with web / external intel"
              onClick={() => {
                onSelectNimsResearch && onSelectNimsResearch();
                setIsOpen(false);
              }}
              permission={'allowed'} // NIMs research is always allowed
            />
          </div>
        </div>
      )}
    </div>
  );
};

// S4.9e: ActionMenuItem component for consistent styling
interface ActionMenuItemProps {
  kind: 'upload' | 'camera' | 'drive' | 'hrm' | 'nims'; // For icon styling
  label: string;
  description: string;
  onClick: () => void;
  permission: ToolPermission; // Corrected type
}

const ActionMenuItem: React.FC<ActionMenuItemProps> = ({ kind, label, description, onClick, permission }) => {
  const disabled = permission === 'blocked' || permission === 'admin_only';

  const tooltip =
    permission === 'blocked'
      ? 'Disabled in current Mode/Tier'
      : permission === 'admin_only'
      ? 'Admin-only in this configuration'
      : undefined;

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  // Placeholder for icon based on 'kind'
  const getIcon = (itemKind: string) => {
    switch (itemKind) {
      case 'upload': return '⬆️';
      case 'camera': return '📸';
      case 'drive': return '☁️';
      case 'hrm': return '🧠';
      case 'nims': return '🔬';
      default: return '✨';
    }
  };

  return (
    <button
      type="button"
      className={`action-menu-item action-menu-item--${permission}`}
      onClick={handleClick}
      disabled={disabled}
      title={tooltip}
    >
      <div className="action-menu-item-content">
        <div className="action-menu-item-label">{label}</div>
        <div className="action-menu-item-description">{description}</div>
      </div>
      <div className="action-menu-item-icon-wrapper">
        <span className="action-menu-item-icon">{getIcon(kind)}</span>
        {permission === 'needs_confirm' && <span className="mcp-badge">⚠</span>}
        {permission === 'admin_only' && <span className="mcp-badge">🔒</span>}
      </div>
    </button>
  );
};