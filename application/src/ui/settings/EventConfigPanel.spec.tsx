import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PLACEHOLDER_ICON } from 'src/config/defaultIcons';

const defaults = {
  events: [
    {
      id: 'bounty-rune',
      name: 'Bounty Rune',
      spawnTime: 180,
      repeatEvery: 180,
      warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
      icon: 'data:image/png;base64,bountyicon',
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
  saveEvents: jest.fn(() => Promise.resolve({ success: true, config: defaults })),
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

  describe('icon column', () => {
    it('renders icon for each event', async () => {
      render(<EventConfigPanel />);
      await waitFor(() => {
        const bountyIcon = screen.getByTestId('event-icon-bounty-rune') as HTMLImageElement;
        expect(bountyIcon.src).toBe('data:image/png;base64,bountyicon');
      });
    });

    it('renders placeholder for events without icon', async () => {
      render(<EventConfigPanel />);
      await waitFor(() => {
        const powerIcon = screen.getByTestId('event-icon-power-rune') as HTMLImageElement;
        expect(powerIcon.src).toBe(PLACEHOLDER_ICON);
      });
    });

    it('renders upload button for each event', async () => {
      render(<EventConfigPanel />);
      await waitFor(() => {
        expect(screen.getByTestId('upload-icon-bounty-rune')).toBeInTheDocument();
        expect(screen.getByTestId('upload-icon-power-rune')).toBeInTheDocument();
      });
    });

    it('renders remove button only for events with icon', async () => {
      render(<EventConfigPanel />);
      await waitFor(() => {
        expect(screen.getByTestId('remove-icon-bounty-rune')).toBeInTheDocument();
        expect(screen.queryByTestId('remove-icon-power-rune')).not.toBeInTheDocument();
      });
    });

    it('remove button clears icon and calls saveEvents', async () => {
      const noIconConfig = {
        events: defaults.events.map((e) => e.id === 'bounty-rune' ? { ...e, icon: undefined } : e),
      };
      mockElectronAPI.saveEvents.mockResolvedValue({ success: true, config: noIconConfig });

      render(<EventConfigPanel />);
      await waitFor(() => screen.getByTestId('remove-icon-bounty-rune'));

      fireEvent.click(screen.getByTestId('remove-icon-bounty-rune'));

      await waitFor(() => {
        expect(mockElectronAPI.saveEvents).toHaveBeenCalled();
      });
    });
  });
});
