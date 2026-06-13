import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockElectronAPI = {
  getEvents: jest.fn(() => Promise.resolve({ events: [] })),
  reloadEvents: jest.fn(() => Promise.resolve({ events: [] })),
  saveEvents: jest.fn(() => Promise.resolve({ success: true })),
  getNotificationConfig: jest.fn(() => Promise.resolve({ enabled: true, position: 'right', fontSize: { name: 16, offset: 13 } })),
  setNotificationConfig: jest.fn((c: unknown) => Promise.resolve(c)),
  getPersistentConfig: jest.fn(() => Promise.resolve({ enabled: false, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5 })),
  setPersistentConfig: jest.fn((c: unknown) => Promise.resolve(c)),
};

(window as any).electronAPI = mockElectronAPI;

import { TimingConfig } from './TimingConfig';

describe('TimingConfig — Per-Overlay Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification and persistent overlay sections', async () => {
    render(<TimingConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('notif-enabled')).toBeInTheDocument();
      expect(screen.getByTestId('persist-enabled')).toBeInTheDocument();
    });
  });

  it('toggles notification enabled calls setNotificationConfig', async () => {
    render(<TimingConfig />);
    await waitFor(() => expect(screen.getByTestId('notif-enabled')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('notif-enabled'));
    expect(mockElectronAPI.setNotificationConfig).toHaveBeenCalledWith({ enabled: false });
  });

  it('toggles persistent enabled calls setPersistentConfig', async () => {
    render(<TimingConfig />);
    await waitFor(() => expect(screen.getByTestId('persist-enabled')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('persist-enabled'));
    expect(mockElectronAPI.setPersistentConfig).toHaveBeenCalledWith({ enabled: true });
  });

  it('changes notification position calls setNotificationConfig', async () => {
    render(<TimingConfig />);
    await waitFor(() => expect(screen.getByTestId('notif-pos-left')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('notif-pos-left'));
    expect(mockElectronAPI.setNotificationConfig).toHaveBeenCalledWith({ position: 'left' });
  });

  it('renders event count control for persistent', async () => {
    render(<TimingConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('event-count')).toBeInTheDocument();
    });
  });

  it('calls setPersistentConfig on event count change', async () => {
    render(<TimingConfig />);
    await waitFor(() => expect(screen.getByTestId('event-count')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('event-count'), { target: { value: '3' } });
    expect(mockElectronAPI.setPersistentConfig).toHaveBeenCalledWith({ eventCount: 3 });
  });
});
