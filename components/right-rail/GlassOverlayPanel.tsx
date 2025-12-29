import React, { useEffect, useRef } from 'react';

interface GlassOverlayPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const GlassOverlayPanel: React.FC<GlassOverlayPanelProps> = ({ isOpen, onClose, children, title }) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="glass-overlay-backdrop">
      <div ref={panelRef} className="glass-overlay-panel">
        {title && <div className="glass-overlay-header">{title}</div>}
        <div className="glass-overlay-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlassOverlayPanel;
