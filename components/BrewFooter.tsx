// components/BrewFooter.tsx
import React from "react";

export const BrewFooter: React.FC = () => {
  return (
    <footer className="brew-footer">
      <div className="brew-footer-inner">
        <span>© {new Date().getFullYear()} Brewington Exec Group Inc.</span>
        <span className="brew-footer-separator">·</span>
        <span>BrewAssist DevOps Cockpit</span>
        <span className="brew-footer-separator">·</span>
        <a href="#" className="brew-footer-link">
          Terms
        </a>
        <span className="brew-footer-separator">·</span>
        <a href="#" className="brew-footer-link">
          Privacy
        </a>
      </div>
    </footer>
  );
};
