import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

let stateChangeCallback: ((state: 'in-match' | 'idle') => void) | null = null;
let tickCallback: ((ms: number) => void) | null = null;

jest.mock('src/dota/processDetector', () => ({
  getState: jest.fn(() => 'idle'),
  onStateChange: jest.fn((cb: (state: 'in-match' | 'idle') => void) => {
    stateChangeCallback = cb;
    return () => { stateChangeCallback = null; };
  }),
}));

jest.mock('src/timer/gameTimer', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
  onTick: jest.fn((cb: (ms: number) => void) => {
    tickCallback = cb;
    return () => { tickCallback = null; };
  }),
}));

jest.mock('src/tts/muteManager', () => ({
  isMuted: jest.fn(() => false),
  toggleMute: jest.fn(() => true),
}));

jest.mock('src/tts/volumeController', () => ({
  getVolume: jest.fn(() => 100),
  setVolume: jest.fn(),
}));

jest.mock('src/config/eventsLoader', () => ({
  reload: jest.fn(),
}));

jest.mock('src/scheduler/eventScheduler', () => ({
  loadSchedule: jest.fn(),
}));

import { MainDock } from './MainDock';
import * as gameTimer from 'src/timer/gameTimer';
import * as muteManager from 'src/tts/muteManager';
import * as volumeController from 'src/tts/volumeController';
import * as eventsLoader from 'src/config/eventsLoader';
import * as eventScheduler from 'src/scheduler/eventScheduler';

describe('MainDock', () => {
  beforeEach(() => {
    stateChangeCallback = null;
    tickCallback = null;
    jest.clearAllMocks();
  });

  it('displays Idle status by default', () => {
    render(<MainDock />);
    expect(screen.getByTestId('status-line')).toHaveTextContent('Idle');
  });

  it('displays 00:00 clock initially', () => {
    render(<MainDock />);
    expect(screen.getByTestId('game-clock')).toHaveTextContent('00:00');
  });

  it('toggles to In Match on state change', () => {
    render(<MainDock />);

    act(() => {
      stateChangeCallback?.('in-match');
    });

    expect(screen.getByTestId('status-line')).toHaveTextContent('In Match');
  });

  it('starts timer on in-match detection', () => {
    render(<MainDock />);

    act(() => {
      stateChangeCallback?.('in-match');
    });

    expect(gameTimer.reset).toHaveBeenCalled();
    expect(gameTimer.start).toHaveBeenCalled();
  });

  it('stops timer when state goes idle', () => {
    render(<MainDock />);

    act(() => {
      stateChangeCallback?.('in-match');
    });
    act(() => {
      stateChangeCallback?.('idle');
    });

    expect(gameTimer.stop).toHaveBeenCalled();
    expect(screen.getByTestId('status-line')).toHaveTextContent('Idle');
  });

  it('updates clock display in MM:SS format on tick', () => {
    render(<MainDock />);

    act(() => {
      tickCallback?.(65000);
    });

    expect(screen.getByTestId('game-clock')).toHaveTextContent('01:05');
  });

  it('handles rapid state transitions without stale values', () => {
    render(<MainDock />);

    act(() => {
      stateChangeCallback?.('in-match');
      stateChangeCallback?.('idle');
      stateChangeCallback?.('in-match');
    });

    expect(screen.getByTestId('status-line')).toHaveTextContent('In Match');
  });

  it('formats time correctly for large values', () => {
    render(<MainDock />);

    act(() => {
      tickCallback?.(3661000);
    });

    expect(screen.getByTestId('game-clock')).toHaveTextContent('61:01');
  });

  describe('UI controls', () => {
    it('mute toggle button present and toggles state', () => {
      render(<MainDock />);
      const btn = screen.getByTestId('mute-toggle');
      expect(btn).toHaveTextContent('Mute');

      act(() => {
        fireEvent.click(btn);
      });

      expect(muteManager.toggleMute).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('mute-toggle')).toHaveTextContent('Unmute');
    });

    it('volume slider updates value live showing correct percentage', () => {
      render(<MainDock />);
      const slider = screen.getByTestId('volume-slider') as HTMLInputElement;
      const valueDisplay = screen.getByTestId('volume-value');

      expect(valueDisplay).toHaveTextContent('100%');

      act(() => {
        fireEvent.change(slider, { target: { value: '50' } });
      });

      expect(volumeController.setVolume).toHaveBeenCalledWith(50);
      expect(screen.getByTestId('volume-value')).toHaveTextContent('50%');
    });

    it('reload config button reloads without crash', () => {
      render(<MainDock />);

      act(() => {
        stateChangeCallback?.('in-match');
      });
      act(() => {
        tickCallback?.(30000);
      });

      const reloadBtn = screen.getByTestId('reload-config');
      act(() => {
        fireEvent.click(reloadBtn);
      });

      expect(eventsLoader.reload).toHaveBeenCalled();
      expect(eventScheduler.loadSchedule).toHaveBeenCalled();
      expect(screen.getByTestId('game-clock')).toHaveTextContent('00:30');
      expect(screen.getByTestId('status-line')).toHaveTextContent('In Match');
    });

    it('start/stop button toggles announcer state', () => {
      render(<MainDock />);
      const btn = screen.getByTestId('start-stop');
      expect(btn).toHaveTextContent('Stop');

      act(() => {
        fireEvent.click(btn);
      });

      expect(btn).toHaveTextContent('Start');
    });
  });
});
