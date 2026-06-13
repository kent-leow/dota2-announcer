export type NotificationStatus = 'entering' | 'visible' | 'exiting';

interface NotificationCardProps {
  eventName: string;
  offsetSeconds: number;
  status: NotificationStatus;
  align?: 'left' | 'right';
}

function formatOffset(offsetSeconds: number): string {
  if (offsetSeconds === 0) return 'now';
  return `in ${offsetSeconds}s`;
}

export function NotificationCard({ eventName, offsetSeconds, status, align = 'right' }: NotificationCardProps) {
  return (
    <div className={`notification-card notification-card--${status} notification-card--${align}`}>
      <div className="notification-card__name">{eventName}</div>
      <div className="notification-card__offset">{formatOffset(offsetSeconds)}</div>
    </div>
  );
}
