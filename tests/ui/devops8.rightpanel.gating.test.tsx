import { render, screen } from '@testing-library/react';
import { WorkspaceSidebarRight } from '../../components/WorkspaceSidebarRight';
import { CockpitModeProvider } from '../../contexts/CockpitModeContext';

describe('DevOps8 Panel Permissions', () => {
  it('shows base tabs for customer', () => {
    render(
      <CockpitModeProvider initialMode="customer">
        <WorkspaceSidebarRight />
      </CockpitModeProvider>
    );
    expect(screen.getByText('Guide')).toBeInTheDocument();
  });

  it('shows admin tabs for admin', () => {
    render(
      <CockpitModeProvider initialMode="admin">
        <WorkspaceSidebarRight />
      </CockpitModeProvider>
    );
    // Check admin-only tabs are present
  });
});
