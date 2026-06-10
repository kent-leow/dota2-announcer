import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusRow } from './StatusRow';
import { TrackedEvent } from 'src/tracker/gameStatusTypes';

describe('StatusRow', () => {
  const onLog = jest.fn();
  const onClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders log button when no tracked state', () => {
    render(<StatusRow label="Roshan" tracked={null} elapsedMs={0} onLog={onLog} onClear={onClear} />);
    expect(screen.getByTestId('log-btn-roshan')).toBeInTheDocument();
    expect(screen.queryByTestId('clear-btn-roshan')).not.toBeInTheDocument();
  });

  it('renders deadlines when tracked', () => {
    const tracked: TrackedEvent = {
      type: 'roshan',
      loggedAtMs: 60000,
      deadlines: [
        { label: 'May respawn', timeMs: 540000 },
        { label: 'Confirmed respawn', timeMs: 720000 },
      ],
    };
    render(<StatusRow label="Roshan" tracked={tracked} elapsedMs={60000} onLog={onLog} onClear={onClear} />);
    expect(screen.getByText(/May respawn at 09:00/)).toBeInTheDocument();
    expect(screen.getByText(/Confirmed respawn at 12:00/)).toBeInTheDocument();
    expect(screen.getByTestId('clear-btn-roshan')).toBeInTheDocument();
  });

  it('countdown displays correct remaining time', () => {
    const tracked: TrackedEvent = {
      type: 'buyback',
      loggedAtMs: 60000,
      deadlines: [{ label: 'Buyback available', timeMs: 540000 }],
    };
    render(<StatusRow label="Buyback" tracked={tracked} elapsedMs={120000} onLog={onLog} onClear={onClear} />);
    expect(screen.getByTestId('countdown-buyback')).toHaveTextContent('07:00');
  });

  it('shows amber color when past first deadline', () => {
    const tracked: TrackedEvent = {
      type: 'roshan',
      loggedAtMs: 60000,
      deadlines: [
        { label: 'May respawn', timeMs: 540000 },
        { label: 'Confirmed respawn', timeMs: 720000 },
      ],
    };
    const { container } = render(
      <StatusRow label="Roshan" tracked={tracked} elapsedMs={600000} onLog={onLog} onClear={onClear} />
    );
    expect(container.firstChild).toHaveClass('text-dota-amber');
  });

  it('shows green color when past final deadline', () => {
    const tracked: TrackedEvent = {
      type: 'roshan',
      loggedAtMs: 60000,
      deadlines: [
        { label: 'May respawn', timeMs: 540000 },
        { label: 'Confirmed respawn', timeMs: 720000 },
      ],
    };
    const { container } = render(
      <StatusRow label="Roshan" tracked={tracked} elapsedMs={800000} onLog={onLog} onClear={onClear} />
    );
    expect(container.firstChild).toHaveClass('text-dota-green');
  });

  it('clear button calls onClear', () => {
    const tracked: TrackedEvent = {
      type: 'glyph',
      loggedAtMs: 60000,
      deadlines: [{ label: 'Glyph available', timeMs: 360000 }],
    };
    render(<StatusRow label="Glyph" tracked={tracked} elapsedMs={60000} onLog={onLog} onClear={onClear} />);
    fireEvent.click(screen.getByTestId('clear-btn-glyph'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
