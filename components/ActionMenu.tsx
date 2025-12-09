import React, { useRef, useState, useEffect } from "react";

interface ActionMenuProps {
  onUploadFile?: (files: FileList) => void;
  onSelectDeepReasoning?: () => void;
  onSelectNimsResearch?: () => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  onUploadFile,
  onSelectDeepReasoning,
  onSelectNimsResearch,
}) => {
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
      onUploadFile(files);
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
        <div className="action-menu-popover">
          {/* Upload File */}
          <button
            type="button"
            className="action-menu-item"
            onClick={handleUploadClick}
          >
            <div className="action-menu-item-title">Upload file</div>
            <div className="action-menu-item-sub">
              Send code, logs, or docs to BrewAssist
            </div>
          </button>

          {/* HRM Deep Reasoning */}
          <button
            type="button"
            className="action-menu-item"
            onClick={() => {
              onSelectDeepReasoning && onSelectDeepReasoning();
              setIsOpen(false);
            }}
          >
            <div className="action-menu-item-title">HRM Deep Reasoning</div>
            <div className="action-menu-item-sub">
              Use deep reasoning model for this message
            </div>
          </button>

          {/* NIMs Research Mode */}
          <button
            type="button"
            className="action-menu-item"
            onClick={() => {
              onSelectNimsResearch && onSelectNimsResearch();
              setIsOpen(false);
            }}
          >
            <div className="action-menu-item-title">NIMs Research Mode</div>
            <div className="action-menu-item-sub">
              Route this request to NIMs researcher tier
            </div>
          </button>

          {/* Future items can go here: screenshot, Drive, etc. */}
          {/* <button className="action-menu-item">...</button> */}
        </div>
      )}
    </div>
  );
};
