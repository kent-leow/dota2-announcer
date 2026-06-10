import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const defaults = {
  events: [
    {
      id: 'bounty-rune',
      name: 'Bounty Rune',
      spawnTime: 180,
      repeatEvery: 180,
      warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
    },
    {
      id: 'power-rune',
      name: 'Power Rune',
      spawnTime: 360,
      repeatEvery: 120,
      warnings: [{ offsetSeconds: 60 }],
    },
  ],
};

const reloaded = {
  events: [
    {
      id: 'reloaded-event',
      name: 'Reloaded Event',
      spawnTime: 60,
      warnings: [{ offsetSeconds: 15 }],
    },
  ],
};

const mockElectronAPI = {
  getState: jest.fn(() => Promise.resolve('idle')),
  onStateChange: jest.fn(() => () => {}),
  toggleMute: jest.fn(() => Promise.resolve(true)),
  setMuted: jest.fn(() => Promise.resolve()),
  isMuted: jest.fn(() => Promise.resolve(false)),
  setVolume: jest.fn(() => Promise.resolve()),
  getVolume: jest.fn(() => Promise.resolve(100)),
  getEvents: jest.fn(() => Promise.resolve(defaults)),
  reloadEvents: jest.fn(() => Promise.resolve(reloaded)),
};

(window as any).electronAPI = mockElectronAPI;

import { EventConfigPanel } from './EventConfigPanel';

describe('EventConfigPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockElectronAPI.getEvents.mockResolvedValue(defaults);
    mockElectronAPI.reloadEvents.mockResolvedValue(reloaded);
  });

  it('mounts and lists all event names', async () => {
    render(<EventConfigPanel />);

    await waitFor(() => {
      expect(screen.getByText('Bounty Rune')).toBeInTheDocument();
      expect(screen.getByText('Power Rune')).toBeInTheDocument();
    });
  });

  it('displays event details correctly', async () => {
    render(<EventConfigPanel />);

    await waitFor(() => {
      expect(screen.getByText('bounty-rune')).toBeInTheDocument();
      expect(screen.getByText('180s')).toBeInTheDocument();
      expect(screen.getByText('60s, 30s')).toBeInTheDocument();
    });
  });

  it('has a Reload Events button', async () => {
    render(<EventConfigPanel />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reload events/i })).toBeInTheDocument();
    });
  });

  it('reload button updates displayed events', async () => {
    render(<EventConfigPanel />);
    await waitFor(() => expect(screen.getByText('Bounty Rune')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /reload events/i }));

    await waitFor(() => {
      expect(screen.getByText('Reloaded Event')).toBeInTheDocument();
      expect(screen.getByText('reloaded-event')).toBeInTheDocument();
    });
  });
});
