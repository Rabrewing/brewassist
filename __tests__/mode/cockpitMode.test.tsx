import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { CockpitModeProvider, useCockpitMode } from '@/contexts/CockpitModeContext';
import { WorkspaceSidebarLeft } from '@/components/WorkspaceSidebarLeft';
import { SandboxPanel } from '@/components/SandboxPanel';
import { ToolbeltProvider, useToolbelt } from '@/contexts/ToolbeltContext';
import React from 'react';

const TestComponent = () => {
  const { mode, updateMode } = useCockpitMode();
  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <button onClick={() => updateMode('customer')}>Set Customer</button>
      <button onClick={() => updateMode('admin')}>Set Admin</button>
    </div>
  );
};

describe('CockpitModeContext', () => {
  it('default mode = admin', () => {
    render(
      <CockpitModeProvider>
        <TestComponent />
      </CockpitModeProvider>
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('admin');
  });

  it('persists mode in localStorage', () => {
    render(
      <CockpitModeProvider>
        <TestComponent />
      </CockpitModeProvider>
    );

    fireEvent.click(screen.getByText('Set Customer'));
    expect(localStorage.getItem('cockpitMode')).toBe('customer');

    fireEvent.click(screen.getByText('Set Admin'));
    expect(localStorage.getItem('cockpitMode')).toBe('admin');
  });
});

describe('CockpitMode UI Hiding', () => {
    it('MCP tools are visible but blocked in customer mode', () => {
        localStorage.setItem('cockpitMode', 'customer');
        
        const { getByText, getByTitle } = render(
            <CockpitModeProvider>
              <ToolbeltProvider>
                <WorkspaceSidebarLeft />
              </ToolbeltProvider>
            </CockpitModeProvider>
          );
    
        // Assert that the sidebar itself is rendered
        expect(screen.getByText('MCP')).toBeInTheDocument();
        expect(screen.getByText('Tools')).toBeInTheDocument();

        // Assert that specific MCP buttons are present and allowed/blocked
        const fileAssistantButton = getByText('File Assistant').closest('button');
        expect(fileAssistantButton).toBeInTheDocument();
        expect(fileAssistantButton).toHaveClass('mcp-allowed');
        expect(fileAssistantButton).not.toBeDisabled();
        expect(fileAssistantButton).toHaveAttribute('title', 'Capability check passed.');

        const suggestEditsButton = getByText('Suggest Edits').closest('button');
        expect(suggestEditsButton).toBeInTheDocument();
        expect(suggestEditsButton).toHaveClass('mcp-blocked');
        expect(suggestEditsButton).toBeDisabled();
        expect(getByTitle("TOOLBELT_TIER_TOO_LOW: Capability '/patch' requires Tier 2.")).toBeInTheDocument();
      });
    
      it('sandbox hidden in customer mode', () => {
        localStorage.setItem('cockpitMode', 'customer');
    
        const { container } = render(
            <CockpitModeProvider>
                <SandboxPanel />
            </CockpitModeProvider>
        );
    
        expect(container.firstChild).toBeNull();
      });
});

describe('Tier 3 actions blocked in customer mode', () => {
    it('Tier 3 actions are blocked in customer mode', () => {
        localStorage.setItem('cockpitMode', 'customer');

        const { getByText, getByTitle } = render(
            <CockpitModeProvider>
                <ToolbeltProvider initialTier="rb"> {/* Use initialTier prop */}
                    <WorkspaceSidebarLeft />
                </ToolbeltProvider>
            </CockpitModeProvider>
        );

        // Assert that the "Suggest Edits" button is present and blocked/disabled
        const suggestEditsButton = getByText('Suggest Edits').closest('button');
        expect(suggestEditsButton).toBeInTheDocument();
        expect(suggestEditsButton).toHaveClass('mcp-blocked');
        expect(suggestEditsButton).toBeDisabled();
        expect(getByTitle("TOOLBELT_SANDBOX_ONLY: Capability '/patch' requires sandbox environment.")).toBeInTheDocument();
    });
});
