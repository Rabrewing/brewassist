import { render, screen } from '@testing-library/react';
import { ActionMenu } from '../../components/ActionMenu';
import { ToolbeltProvider } from '../../contexts/ToolbeltContext';
import { CockpitModeProvider } from '../../contexts/CockpitModeContext';

describe('ActionMenu UI Gating', () => {
  const renderActionMenu = () => {
    render(
      <CockpitModeProvider>
        <ToolbeltProvider>
          <ActionMenu />
        </ToolbeltProvider>
      </CockpitModeProvider>
    );
  };

  it('renders action menu trigger', () => {
    renderActionMenu();
    expect(
      screen.getByRole('button', { name: 'Open BrewAssist action menu' })
    ).toBeInTheDocument();
  });

  // Add more tests as policy logic is implemented
});
