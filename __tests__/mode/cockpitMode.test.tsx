import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
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
    it('MCP tools hidden in customer mode', () => {
        localStorage.setItem('cockpitMode', 'customer');
        
        const { container } = render(
            <CockpitModeProvider>
              <ToolbeltProvider>
                <WorkspaceSidebarLeft />
              </ToolbeltProvider>
            </CockpitModeProvider>
          );
    
        expect(container.firstChild).toBeNull();
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
    it('Tier 3 actions blocked in customer mode', () => {
        localStorage.setItem('cockpitMode', 'customer');
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <CockpitModeProvider>
                <ToolbeltProvider>{children}</ToolbeltProvider>
            </CockpitModeProvider>
        );

        const { result } = renderHook(() => useToolbelt(), { wrapper });

        act(() => {
            result.current.setTier('T3_POWER');
        });

        expect(result.current.tier).toBe('T2_GUIDED');
    });
});
