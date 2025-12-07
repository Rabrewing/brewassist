// components/CockpitFooter.tsx
import React from "react";

export const CockpitFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="cockpit-footer">
      <span className="cockpit-footer-left">
        © {year} Brewington Exec Group Inc. · BrewAssist DevOps Cockpit
      </span>
      <nav className="cockpit-footer-links" aria-label="Footer navigation">
        <a href="#" className="cockpit-footer-link">
          Privacy
        </a>
        <a href="#" className="cockpit-footer-link">
          Terms
        </a>
        <a href="#" className="cockpit-footer-link">
          Trust Center
        </a>
      </nav>
    </footer>
  );
};
