import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationCard, NotificationStatus } from './NotificationCard';

interface NotificationItem {
  id: number;
  eventName: string;
  offsetSeconds: number;
  status: NotificationStatus;
}

const VISIBLE_DURATION_MS = 5000;
const ENTER_DURATION_MS = 300;
const EXIT_DURATION_MS = 400;

let nextId = 0;

export function NotificationStack() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const scheduleTimer = useCallback((fn: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      fn();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  const addNotification = useCallback((eventName: string, offsetSeconds: number) => {
    const id = nextId++;
    setNotifications((prev) => [...prev, { id, eventName, offsetSeconds, status: 'entering' }]);

    scheduleTimer(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'visible' } : n))
      );
    }, ENTER_DURATION_MS);

    scheduleTimer(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'exiting' } : n))
      );
    }, ENTER_DURATION_MS + VISIBLE_DURATION_MS);

    scheduleTimer(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, ENTER_DURATION_MS + VISIBLE_DURATION_MS + EXIT_DURATION_MS);
  }, [scheduleTimer]);

  useEffect(() => {
    if (!window.overlayAPI) return;
    const unsub = window.overlayAPI.onNotification((payload) => {
      addNotification(payload.eventName, payload.offsetSeconds);
    });
    return () => {
      unsub();
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
  }, [addNotification]);

  return (
    <div className="notification-stack">
      {notifications.map((n) => (
        <NotificationCard
          key={n.id}
          eventName={n.eventName}
          offsetSeconds={n.offsetSeconds}
          status={n.status}
        />
      ))}
    </div>
  );
}
