import { render, screen } from '@testing-library/react';
import { WorkspaceSidebarRight } from '../../components/WorkspaceSidebarRight';
import { CockpitModeProvider } from '../../contexts/CockpitModeContext';
import { ToolbeltProvider } from '../../contexts/ToolbeltContext';

describe('Right Panel Tabs Visibility', () => {
  const renderRightPanel = (mode: 'admin' | 'customer' = 'customer') => {
    render(
      <CockpitModeProvider initialMode={mode}>
        <ToolbeltProvider>
          <WorkspaceSidebarRight />
        </ToolbeltProvider>
      </CockpitModeProvider>
    );
  };

  test('customer sees only non-admin tabs', () => {
    renderRightPanel('customer');
    expect(screen.getByTitle('Guide')).toBeInTheDocument();
    expect(screen.getByTitle('Docs')).toBeInTheDocument();
    expect(screen.getByTitle('Help')).toBeInTheDocument();
    expect(screen.getByTitle('History')).toBeInTheDocument();

    expect(screen.queryByTitle('Files')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Sandbox')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Cognition')).not.toBeInTheDocument();
  });

  test('admin sees all tabs', () => {
    renderRightPanel('admin');
    expect(screen.getByTitle('Guide')).toBeInTheDocument();
    expect(screen.getByTitle('Docs')).toBeInTheDocument();
    expect(screen.getByTitle('Help')).toBeInTheDocument();
    expect(screen.getByTitle('History')).toBeInTheDocument();
    expect(screen.getByTitle('Files')).toBeInTheDocument();
    expect(screen.getByTitle('Sandbox')).toBeInTheDocument();
    expect(screen.getByTitle('Cognition')).toBeInTheDocument();
  });
});
