import { render, screen } from '@testing-library/react';
import { WorkspaceSidebarRight } from '../../components/WorkspaceSidebarRight';
import { CockpitModeProvider } from '../../contexts/CockpitModeContext';
import { ToolbeltProvider } from '../../contexts/ToolbeltContext';

describe('DevOps8 Panel Permissions', () => {
  it('shows base tabs for customer', () => {
    render(
      <CockpitModeProvider initialMode="customer">
        <ToolbeltProvider>
          <WorkspaceSidebarRight />
        </ToolbeltProvider>
      </CockpitModeProvider>
    );
    expect(screen.getByTitle('Guide')).toBeInTheDocument();
  });

  it('shows admin tabs for admin', () => {
    render(
      <CockpitModeProvider initialMode="admin">
        <ToolbeltProvider>
          <WorkspaceSidebarRight />
        </ToolbeltProvider>
      </CockpitModeProvider>
    );
    expect(screen.getByTitle('Files')).toBeInTheDocument();
  });
});
