export type NotificationStatus = 'entering' | 'visible' | 'exiting';

interface NotificationCardProps {
  eventName: string;
  offsetSeconds: number;
  status: NotificationStatus;
  align?: 'left' | 'right';
  fontSizeName?: number;
  fontSizeOffset?: number;
}

function formatOffset(offsetSeconds: number): string {
  if (offsetSeconds === 0) return 'now';
  return `in ${offsetSeconds}s`;
}

export function NotificationCard({ eventName, offsetSeconds, status, align = 'right', fontSizeName = 16, fontSizeOffset = 13 }: NotificationCardProps) {
  return (
    <div className={`notification-card notification-card--${status} notification-card--${align}`}>
      <div className="notification-card__name" style={{ fontSize: `${fontSizeName}px` }}>{eventName}</div>
      <div className="notification-card__offset" style={{ fontSize: `${fontSizeOffset}px` }}>{formatOffset(offsetSeconds)}</div>
    </div>
  );
}
