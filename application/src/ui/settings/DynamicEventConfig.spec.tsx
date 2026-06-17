import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockElectronAPI = {
  getDynamicEvents: jest.fn(() => Promise.resolve({
    dynamicEvents: [
      { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: true, respawn: true } },
    ],
  })),
  setDynamicEvents: jest.fn(() => Promise.resolve({ success: true })),
};

(window as any).electronAPI = mockElectronAPI;

import { DynamicEventConfig } from './DynamicEventConfig';

describe('DynamicEventConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.getDynamicEvents.mockResolvedValue({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: true, respawn: true } },
      ],
    });
  });

  it('renders roshan entry with toggle', async () => {
    render(<DynamicEventConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('dynamic-toggle-roshan')).toBeInTheDocument();
      expect(screen.getByText('Roshan')).toBeInTheDocument();
    });
  });

  it('master toggle disables and hides sub-toggles', async () => {
    render(<DynamicEventConfig />);
    await waitFor(() => expect(screen.getByTestId('dynamic-toggle-roshan')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('dynamic-toggle-roshan'));

    expect(mockElectronAPI.setDynamicEvents).toHaveBeenCalledWith({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: false, notifications: { kill: true, countdown: true, respawn: true } },
      ],
    });
    expect(screen.queryByTestId('dynamic-notif-roshan-kill')).not.toBeInTheDocument();
  });

  it('individual notification toggle saves correct config', async () => {
    render(<DynamicEventConfig />);
    await waitFor(() => expect(screen.getByTestId('dynamic-notif-roshan-countdown')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('dynamic-notif-roshan-countdown'));

    expect(mockElectronAPI.setDynamicEvents).toHaveBeenCalledWith({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: false, respawn: true } },
      ],
    });
  });

  it('loads saved state on mount', async () => {
    mockElectronAPI.getDynamicEvents.mockResolvedValue({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: false, notifications: { kill: false, countdown: true, respawn: true } },
      ],
    });

    render(<DynamicEventConfig />);
    await waitFor(() => expect(screen.getByTestId('dynamic-toggle-roshan')).toBeInTheDocument());

    expect(screen.getByTestId('dynamic-toggle-roshan')).toHaveTextContent('Off');
    expect(screen.queryByTestId('dynamic-notif-roshan-kill')).not.toBeInTheDocument();
  });
});
