import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { _resetForTesting } from 'src/tracker/gameStatusTracker';

let gsiCallback: ((status: { daytime: boolean; roshanState: string; roshanStateEndSeconds: number; clockTime: number }) => void) | null = null;
let stateCallback: ((state: string) => void) | null = null;

const mockElectronAPI = {
  getGsiStatus: jest.fn(() => Promise.resolve(null)),
  onGsiStatusUpdate: jest.fn((cb) => {
    gsiCallback = cb;
    return () => { gsiCallback = null; };
  }),
  onStateChange: jest.fn((cb: (state: string) => void) => {
    stateCallback = cb;
    return () => { stateCallback = null; };
  }),
};

(window as any).electronAPI = {
  ...(window as any).electronAPI,
  ...mockElectronAPI,
};

import { GameStatusPanel } from './GameStatusPanel';

describe('GameStatusPanel', () => {
  beforeEach(() => {
    _resetForTesting();
    gsiCallback = null;
    stateCallback = null;
    jest.clearAllMocks();
  });

  it('renders daytime and roshan status', () => {
    render(<GameStatusPanel />);
    expect(screen.getByTestId('game-status-panel')).toBeInTheDocument();
    expect(screen.getByText('Daytime')).toBeInTheDocument();
    expect(screen.getByText('Alive')).toBeInTheDocument();
  });

  it('updates daytime from GSI', () => {
    render(<GameStatusPanel />);

    act(() => {
      gsiCallback?.({ daytime: false, roshanState: 'alive', roshanStateEndSeconds: 0, clockTime: 300 });
    });

    expect(screen.getByText('Nighttime')).toBeInTheDocument();
  });

  it('shows roshan dead state with countdown', () => {
    render(<GameStatusPanel />);

    act(() => {
      gsiCallback?.({ daytime: true, roshanState: 'respawn_base', roshanStateEndSeconds: 480, clockTime: 120 });
    });

    expect(screen.getByText('Dead')).toBeInTheDocument();
    expect(screen.getByText('08:00')).toBeInTheDocument();
  });

  it('shows respawn_variable state', () => {
    render(<GameStatusPanel />);

    act(() => {
      gsiCallback?.({ daytime: true, roshanState: 'respawn_variable', roshanStateEndSeconds: 180, clockTime: 600 });
    });

    expect(screen.getByText('May respawn')).toBeInTheDocument();
    expect(screen.getByText('03:00')).toBeInTheDocument();
  });

  it('resets on idle state change', () => {
    render(<GameStatusPanel />);

    act(() => {
      gsiCallback?.({ daytime: false, roshanState: 'respawn_base', roshanStateEndSeconds: 600, clockTime: 300 });
    });
    expect(screen.getByText('Nighttime')).toBeInTheDocument();

    act(() => { stateCallback?.('idle'); });
    expect(screen.getByText('Daytime')).toBeInTheDocument();
    expect(screen.getByText('Alive')).toBeInTheDocument();
  });
});
