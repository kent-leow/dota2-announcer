import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('src/timer/gameTimer', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
  onTick: jest.fn(() => () => {}),
}));

jest.mock('src/scheduler/eventScheduler', () => ({
  loadSchedule: jest.fn(),
  onAnnouncement: jest.fn(),
  tick: jest.fn(),
  getUpcoming: jest.fn(() => []),
}));

jest.mock('src/tts/announcer', () => ({
  speak: jest.fn(),
  formatMessage: jest.fn((name: string, offset: number) => `${name} in ${offset} seconds`),
}));

const mockElectronAPI = {
  getState: jest.fn(() => Promise.resolve('idle')),
  onStateChange: jest.fn(() => () => {}),
  toggleMute: jest.fn(() => Promise.resolve(true)),
  setMuted: jest.fn(() => Promise.resolve()),
  isMuted: jest.fn(() => Promise.resolve(false)),
  setVolume: jest.fn(() => Promise.resolve()),
  getVolume: jest.fn(() => Promise.resolve(100)),
  getEvents: jest.fn(() => Promise.resolve({ events: [] })),
  reloadEvents: jest.fn(() => Promise.resolve({ events: [] })),
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
});
