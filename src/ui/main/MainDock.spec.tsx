import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

let tickCallback: ((ms: number) => void) | null = null;

jest.mock('src/scheduler/eventScheduler', () => ({
  loadSchedule: jest.fn(),
  onAnnouncement: jest.fn(),
  tick: jest.fn(),
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

jest.mock('src/tts/soundPlayer', () => ({
  playSound: jest.fn(),
  setVolume: jest.fn(),
  setMuted: jest.fn(),
}));

let stateChangeHandler: ((state: string) => void) | null = null;

const mockElectronAPI = {
  getState: jest.fn(() => Promise.resolve('idle')),
  getElapsed: jest.fn(() => Promise.resolve(0)),
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
  getSoundFilePath: jest.fn((): Promise<string | null> => Promise.resolve(null)),
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

    it('reload config button reloads without crash', async () => {
      render(<MainDock />);
      await waitFor(() => expect(stateChangeHandler).not.toBeNull());

      act(() => {
        stateChangeHandler?.('in-match');
      });
      act(() => {
        tickCallback?.(30000);
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('reload-config'));
      });

      await waitFor(() => {
        expect(mockElectronAPI.reloadEvents).toHaveBeenCalled();
        expect(eventScheduler.loadSchedule).toHaveBeenCalled();
      });
      expect(screen.getByTestId('game-clock')).toHaveTextContent('00:30');
      expect(screen.getByTestId('status-line')).toHaveTextContent('In Match');
    });

    it('start/stop button toggles announcer state', async () => {
      render(<MainDock />);
      await waitFor(() => expect(screen.getByTestId('start-stop')).toHaveTextContent('Stop'));

      act(() => {
        fireEvent.click(screen.getByTestId('start-stop'));
      });

      expect(screen.getByTestId('start-stop')).toHaveTextContent('Start');
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

    it('calls announcer.speak when scheduler fires an announcement with no sound', async () => {
      mockElectronAPI.getSoundFilePath.mockResolvedValue(null);
      render(<MainDock />);
      await waitFor(() => expect(eventScheduler.onAnnouncement).toHaveBeenCalled());

      const announcementCb = (eventScheduler.onAnnouncement as jest.Mock).mock.calls[0][0];
      await act(async () => {
        announcementCb('Bounty Rune', 30, 'bounty-rune');
      });

      expect(announcer.formatMessage).toHaveBeenCalledWith('Bounty Rune', 30);
      expect(announcer.speak).toHaveBeenCalledWith('Bounty Rune in 30 seconds');
    });

    it('plays sound instead of TTS when sound file is assigned', async () => {
      const soundPlayer = require('src/tts/soundPlayer');
      mockElectronAPI.getSoundFilePath.mockResolvedValue('/path/to/bounty-rune.wav');
      render(<MainDock />);
      await waitFor(() => expect(eventScheduler.onAnnouncement).toHaveBeenCalled());

      const announcementCb = (eventScheduler.onAnnouncement as jest.Mock).mock.calls[0][0];
      await act(async () => {
        announcementCb('Bounty Rune', 30, 'bounty-rune');
      });

      expect(soundPlayer.playSound).toHaveBeenCalledWith('/path/to/bounty-rune.wav');
      expect(announcer.speak).not.toHaveBeenCalled();
    });
  });
});
