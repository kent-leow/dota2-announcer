import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

let notificationCallback: ((payload: { eventName: string; offsetSeconds: number; eventId: string; timestamp: number; happenTimeMs?: number }) => void) | null = null;
let tickCallback: ((elapsedMs: number) => void) | null = null;

(window as any).overlayAPI = {
  onNotification: jest.fn((cb) => {
    notificationCallback = cb;
    return () => { notificationCallback = null; };
  }),
  onTick: jest.fn((cb) => {
    tickCallback = cb;
    return () => { tickCallback = null; };
  }),
};

import { NotificationStack } from './NotificationStack';

const defaultProps = {
  position: 'right' as const,
  fontSize: { name: 16, offset: 13 },
  topOffset: 0,
};

describe('NotificationStack', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    notificationCallback = null;
    tickCallback = null;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('subscribes to overlayAPI.onNotification on mount', () => {
    render(<NotificationStack {...defaultProps} />);
    expect(window.overlayAPI.onNotification).toHaveBeenCalled();
  });

  it('adds notification when callback fires', () => {
    render(<NotificationStack {...defaultProps} />);
    act(() => {
      notificationCallback!({ eventName: 'Bounty Rune', offsetSeconds: 30, eventId: 'bounty', timestamp: 1000 });
    });
    expect(screen.getByText('Bounty Rune')).toBeInTheDocument();
  });

  it('notification starts with entering status', () => {
    const { container } = render(<NotificationStack {...defaultProps} />);
    act(() => {
      notificationCallback!({ eventName: 'Test', offsetSeconds: 10, eventId: 'test', timestamp: 1000 });
    });
    expect(container.querySelector('.notification-card--entering')).toBeInTheDocument();
  });

  it('transitions to visible after enter duration', () => {
    const { container } = render(<NotificationStack {...defaultProps} />);
    act(() => {
      notificationCallback!({ eventName: 'Test', offsetSeconds: 10, eventId: 'test', timestamp: 1000 });
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(container.querySelector('.notification-card--visible')).toBeInTheDocument();
  });

  it('transitions to exiting after 5 seconds', () => {
    const { container } = render(<NotificationStack {...defaultProps} />);
    act(() => {
      notificationCallback!({ eventName: 'Test', offsetSeconds: 10, eventId: 'test', timestamp: 1000 });
    });
    act(() => {
      jest.advanceTimersByTime(5300);
    });
    expect(container.querySelector('.notification-card--exiting')).toBeInTheDocument();
  });

  it('removes notification after exit animation', () => {
    render(<NotificationStack {...defaultProps} />);
    act(() => {
      notificationCallback!({ eventName: 'Test', offsetSeconds: 10, eventId: 'test', timestamp: 1000 });
    });
    act(() => {
      jest.advanceTimersByTime(5700);
    });
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('supports multiple concurrent notifications', () => {
    render(<NotificationStack {...defaultProps} />);
    act(() => {
      notificationCallback!({ eventName: 'Event A', offsetSeconds: 30, eventId: 'a', timestamp: 1000 });
      notificationCallback!({ eventName: 'Event B', offsetSeconds: 15, eventId: 'b', timestamp: 1000 });
    });
    expect(screen.getByText('Event A')).toBeInTheDocument();
    expect(screen.getByText('Event B')).toBeInTheDocument();
  });

  it('cleans up subscription on unmount', () => {
    const { unmount } = render(<NotificationStack {...defaultProps} />);
    unmount();
    expect(notificationCallback).toBeNull();
  });

  it('subscribes to onTick on mount', () => {
    render(<NotificationStack {...defaultProps} />);
    expect(window.overlayAPI.onTick).toHaveBeenCalled();
  });

  it('stores happenTimeMs from notification payload', () => {
    render(<NotificationStack {...defaultProps} />);
    act(() => {
      notificationCallback!({ eventName: 'Rune', offsetSeconds: 60, eventId: 'rune', timestamp: 1000, happenTimeMs: 120000 });
    });
    expect(screen.getByText('Rune')).toBeInTheDocument();
  });

  it('tick updates propagate to card countdown', () => {
    render(<NotificationStack {...defaultProps} />);
    act(() => {
      tickCallback!(60000);
    });
    act(() => {
      notificationCallback!({ eventName: 'Rune', offsetSeconds: 60, eventId: 'rune', timestamp: 1000, happenTimeMs: 120000 });
    });
    expect(screen.getByText('in 60s')).toBeInTheDocument();
    act(() => {
      tickCallback!(90000);
    });
    expect(screen.getByText('in 30s')).toBeInTheDocument();
  });

  it('applies topOffset as shifted top position below persistent', () => {
    const { container } = render(<NotificationStack {...defaultProps} topOffset={150} />);
    const stack = container.querySelector('.notification-stack');
    expect(stack).toHaveStyle({ top: 'calc(50% + 83px)', transform: 'none' });
  });

  it('uses position prop for alignment class', () => {
    const { container } = render(<NotificationStack {...defaultProps} position="left" />);
    expect(container.querySelector('.notification-stack--left')).toBeInTheDocument();
  });
});
