import { render, screen } from '@testing-library/react';
import { WorkspaceSidebarRight } from '../../components/WorkspaceSidebarRight';
import { CockpitModeProvider } from '../../contexts/CockpitModeContext';
import { ToolbeltProvider } from '../../contexts/ToolbeltContext';

describe('Right Panel Tabs Visibility', () => {
  const renderRightPanel = (mode: 'admin' | 'customer' = 'customer') => {
    render(
      <CockpitModeProvider>
        <ToolbeltProvider>
          <WorkspaceSidebarRight />
        </ToolbeltProvider>
      </CockpitModeProvider>
    );
  };

  test('customer sees only non-admin tabs', () => {
    renderRightPanel('customer');
    expect(screen.getByText('Guide')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();

    expect(screen.queryByText('Files')).not.toBeInTheDocument();
    expect(screen.queryByText('Sandbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Cognition')).not.toBeInTheDocument();
  });

  test('admin sees all tabs', () => {
    renderRightPanel('admin');
    expect(screen.getByText('Guide')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Files')).toBeInTheDocument();
    expect(screen.getByText('Sandbox')).toBeInTheDocument();
    expect(screen.getByText('Cognition')).toBeInTheDocument();
  });
});
