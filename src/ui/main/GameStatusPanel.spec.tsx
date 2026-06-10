import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { _resetForTesting } from 'src/tracker/gameStatusTracker';

let tickCallback: ((ms: number) => void) | null = null;
let stateCallback: ((state: string) => void) | null = null;

const mockElectronAPI = {
  onClockTick: jest.fn((cb: (ms: number) => void) => {
    tickCallback = cb;
    return () => { tickCallback = null; };
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
    tickCallback = null;
    stateCallback = null;
    jest.clearAllMocks();
  });

  it('renders all three event sections in idle state', () => {
    render(<GameStatusPanel />);
    expect(screen.getByTestId('status-row-roshan')).toBeInTheDocument();
    expect(screen.getByTestId('status-row-buyback')).toBeInTheDocument();
    expect(screen.getByTestId('status-row-glyph')).toBeInTheDocument();
  });

  it('clicking Log records current elapsed time and shows deadlines', () => {
    render(<GameStatusPanel />);

    act(() => { tickCallback?.(120000); });
    fireEvent.click(screen.getByTestId('log-btn-roshan'));

    expect(screen.getByText(/Roshan killed at 02:00/)).toBeInTheDocument();
    expect(screen.getByText(/May respawn at 10:00/)).toBeInTheDocument();
  });

  it('countdown updates on clock tick', () => {
    render(<GameStatusPanel />);

    act(() => { tickCallback?.(60000); });
    fireEvent.click(screen.getByTestId('log-btn-buyback'));

    act(() => { tickCallback?.(120000); });

    const countdowns = screen.getAllByTestId('countdown-buyback');
    expect(countdowns[0]).toHaveTextContent('07:00');
  });

  it('clicking Clear resets to unlogged', () => {
    render(<GameStatusPanel />);

    act(() => { tickCallback?.(60000); });
    fireEvent.click(screen.getByTestId('log-btn-glyph'));
    expect(screen.getByTestId('clear-btn-glyph')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('clear-btn-glyph'));
    expect(screen.getByTestId('log-btn-glyph')).toBeInTheDocument();
  });

  it('state change to idle clears all', () => {
    render(<GameStatusPanel />);

    act(() => { tickCallback?.(60000); });
    fireEvent.click(screen.getByTestId('log-btn-roshan'));
    expect(screen.getByTestId('clear-btn-roshan')).toBeInTheDocument();

    act(() => { stateCallback?.('idle'); });
    expect(screen.getByTestId('log-btn-roshan')).toBeInTheDocument();
  });

  it('Roshan row shows color transition when past may-respawn time', () => {
    render(<GameStatusPanel />);

    act(() => { tickCallback?.(60000); });
    fireEvent.click(screen.getByTestId('log-btn-roshan'));

    act(() => { tickCallback?.(600000); });

    const row = screen.getByTestId('status-row-roshan');
    expect(row).toHaveClass('text-dota-amber');
  });
});
