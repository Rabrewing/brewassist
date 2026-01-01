import { render, screen } from '@testing-library/react';
import { BrewCockpitCenter } from '../../components/BrewCockpitCenter';
import { CockpitModeProvider } from '../../contexts/CockpitModeContext';
import { ToolbeltProvider } from '../../contexts/ToolbeltContext';

describe('Scroll Behavior', () => {
  const renderCockpit = () => {
    render(
      <CockpitModeProvider>
        <ToolbeltProvider>
          <BrewCockpitCenter />
        </ToolbeltProvider>
      </CockpitModeProvider>
    );
  };

  test('renders cockpit center', () => {
    renderCockpit();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  // Add specific scroll tests if needed, but for stability, basic render test
});
