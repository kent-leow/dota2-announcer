import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

let tickCallback: ((ms: number) => void) | null = null;

jest.mock('src/timer/gameTimer', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
  onTick: jest.fn((cb: (ms: number) => void) => {
    tickCallback = cb;
    return () => { tickCallback = null; };
  }),
}));

jest.mock('src/scheduler/eventScheduler', () => ({
  loadSchedule: jest.fn(),
}));

let stateChangeHandler: ((state: string) => void) | null = null;

const mockElectronAPI = {
  getState: jest.fn(() => Promise.resolve('idle')),
  onStateChange: jest.fn((cb: (state: string) => void) => {
    stateChangeHandler = cb;
    return () => { stateChangeHandler = null; };
  }),
  toggleMute: jest.fn(() => Promise.resolve(true)),
  setMuted: jest.fn(() => Promise.resolve()),
  isMuted: jest.fn(() => Promise.resolve(false)),
  setVolume: jest.fn(() => Promise.resolve()),
  getVolume: jest.fn(() => Promise.resolve(100)),
  getEvents: jest.fn(() => Promise.resolve({ events: [] })),
  reloadEvents: jest.fn(() => Promise.resolve({ events: [] })),
};

(window as any).electronAPI = mockElectronAPI;

import { MainDock } from './MainDock';
import * as gameTimer from 'src/timer/gameTimer';
import * as eventScheduler from 'src/scheduler/eventScheduler';

describe('MainDock', () => {
  beforeEach(() => {
    stateChangeHandler = null;
    tickCallback = null;
    jest.clearAllMocks();
    mockElectronAPI.getState.mockResolvedValue('idle');
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

  it('starts timer on in-match detection', async () => {
    render(<MainDock />);
    await waitFor(() => expect(stateChangeHandler).not.toBeNull());

    act(() => {
      stateChangeHandler?.('in-match');
    });

    expect(gameTimer.reset).toHaveBeenCalled();
    expect(gameTimer.start).toHaveBeenCalled();
  });

  it('stops timer when state goes idle', async () => {
    render(<MainDock />);
    await waitFor(() => expect(stateChangeHandler).not.toBeNull());

    act(() => {
      stateChangeHandler?.('in-match');
    });
    act(() => {
      stateChangeHandler?.('idle');
    });

    expect(gameTimer.stop).toHaveBeenCalled();
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
});
