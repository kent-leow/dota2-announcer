import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

let notificationCallback: ((payload: { eventName: string; offsetSeconds: number; eventId: string; timestamp: number }) => void) | null = null;

(window as any).overlayAPI = {
  onNotification: jest.fn((cb) => {
    notificationCallback = cb;
    return () => { notificationCallback = null; };
  }),
};

import { NotificationStack } from './NotificationStack';

describe('NotificationStack', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    notificationCallback = null;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('subscribes to overlayAPI.onNotification on mount', () => {
    render(<NotificationStack />);
    expect(window.overlayAPI.onNotification).toHaveBeenCalled();
  });

  it('adds notification when callback fires', () => {
    render(<NotificationStack />);
    act(() => {
      notificationCallback!({ eventName: 'Bounty Rune', offsetSeconds: 30, eventId: 'bounty', timestamp: 1000 });
    });
    expect(screen.getByText('Bounty Rune')).toBeInTheDocument();
  });

  it('notification starts with entering status', () => {
    const { container } = render(<NotificationStack />);
    act(() => {
      notificationCallback!({ eventName: 'Test', offsetSeconds: 10, eventId: 'test', timestamp: 1000 });
    });
    expect(container.querySelector('.notification-card--entering')).toBeInTheDocument();
  });

  it('transitions to visible after enter duration', () => {
    const { container } = render(<NotificationStack />);
    act(() => {
      notificationCallback!({ eventName: 'Test', offsetSeconds: 10, eventId: 'test', timestamp: 1000 });
    });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(container.querySelector('.notification-card--visible')).toBeInTheDocument();
  });

  it('transitions to exiting after 5 seconds', () => {
    const { container } = render(<NotificationStack />);
    act(() => {
      notificationCallback!({ eventName: 'Test', offsetSeconds: 10, eventId: 'test', timestamp: 1000 });
    });
    act(() => {
      jest.advanceTimersByTime(5300);
    });
    expect(container.querySelector('.notification-card--exiting')).toBeInTheDocument();
  });

  it('removes notification after exit animation', () => {
    render(<NotificationStack />);
    act(() => {
      notificationCallback!({ eventName: 'Test', offsetSeconds: 10, eventId: 'test', timestamp: 1000 });
    });
    act(() => {
      jest.advanceTimersByTime(5700);
    });
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('supports multiple concurrent notifications', () => {
    render(<NotificationStack />);
    act(() => {
      notificationCallback!({ eventName: 'Event A', offsetSeconds: 30, eventId: 'a', timestamp: 1000 });
      notificationCallback!({ eventName: 'Event B', offsetSeconds: 15, eventId: 'b', timestamp: 1000 });
    });
    expect(screen.getByText('Event A')).toBeInTheDocument();
    expect(screen.getByText('Event B')).toBeInTheDocument();
  });

  it('cleans up subscription on unmount', () => {
    const { unmount } = render(<NotificationStack />);
    unmount();
    expect(notificationCallback).toBeNull();
  });
});
