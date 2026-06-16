import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PLACEHOLDER_ICON } from 'src/config/defaultIcons';

let tickCallback: ((ms: number) => void) | null = null;

const mockElectronAPI = {
  onClockTick: jest.fn((cb: (ms: number) => void) => {
    tickCallback = cb;
    return () => { tickCallback = null; };
  }),
};

(window as any).electronAPI = {
  ...(window as any).electronAPI,
  ...mockElectronAPI,
};

const mockGetUpcoming = jest.fn();
jest.mock('src/scheduler/eventScheduler', () => ({
  getUpcoming: (...args: unknown[]) => mockGetUpcoming(...args),
}));

import { UpcomingEvents } from './UpcomingEvents';

describe('UpcomingEvents', () => {
  beforeEach(() => {
    tickCallback = null;
    mockGetUpcoming.mockReturnValue([]);
    jest.clearAllMocks();
  });

  it('shows empty state when no events pending', () => {
    mockGetUpcoming.mockReturnValue([]);
    render(<UpcomingEvents />);
    expect(screen.getByTestId('upcoming-events-empty')).toHaveTextContent('No upcoming events');
  });

  it('renders events sorted by nearest spawn time', () => {
    mockGetUpcoming.mockReturnValue([
      { eventId: 'near', eventName: 'Near Event', fireAtMs: 60_000, offsetSeconds: 30 },
      { eventId: 'far', eventName: 'Far Event', fireAtMs: 120_000, offsetSeconds: 60 },
    ]);

    render(<UpcomingEvents />);

    act(() => {
      tickCallback?.(30_000);
    });

    const rows = screen.getAllByTestId('upcoming-event-row');
    expect(rows).toHaveLength(2);

    const names = screen.getAllByTestId('event-name');
    expect(names[0]).toHaveTextContent('Near Event');
    expect(names[1]).toHaveTextContent('Far Event');
  });

  it('updates ordering as clock advances', () => {
    mockGetUpcoming
      .mockReturnValueOnce([
        { eventId: 'a', eventName: 'Event A', fireAtMs: 60_000, offsetSeconds: 30 },
        { eventId: 'b', eventName: 'Event B', fireAtMs: 120_000, offsetSeconds: 60 },
      ])
      .mockReturnValueOnce([
        { eventId: 'b', eventName: 'Event B', fireAtMs: 120_000, offsetSeconds: 60 },
      ]);

    render(<UpcomingEvents />);

    act(() => {
      tickCallback?.(30_000);
    });

    expect(screen.getAllByTestId('upcoming-event-row')).toHaveLength(2);

    act(() => {
      tickCallback?.(65_000);
    });

    expect(screen.getAllByTestId('upcoming-event-row')).toHaveLength(1);
    expect(screen.getByTestId('event-name')).toHaveTextContent('Event B');
  });

  it('displays countdown correctly', () => {
    mockGetUpcoming.mockReturnValue([
      { eventId: 'test', eventName: 'Test', fireAtMs: 90_000, offsetSeconds: 30 },
    ]);

    render(<UpcomingEvents />);

    act(() => {
      tickCallback?.(30_000);
    });

    expect(screen.getByTestId('event-countdown')).toHaveTextContent('01:00');
  });

  describe('icon', () => {
    it('renders icon img for events with icon', () => {
      mockGetUpcoming.mockReturnValue([
        { eventId: 'test', eventName: 'Test', fireAtMs: 90_000, offsetSeconds: 30, icon: 'data:image/png;base64,abc' },
      ]);

      render(<UpcomingEvents />);
      act(() => { tickCallback?.(30_000); });

      const icon = screen.getByTestId('event-icon') as HTMLImageElement;
      expect(icon.src).toBe('data:image/png;base64,abc');
      expect(icon).toHaveAttribute('width', '16');
      expect(icon).toHaveAttribute('height', '16');
    });

    it('renders placeholder for events without icon', () => {
      mockGetUpcoming.mockReturnValue([
        { eventId: 'test', eventName: 'Test', fireAtMs: 90_000, offsetSeconds: 30 },
      ]);

      render(<UpcomingEvents />);
      act(() => { tickCallback?.(30_000); });

      const icon = screen.getByTestId('event-icon') as HTMLImageElement;
      expect(icon.src).toBe(PLACEHOLDER_ICON);
    });
  });
});
