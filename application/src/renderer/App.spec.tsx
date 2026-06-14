import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('src/scheduler/eventScheduler', () => ({
  loadSchedule: jest.fn(),
  onAnnouncement: jest.fn(),
  tick: jest.fn(),
  getUpcoming: jest.fn(() => []),
  getUpcomingOccurrences: jest.fn(() => []),
  resetScheduler: jest.fn(),
}));

jest.mock('src/tracker/gameStatusTracker', () => ({
  updateFromGsi: jest.fn(),
  clearAll: jest.fn(),
  getStatus: jest.fn(() => ({ daytime: true, roshan: { state: 'alive', endSeconds: 0 } })),
  _resetForTesting: jest.fn(),
}));

jest.mock('src/tts/announcer', () => ({
  speak: jest.fn(),
  formatMessage: jest.fn((name: string, offset: number) => `${name} in ${offset} seconds`),
  setIncludeTimeSuffix: jest.fn(),
  setVolume: jest.fn(),
  setMuted: jest.fn(),
  setRate: jest.fn(),
  setVoice: jest.fn(),
  getAvailableVoices: jest.fn(() => []),
}));


const mockElectronAPI = {
  getState: jest.fn(() => Promise.resolve('idle')),
  getElapsed: jest.fn(() => Promise.resolve(0)),
  onStateChange: jest.fn(() => () => {}),
  onClockTick: jest.fn(() => () => {}),
  toggleMute: jest.fn(() => Promise.resolve(true)),
  setMuted: jest.fn(() => Promise.resolve()),
  isMuted: jest.fn(() => Promise.resolve(false)),
  setVolume: jest.fn(() => Promise.resolve()),
  getVolume: jest.fn(() => Promise.resolve(100)),
  getRate: jest.fn(() => Promise.resolve(1.0)),
  setRate: jest.fn((v: number) => Promise.resolve(v)),
  getVoiceUri: jest.fn(() => Promise.resolve('')),
  setVoiceUri: jest.fn((v: string) => Promise.resolve(v)),
  getEvents: jest.fn(() => Promise.resolve({ events: [] })),
  reloadEvents: jest.fn(() => Promise.resolve({ events: [] })),
  isPaused: jest.fn(() => Promise.resolve(false)),
  onPauseChange: jest.fn(() => () => {}),
  getIncludeTimeSuffix: jest.fn(() => Promise.resolve(true)),
  setIncludeTimeSuffix: jest.fn((v: boolean) => Promise.resolve(v)),
  gsiInstall: jest.fn(() => Promise.resolve({ success: true, path: '/test' })),
  gsiUninstall: jest.fn(() => Promise.resolve({ success: true })),
  gsiIsInstalled: jest.fn(() => Promise.resolve(false)),
  gsiIsConnected: jest.fn(() => Promise.resolve(false)),
  gsiGetInstallPath: jest.fn(() => Promise.resolve(null)),
  onGsiStatusUpdate: jest.fn(() => () => {}),
  sendOverlayNotification: jest.fn(),
  sendOverlayUpcoming: jest.fn(),
  onEventsChanged: jest.fn(() => () => {}),
  getNotificationConfig: jest.fn(() => Promise.resolve({ enabled: true, position: 'right', fontSize: { name: 16, offset: 13 } })),
  setNotificationConfig: jest.fn((c: unknown) => Promise.resolve(c)),
  getPersistentConfig: jest.fn(() => Promise.resolve({ enabled: false, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5 })),
  setPersistentConfig: jest.fn((c: unknown) => Promise.resolve(c)),
  onOverlayConfigChanged: jest.fn(() => () => {}),
};

(window as any).electronAPI = mockElectronAPI;

import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('mounts without crash', async () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('renders heading text', async () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /dota 2 announcer/i })).toBeInTheDocument();
  });

  it('renders MainDock section', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('status-line')).toBeInTheDocument();
      expect(screen.getByTestId('game-clock')).toBeInTheDocument();
    });
  });

  it('renders UpcomingEvents section', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('upcoming-events-empty')).toBeInTheDocument();
    });
  });

  it('renders help button', async () => {
    render(<App />);
    expect(screen.getByTestId('help-button')).toBeInTheDocument();
  });

  it('clicking help button shows GuideModal', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('help-button'));
    expect(screen.getByTestId('guide-modal')).toBeInTheDocument();
  });

  it('closing guide modal hides it', async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('help-button'));
    expect(screen.getByTestId('guide-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('guide-close'));
    expect(screen.queryByTestId('guide-modal')).not.toBeInTheDocument();
  });

  it('main tab renders two-column layout with left and right sections', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.getByTestId('main-left')).toBeInTheDocument();
      expect(screen.getByTestId('main-right')).toBeInTheDocument();
    });
  });

  it('GameStatusPanel present in right column', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByTestId('game-status-panel')).toBeInTheDocument();
    });
  });

  it('settings tab hides main layout but keeps it mounted', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('Settings'));
    const layout = screen.getByTestId('main-layout');
    expect(layout.className).toContain('hidden');
  });

  it('responsive class applied for narrow viewports', async () => {
    render(<App />);
    await waitFor(() => {
      const layout = screen.getByTestId('main-layout');
      expect(layout.className).toContain('flex-col');
      expect(layout.className).toContain('lg:flex-row');
    });
  });
});
