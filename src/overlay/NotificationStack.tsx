import { useState, useEffect, useCallback, useRef } from 'react';
import { NotificationCard, NotificationStatus } from './NotificationCard';

type Align = 'left' | 'right';

interface NotificationItem {
  id: number;
  eventName: string;
  offsetSeconds: number;
  happenTimeMs: number;
  status: NotificationStatus;
}

interface NotificationStackProps {
  position: Align;
  fontSize: { name: number; offset: number };
  topOffset: number;
}

const VISIBLE_DURATION_MS = 5000;
const ENTER_DURATION_MS = 300;
const EXIT_DURATION_MS = 400;

let nextId = 0;

export function NotificationStack({ position, fontSize, topOffset }: NotificationStackProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [gameTimeMs, setGameTimeMs] = useState(0);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const scheduleTimer = useCallback((fn: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer);
      fn();
    }, delay);
    timersRef.current.add(timer);
    return timer;
  }, []);

  const addNotification = useCallback((eventName: string, offsetSeconds: number, happenTimeMs: number) => {
    const id = nextId++;
    setNotifications((prev) => [...prev, { id, eventName, offsetSeconds, happenTimeMs, status: 'entering' }]);

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
    const unsubNotify = window.overlayAPI.onNotification((payload) => {
      addNotification(payload.eventName, payload.offsetSeconds, payload.happenTimeMs ?? 0);
    });
    const unsubTick = window.overlayAPI.onTick((ms) => {
      setGameTimeMs(ms);
    });
    return () => {
      unsubNotify();
      unsubTick();
      timersRef.current.forEach(clearTimeout);
      timersRef.current.clear();
    };
  }, [addNotification]);

  const style = topOffset > 0
    ? { top: `calc(50% + ${topOffset / 2}px)` }
    : undefined;

  return (
    <div
      className={`notification-stack notification-stack--${position}`}
      style={style}
    >
      {notifications.map((n) => (
        <NotificationCard
          key={n.id}
          eventName={n.eventName}
          offsetSeconds={n.offsetSeconds}
          happenTimeMs={n.happenTimeMs}
          gameTimeMs={gameTimeMs}
          status={n.status}
          align={position}
          fontSizeName={fontSize.name}
          fontSizeOffset={fontSize.offset}
        />
      ))}
    </div>
  );
}
