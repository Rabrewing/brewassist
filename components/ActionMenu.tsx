import React, { useRef, useState, useEffect } from "react";
import { useToolbelt } from '@/contexts/ToolbeltContext'; // Import useToolbelt
import { useCockpitMode } from "@/contexts/CockpitModeContext"; // Import useCockpitMode
import { UnifiedPolicyEnvelope, evaluateHandshake } from '@/lib/toolbelt/handshake'; // Import UnifiedPolicyEnvelope and evaluateHandshake
import { BrewTier } from '@/lib/commands/types'; // Import BrewTier
import { Persona, getActivePersona } from '@/lib/brewIdentityEngine'; // Import Persona and getActivePersona
import { CAPABILITY_REGISTRY } from '@/lib/capabilities/registry'; // Import CAPABILITY_REGISTRY


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
  const { mode: cockpitMode } = useCockpitMode(); // Get cockpitMode from context
  const { tier } = useToolbelt(); // Consume from context
  const persona = getActivePersona(); // Get persona from getActivePersona()
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

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


  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && onUploadFile) {
      const fileWritePolicy = evaluateHandshake({
        intent: CAPABILITY_REGISTRY["fs_write"].intentCategory,
        tier,
        persona,
        cockpitMode,
        capabilityId: "fs_write",
        action: "W",
      });
      // Mark file upload as a dangerous action if policy requires confirmation
      const dangerousAction = fileWritePolicy.requiresConfirm;
      onUploadFile(files, dangerousAction);
    }
    // Reset input so same file can be selected twice
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsOpen(false);
  };


  return (
    <div className="brew-action-anchor" ref={menuRef}>
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
        className="brew-action-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open BrewAssist action menu"
      >
        <span className="brew-action-btn-icon">+</span>
      </button>


      {isOpen && (
        <div className="brew-action-menu">
          <ul className="brew-action-list" aria-label="action menu items">
            <ActionMenuItem
                kind="upload"
                label="Upload File" // Changed label to be more generic for file upload
                description="Upload a file for analysis or modification"
                onClick={handleUploadClick} // Use handleUploadClick for the file input
                policy={evaluateHandshake({
                  intent: CAPABILITY_REGISTRY["fs_write"].intentCategory,
                  tier,
                  persona,
                  cockpitMode,
                  capabilityId: "fs_write",
                  action: "W",
                  label: "Upload File",
                })} // Pass policy to the item
              />

              <ActionMenuItem
                kind="upload"
                label="Upload Image / Screenshot"
                description="Attach errors, logs, whiteboards"
                onClick={() => {
                  onUploadImage && onUploadImage();
                  setIsOpen(false);
                }}
                policy={evaluateHandshake({
                  intent: CAPABILITY_REGISTRY["fs_write"].intentCategory,
                  tier,
                  persona,
                  cockpitMode,
                  capabilityId: "fs_write",
                  action: "W",
                  label: "Upload Image / Screenshot",
                })} // Pass policy to the item
              />

              <ActionMenuItem
                kind="camera"
                label="Take Photo"
                description="Capture whiteboard or console"
                onClick={() => {
                  onTakePhoto && onTakePhoto();
                  setIsOpen(false);
                }}
                policy={evaluateHandshake({
                  intent: CAPABILITY_REGISTRY["fs_write"].intentCategory,
                  tier,
                  persona,
                  cockpitMode,
                  capabilityId: "fs_write",
                  action: "W",
                  label: "Take Photo",
                })} // Pass policy to the item
              />

              <ActionMenuItem
                kind="drive"
                label="Import from Drive"
                description="Pick a file from Google Drive"
                onClick={() => {
                  onImportFromGoogleDrive && onImportFromGoogleDrive();
                  setIsOpen(false);
                }}
                policy={evaluateHandshake({
                  intent: CAPABILITY_REGISTRY["fs_write"].intentCategory,
                  tier,
                  persona,
                  cockpitMode,
                  capabilityId: "fs_write",
                  action: "W",
                  label: "Import from Drive",
                })} // Pass policy to the item
              />

              <ActionMenuItem
                kind="hrm"
                label="Use HRM Deep Reasoning"
                description="Think deeply before answering"
                onClick={() => {
                  onSelectDeepReasoning && onSelectDeepReasoning();
                  setIsOpen(false);
                }}
                policy={evaluateHandshake({
                  intent: CAPABILITY_REGISTRY["/hrm"].intentCategory,
                  tier,
                  persona,
                  cockpitMode,
                  capabilityId: "/hrm",
                  action: "R", // Assuming HRM is a read-only operation
                  label: "Use HRM Deep Reasoning",
                })}
              />

              <ActionMenuItem
                kind="nims"
                label="Send to NIMs Research"
                description="Compare with web / external intel"
                onClick={() => {
                  onSelectNimsResearch && onSelectNimsResearch();
                  setIsOpen(false);
                }}
                policy={evaluateHandshake({
                  intent: CAPABILITY_REGISTRY["research_web"].intentCategory,
                  tier,
                  persona,
                  cockpitMode,
                  capabilityId: "research_web",
                  action: "R", // Assuming NIMs is a read-only operation
                  label: "Send to NIMs Research",
                })}
              />
          </ul>
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
  policy: UnifiedPolicyEnvelope; // Use UnifiedPolicyEnvelope
}

const ActionMenuItem: React.FC<ActionMenuItemProps> = ({ kind, label, description, onClick, policy }) => {
  const disabled = !policy.ok;

  const tooltip = policy.reason;

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
    <li className="brew-action-item">
      <button
        type="button"
        className="brew-action-item-btn"
        onClick={handleClick}
        disabled={disabled}
        title={tooltip}
      >
        <div className="brew-action-icon">
          <span className="action-menu-item-icon">{getIcon(kind)}</span>
          {policy.requiresConfirm && <span className="mcp-badge">⚠</span>}
          {policy.requiresSandbox && <span className="mcp-badge"> sandbox </span>}
        </div>
        <div className="brew-action-text">
          <div className="brew-action-title">{label}</div>
          <div className="brew-action-subtitle">{description}</div>
        </div>
      </button>
    </li>
  );
};