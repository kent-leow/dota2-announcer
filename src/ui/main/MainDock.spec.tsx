import { render, screen, act } from '@testing-library/react';
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

import { MainDock } from './MainDock';
import * as gameTimer from 'src/timer/gameTimer';

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
});
