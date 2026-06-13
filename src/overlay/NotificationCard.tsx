export type NotificationStatus = 'entering' | 'visible' | 'exiting';

interface NotificationCardProps {
  eventName: string;
  offsetSeconds: number;
  status: NotificationStatus;
}

function formatOffset(offsetSeconds: number): string {
  if (offsetSeconds === 0) return 'now';
  return `in ${offsetSeconds}s`;
}

export function NotificationCard({ eventName, offsetSeconds, status }: NotificationCardProps) {
  return (
    <div className={`notification-card notification-card--${status}`}>
      <div className="notification-card__name">{eventName}</div>
      <div className="notification-card__offset">{formatOffset(offsetSeconds)}</div>
    </div>
  );
}
