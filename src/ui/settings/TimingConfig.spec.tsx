import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('src/tts/soundPlayer', () => ({
  playSound: jest.fn(),
}));

const mockElectronAPI = {
  getEvents: jest.fn(() => Promise.resolve({ events: [] })),
  reloadEvents: jest.fn(() => Promise.resolve({ events: [] })),
  saveEvents: jest.fn(() => Promise.resolve({ success: true })),
  getSoundAssignments: jest.fn(() => Promise.resolve({})),
  getSoundDisabled: jest.fn(() => Promise.resolve({})),
  setSoundDisabled: jest.fn(() => Promise.resolve()),
  getOverlayPosition: jest.fn(() => Promise.resolve('right-center')),
  setOverlayPosition: jest.fn(() => Promise.resolve('right-center')),
  getOverlayFontSize: jest.fn(() => Promise.resolve({ name: 16, offset: 13 })),
  setOverlayFontSize: jest.fn(() => Promise.resolve({ name: 16, offset: 13 })),
  getOverlayMode: jest.fn(() => Promise.resolve('notification')),
  setOverlayMode: jest.fn(() => Promise.resolve('persistent')),
  getOverlayEventCount: jest.fn(() => Promise.resolve(5)),
  setOverlayEventCount: jest.fn(() => Promise.resolve(3)),
  openSoundFileDialog: jest.fn(() => Promise.resolve({ success: false, canceled: true })),
  assignSound: jest.fn(() => Promise.resolve({ success: true })),
  removeSound: jest.fn(() => Promise.resolve({ success: true })),
  getSoundFilePath: jest.fn(() => Promise.resolve(null)),
};

(window as any).electronAPI = mockElectronAPI;

import { TimingConfig } from './TimingConfig';

describe('TimingConfig — Overlay Mode & Event Count', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders mode radio buttons', async () => {
    render(<TimingConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('mode-notification')).toBeInTheDocument();
      expect(screen.getByTestId('mode-persistent')).toBeInTheDocument();
    });
  });

  it('loads initial mode from IPC', async () => {
    mockElectronAPI.getOverlayMode.mockResolvedValue('persistent');
    render(<TimingConfig />);
    await waitFor(() => {
      expect(mockElectronAPI.getOverlayMode).toHaveBeenCalled();
    });
  });

  it('calls setOverlayMode on mode change', async () => {
    render(<TimingConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('mode-persistent')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('mode-persistent'));
    expect(mockElectronAPI.setOverlayMode).toHaveBeenCalledWith('persistent');
  });

  it('renders event count control', async () => {
    render(<TimingConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('event-count')).toBeInTheDocument();
    });
  });

  it('calls setOverlayEventCount on change', async () => {
    mockElectronAPI.getOverlayMode.mockResolvedValue('persistent');
    render(<TimingConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('event-count')).not.toBeDisabled();
    });
    fireEvent.change(screen.getByTestId('event-count'), { target: { value: '3' } });
    expect(mockElectronAPI.setOverlayEventCount).toHaveBeenCalledWith(3);
  });

  it('event count disabled in notification mode', async () => {
    mockElectronAPI.getOverlayMode.mockResolvedValue('notification');
    render(<TimingConfig />);
    await waitFor(() => {
      expect(screen.getByTestId('event-count')).toBeDisabled();
    });
  });
});
