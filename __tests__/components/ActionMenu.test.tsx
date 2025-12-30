import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ActionMenu } from '../../components/ActionMenu';
import { ToolbeltProvider } from '../../contexts/ToolbeltContext';
import { CockpitModeProvider } from '../../contexts/CockpitModeContext';
import { evaluateHandshake } from '../../lib/toolbelt/handshake';
import { CAPABILITY_REGISTRY } from '../../lib/capabilities/registry';
import { Persona } from '../../lib/brewIdentityEngine';

// Mock evaluateHandshake to control policy outcomes
jest.mock('../../lib/toolbelt/handshake', () => ({
  ...jest.requireActual('../../lib/toolbelt/handshake'),
  evaluateHandshake: jest.fn(),
}));

// Mock getActivePersona
jest.mock('../../lib/brewIdentityEngine', () => ({
  ...jest.requireActual('../../lib/brewIdentityEngine'),
  getActivePersona: jest.fn(() => ({
    id: 'admin',
    label: 'Admin User',
    tone: 'Authoritative',
    emotionTier: 3,
    safetyMode: 'hard-stop',
    memoryWindow: 3,
    systemPrompt: 'Admin persona for testing',
  })),
}));

const mockEvaluateHandshake = evaluateHandshake as jest.Mock;

const renderActionMenu = () => {
  return render(
    <CockpitModeProvider>
      <ToolbeltProvider>
        <ActionMenu />
      </ToolbeltProvider>
    </CockpitModeProvider>
  );
};

describe('ActionMenu Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockEvaluateHandshake.mockClear();
    // Default mock implementation for evaluateHandshake to allow everything
    mockEvaluateHandshake.mockReturnValue({
      ok: true,
      route: 'brewassist',
      tier: 'pro',
      reason: 'Capability check passed.',
      requiresConfirm: false,
      requiresSandbox: false,
    });
  });

  // Test 1: Menu renders proper structure
  test('should render the correct DOM structure for the ActionMenu', async () => {
    renderActionMenu();

    // Open the menu
    fireEvent.click(screen.getByLabelText('Open BrewAssist action menu'));

    // Assert .brew-action-menu exists
    const actionMenu = screen.getByRole('list').closest('.brew-action-menu');
    expect(actionMenu).toBeInTheDocument();

    // Assert ul.brew-action-list exists
    const actionList = screen.getByRole('list', { name: /action menu items/i }); // Added accessible name
    expect(actionList).toBeInTheDocument();
    expect(actionList.tagName).toBe('UL');
    expect(actionList).toHaveClass('brew-action-list');

    // Assert at least 1 li.brew-action-item
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeGreaterThan(0);
    expect(listItems[0]).toHaveClass('brew-action-item');

    // Assert at least 1 button.brew-action-item-btn inside an li
    const buttons = screen.getAllByRole('button', { name: /upload file/i }); // Example button
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons[0]).toHaveClass('brew-action-item-btn');
    expect(buttons[0].closest('li')).toHaveClass('brew-action-item');
  });

  // Test 2: Disabled policy turns into disabled button + tooltip
  test('should disable an ActionMenuItem and show tooltip based on policy', async () => {
    const mockReason = 'TOOLBELT_TIER_TOO_LOW: Capability requires Pro Tier.';
    mockEvaluateHandshake.mockImplementation((args) => {
      if (args.capabilityId === '/hrm') {
        return {
          ok: false,
          route: 'blocked',
          tier: 'basic',
          reason: mockReason,
          requiresConfirm: false,
          requiresSandbox: false,
        };
      }
      return {
        ok: true,
        route: 'brewassist',
        tier: 'pro',
        reason: 'Capability check passed.',
        requiresConfirm: false,
        requiresSandbox: false,
      };
    });

    renderActionMenu();

    // Open the menu
    fireEvent.click(screen.getByLabelText('Open BrewAssist action menu'));

    // Find the disabled HRM item
    const hrmItem = screen.getByRole('button', { name: /use hrm deep reasoning/i });
    expect(hrmItem).toBeDisabled();
    expect(hrmItem).toHaveAttribute('title', mockReason);

    // Ensure other items are not disabled (e.g., Upload File)
    const uploadFileItem = screen.getByRole('button', { name: /upload file/i });
    expect(uploadFileItem).not.toBeDisabled();
  });

  // Test 3: Policy requiring confirmation shows '⚠' badge
  test('should show a warning badge for policies requiring confirmation', async () => {
    mockEvaluateHandshake.mockImplementation((args) => {
      if (args.capabilityId === 'fs_write' && args.label.includes('Upload File')) {
        return {
          ok: true,
          route: 'brewassist',
          tier: 'pro',
          reason: 'TOOLBELT_CONFIRM_REQUIRED: Capability requires confirmation.',
          requiresConfirm: true,
          requiresSandbox: false,
        };
      }
      return {
        ok: true,
        route: 'brewassist',
        tier: 'pro',
        reason: 'Capability check passed.',
        requiresConfirm: false,
        requiresSandbox: false,
      };
    });

    renderActionMenu();

    // Open the menu
    fireEvent.click(screen.getByLabelText('Open BrewAssist action menu'));

    // Find the Upload File item (which uses fs_write)
    const uploadFileItem = screen.getByRole('button', { name: /upload file/i });
    expect(uploadFileItem).toBeInTheDocument();

    // Check for the warning badge *within* the item
    const warningBadge = within(uploadFileItem).getByText('⚠');
    expect(warningBadge).toBeInTheDocument();
    expect(warningBadge).toHaveClass('mcp-badge');
  });

  // Test 4: Policy requiring sandbox shows 'sandbox' badge
  test('should show a sandbox badge for policies requiring sandbox', async () => {
    mockEvaluateHandshake.mockImplementation((args) => {
      if (args.capabilityId === 'fs_write' && args.label.includes('Upload Image')) {
        return {
          ok: true,
          route: 'brewassist',
          tier: 'pro',
          reason: 'TOOLBELT_SANDBOX_ONLY: Capability requires sandbox environment.',
          requiresConfirm: false,
          requiresSandbox: true,
        };
      }
      return {
        ok: true,
        route: 'brewassist',
        tier: 'pro',
        reason: 'Capability check passed.',
        requiresConfirm: false,
        requiresSandbox: false,
      };
    });

    renderActionMenu();

    // Open the menu
    fireEvent.click(screen.getByLabelText('Open BrewAssist action menu'));

    // Find the Upload Image item
    const uploadImageItem = screen.getByRole('button', { name: /upload image/i });
    expect(uploadImageItem).toBeInTheDocument();

    // Check for the sandbox badge *within* the item
    const sandboxBadge = within(uploadImageItem).getByText(/sandbox/i);
    expect(sandboxBadge).toBeInTheDocument();
    expect(sandboxBadge).toHaveClass('mcp-badge');
  });
});
