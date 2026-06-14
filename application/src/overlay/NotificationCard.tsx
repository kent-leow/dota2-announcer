export type NotificationStatus = 'entering' | 'visible' | 'exiting';

interface NotificationCardProps {
  eventName: string;
  offsetSeconds: number;
  happenTimeMs?: number;
  gameTimeMs?: number;
  status: NotificationStatus;
  align?: 'left' | 'right';
  fontSizeName?: number;
  fontSizeOffset?: number;
}

function computeCountdown(happenTimeMs: number | undefined, gameTimeMs: number | undefined, offsetSeconds: number): string {
  if (happenTimeMs && gameTimeMs) {
    const happenSec = Math.floor(happenTimeMs / 1000);
    const currentSec = Math.floor(gameTimeMs / 1000);
    const remaining = Math.max(0, happenSec - currentSec);
    if (remaining === 0) return 'now';
    return `in ${remaining}s`;
  }
  if (offsetSeconds === 0) return 'now';
  return `in ${offsetSeconds}s`;
}

export function NotificationCard({ eventName, offsetSeconds, happenTimeMs, gameTimeMs, status, align = 'right', fontSizeName = 16, fontSizeOffset = 13 }: NotificationCardProps) {
  return (
    <div className={`notification-card notification-card--${status} notification-card--${align}`}>
      <div className="notification-card__name" style={{ fontSize: `${fontSizeName}px` }}>{eventName}</div>
      <div className="notification-card__offset" style={{ fontSize: `${fontSizeOffset}px` }}>{computeCountdown(happenTimeMs, gameTimeMs, offsetSeconds)}</div>
    </div>
  );
}
