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

  it('renders action menu with buttons', () => {
    renderActionMenu();
    expect(screen.getByText('/task')).toBeInTheDocument();
    expect(screen.getByText('/doc')).toBeInTheDocument();
    expect(screen.getByText('/patch')).toBeInTheDocument();
  });

  it('renders buttons with correct disabled state based on policy', () => {
    renderActionMenu();
    // Assuming default mode is customer, /patch should be disabled
    const patchButton = screen.getByText('/patch');
    expect(patchButton).toBeDisabled();
  });

  it('shows tooltip for disabled actions', () => {
    renderActionMenu();
    const patchButton = screen.getByText('/patch');
    expect(patchButton).toHaveAttribute('title'); // Assumes tooltip is set
  });

  // Add more tests as policy logic is implemented
});

  it('disables /patch for customer persona', () => {
    renderActionMenu('customer', 1);
    const patchButton = screen.getByText('/patch');
    expect(patchButton).toBeDisabled();
    expect(patchButton).toHaveAttribute('title'); // Tooltip with reason
  });

  it('enables /doc for customer persona', () => {
    renderActionMenu('customer', 1);
    const docButton = screen.getByText('/doc');
    expect(docButton).not.toBeDisabled();
  });

  it('shows confirm badge for /patch in admin mode', () => {
    renderActionMenu('admin', 2);
    const patchButton = screen.getByText('/patch');
    expect(patchButton).not.toBeDisabled();
    // Assuming the component adds a badge class or text for requiresConfirm
    expect(patchButton).toHaveTextContent('Confirm'); // Or check for badge
  });

  it('does not fire click when disabled', () => {
    renderActionMenu('customer', 1);
    const patchButton = screen.getByText('/patch');
    const mockClick = jest.fn();
    patchButton.onclick = mockClick;
    fireEvent.click(patchButton);
    expect(mockClick).not.toHaveBeenCalled();
  });

  // Add more tests for other capabilities and conditions
});
