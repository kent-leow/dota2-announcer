import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

let tickCallback: ((ms: number) => void) | null = null;

jest.mock('src/scheduler/eventScheduler', () => ({
  loadSchedule: jest.fn(),
  onAnnouncement: jest.fn(),
  tick: jest.fn(),
  getUpcomingOccurrences: jest.fn(() => []),
  resetScheduler: jest.fn(),
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


let stateChangeHandler: ((state: string) => void) | null = null;

const mockElectronAPI = {
  getState: jest.fn(() => Promise.resolve('idle')),
  getElapsed: jest.fn(() => Promise.resolve(0)),
  getGsiStatus: jest.fn(() => Promise.resolve(null)),
  onStateChange: jest.fn((cb: (state: string) => void) => {
    stateChangeHandler = cb;
    return () => { stateChangeHandler = null; };
  }),
  onClockTick: jest.fn((cb: (ms: number) => void) => {
    tickCallback = cb;
    return () => { tickCallback = null; };
  }),
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
  sendOverlayNotification: jest.fn(),
  sendOverlayUpcoming: jest.fn(),
  onEventsChanged: jest.fn(() => () => {}),
  getPersistentConfig: jest.fn(() => Promise.resolve({ enabled: false, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5 })),
  getNotificationConfig: jest.fn(() => Promise.resolve({ enabled: true, position: 'right', fontSize: { name: 16, offset: 13 } })),
  onOverlayConfigChanged: jest.fn(() => () => {}),
  onGsiStatusUpdate: jest.fn(() => () => {}),
  onRoshanEvent: jest.fn(() => () => {}),
};

(window as any).electronAPI = mockElectronAPI;

import { MainDock } from './MainDock';
import * as eventScheduler from 'src/scheduler/eventScheduler';
import * as announcer from 'src/tts/announcer';

describe('MainDock', () => {
  beforeEach(() => {
    stateChangeHandler = null;
    tickCallback = null;
    jest.clearAllMocks();
    mockElectronAPI.getState.mockResolvedValue('idle');
    mockElectronAPI.getElapsed.mockResolvedValue(0);
    mockElectronAPI.isMuted.mockResolvedValue(false);
    mockElectronAPI.getVolume.mockResolvedValue(100);
    mockElectronAPI.getEvents.mockResolvedValue({ events: [] });
  });

  it('displays Idle status by default', async () => {
    render(<MainDock />);
    await waitFor(() => {
      expect(screen.getByTestId('status-line')).toHaveTextContent('Idle');
    });
  });

  it('displays 00:00 clock initially', async () => {
    render(<MainDock />);
    await waitFor(() => {
      expect(screen.getByTestId('game-clock')).toHaveTextContent('00:00');
    });
  });

  it('toggles to In Match on state change', async () => {
    render(<MainDock />);
    await waitFor(() => expect(stateChangeHandler).not.toBeNull());

    act(() => {
      stateChangeHandler?.('in-match');
    });

    expect(screen.getByTestId('status-line')).toHaveTextContent('In Match');
  });

  it('updates status display on state change', async () => {
    render(<MainDock />);
    await waitFor(() => expect(stateChangeHandler).not.toBeNull());

    act(() => {
      stateChangeHandler?.('in-match');
    });

    expect(screen.getByTestId('status-line')).toHaveTextContent('In Match');
  });

  it('resets scheduler on idle transition', async () => {
    render(<MainDock />);
    await waitFor(() => expect(stateChangeHandler).not.toBeNull());

    act(() => {
      stateChangeHandler?.('in-match');
    });
    act(() => {
      stateChangeHandler?.('idle');
    });

    expect(eventScheduler.resetScheduler).toHaveBeenCalled();
    expect(screen.getByTestId('status-line')).toHaveTextContent('Idle');
  });

  it('updates clock display in MM:SS format on tick', async () => {
    render(<MainDock />);
    await waitFor(() => expect(tickCallback).not.toBeNull());

    act(() => {
      tickCallback?.(65000);
    });

    expect(screen.getByTestId('game-clock')).toHaveTextContent('01:05');
  });

  it('formats time correctly for large values', async () => {
    render(<MainDock />);
    await waitFor(() => expect(tickCallback).not.toBeNull());

    act(() => {
      tickCallback?.(3661000);
    });

    expect(screen.getByTestId('game-clock')).toHaveTextContent('61:01');
  });

  describe('UI controls', () => {
    it('mute toggle button present and toggles state', async () => {
      render(<MainDock />);
      await waitFor(() => expect(screen.getByTestId('mute-toggle')).toHaveTextContent('Mute'));

      await act(async () => {
        fireEvent.click(screen.getByTestId('mute-toggle'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('mute-toggle')).toHaveTextContent('Unmute');
      });
    });

    it('volume slider updates value live showing correct percentage', async () => {
      render(<MainDock />);
      await waitFor(() => expect(screen.getByTestId('volume-value')).toHaveTextContent('100%'));

      act(() => {
        fireEvent.change(screen.getByTestId('volume-slider'), { target: { value: '50' } });
      });

      expect(mockElectronAPI.setVolume).toHaveBeenCalledWith(50);
      expect(screen.getByTestId('volume-value')).toHaveTextContent('50%');
    });

    it('does not render start/stop or reload buttons', async () => {
      render(<MainDock />);
      await waitFor(() => expect(screen.getByTestId('mute-toggle')).toBeInTheDocument());
      expect(screen.queryByTestId('start-stop')).not.toBeInTheDocument();
      expect(screen.queryByTestId('reload-config')).not.toBeInTheDocument();
    });
  });

  describe('TTS wiring', () => {
    it('registers onAnnouncement callback on mount', async () => {
      render(<MainDock />);
      await waitFor(() => expect(eventScheduler.onAnnouncement).toHaveBeenCalledWith(expect.any(Function)));
    });

    it('calls eventScheduler.tick on each gameTimer tick', async () => {
      render(<MainDock />);
      await waitFor(() => expect(tickCallback).not.toBeNull());

      act(() => {
        tickCallback?.(5000);
      });

      expect(eventScheduler.tick).toHaveBeenCalledWith(5000);
    });

    it('calls announcer.speak when scheduler fires an announcement', async () => {
      render(<MainDock />);
      await waitFor(() => expect(eventScheduler.onAnnouncement).toHaveBeenCalled());

      const announcementCb = (eventScheduler.onAnnouncement as jest.Mock).mock.calls[0][0];
      await act(async () => {
        announcementCb('Bounty Rune', 30, 'bounty-rune');
      });

      expect(announcer.formatMessage).toHaveBeenCalledWith('Bounty Rune', 30);
      expect(announcer.speak).toHaveBeenCalledWith('Bounty Rune in 30 seconds');
    });

    it('sends overlay notification when notification enabled', async () => {
      render(<MainDock />);
      await waitFor(() => expect(eventScheduler.onAnnouncement).toHaveBeenCalled());

      const announcementCb = (eventScheduler.onAnnouncement as jest.Mock).mock.calls[0][0];
      await act(async () => {
        announcementCb('Bounty Rune', 30, 'bounty-rune');
      });

      expect(mockElectronAPI.sendOverlayNotification).toHaveBeenCalled();
    });

    it('does not send overlay notification when notification disabled', async () => {
      mockElectronAPI.getNotificationConfig.mockResolvedValue({ enabled: false, position: 'right', fontSize: { name: 16, offset: 13 } });
      render(<MainDock />);
      await waitFor(() => expect(eventScheduler.onAnnouncement).toHaveBeenCalled());

      const announcementCb = (eventScheduler.onAnnouncement as jest.Mock).mock.calls[0][0];
      await act(async () => {
        announcementCb('Bounty Rune', 30, 'bounty-rune');
      });

      expect(mockElectronAPI.sendOverlayNotification).not.toHaveBeenCalled();
    });

    it('sends upcoming events when persistent enabled on tick', async () => {
      mockElectronAPI.getPersistentConfig.mockResolvedValue({ enabled: true, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5 });
      (eventScheduler.getUpcomingOccurrences as jest.Mock).mockReturnValue([{ eventId: 'a', eventName: 'Rune', happenTimeMs: 120000 }]);
      render(<MainDock />);
      await waitFor(() => expect(tickCallback).not.toBeNull());

      act(() => {
        tickCallback?.(60000);
      });

      expect(mockElectronAPI.sendOverlayUpcoming).toHaveBeenCalled();
    });

    it('does not send upcoming events when persistent disabled on tick', async () => {
      mockElectronAPI.getPersistentConfig.mockResolvedValue({ enabled: false, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5 });
      (eventScheduler.getUpcomingOccurrences as jest.Mock).mockReturnValue([{ eventId: 'a', eventName: 'Rune', happenTimeMs: 120000 }]);
      render(<MainDock />);
      await waitFor(() => expect(tickCallback).not.toBeNull());
      await act(async () => { await Promise.resolve(); });

      mockElectronAPI.sendOverlayUpcoming.mockClear();
      act(() => {
        tickCallback?.(60000);
      });

      expect(mockElectronAPI.sendOverlayUpcoming).not.toHaveBeenCalled();
    });
  });
});
