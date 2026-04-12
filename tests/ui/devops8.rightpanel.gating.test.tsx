import { fireEvent, render, screen } from '@testing-library/react';
import { WorkspaceSidebarRight } from '../../components/WorkspaceSidebarRight';
import { CockpitModeProvider } from '../../contexts/CockpitModeContext';
import { ToolbeltProvider } from '../../contexts/ToolbeltContext';
import { RepoConnectionProvider } from '../../contexts/RepoConnectionContext';
import { DevOps8RuntimeProvider } from '../../contexts/DevOps8RuntimeContext';

describe('DevOps8 Panel Permissions', () => {
  it('shows base tabs for customer', () => {
    render(
      <CockpitModeProvider initialMode="customer">
        <RepoConnectionProvider>
          <DevOps8RuntimeProvider>
            <ToolbeltProvider>
              <WorkspaceSidebarRight />
            </ToolbeltProvider>
          </DevOps8RuntimeProvider>
        </RepoConnectionProvider>
      </CockpitModeProvider>
    );
    expect(screen.getByTitle('Guide')).toBeInTheDocument();
  });

  it('shows admin tabs for admin', () => {
    render(
      <CockpitModeProvider initialMode="admin">
        <RepoConnectionProvider>
          <DevOps8RuntimeProvider>
            <ToolbeltProvider>
              <WorkspaceSidebarRight />
            </ToolbeltProvider>
          </DevOps8RuntimeProvider>
        </RepoConnectionProvider>
      </CockpitModeProvider>
    );
    expect(screen.getByTitle('Files')).toBeInTheDocument();
  });

  it('shows DevOps 8 content in the ops tab', () => {
    render(
      <CockpitModeProvider initialMode="admin">
        <RepoConnectionProvider>
          <DevOps8RuntimeProvider>
            <ToolbeltProvider>
              <WorkspaceSidebarRight />
            </ToolbeltProvider>
          </DevOps8RuntimeProvider>
        </RepoConnectionProvider>
      </CockpitModeProvider>
    );

    fireEvent.click(screen.getByTitle('Ops'));
    expect(screen.getByText('DevOps 8')).toBeInTheDocument();
  });
});
