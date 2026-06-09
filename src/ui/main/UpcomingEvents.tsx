import { useState, useEffect } from 'react';
import { getUpcoming } from 'src/scheduler/eventScheduler';
import { UpcomingEvent } from 'src/scheduler/eventSchedulerTypes';
import * as gameTimer from 'src/timer/gameTimer';

function formatCountdown(fireAtMs: number, currentMs: number): string {
  const remainingSeconds = Math.max(0, Math.floor((fireAtMs - currentMs) / 1000));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const unsub = gameTimer.onTick((ms) => {
      setElapsed(ms);
      setEvents(getUpcoming(ms));
    });
    return unsub;
  }, []);

  if (events.length === 0) {
    return <div data-testid="upcoming-events-empty">No upcoming events</div>;
  }

  return (
    <div data-testid="upcoming-events">
      <h3>Upcoming Events</h3>
      <ul>
        {events.map((event, idx) => (
          <li key={`${event.eventId}-${event.fireAtMs}-${idx}`} data-testid="upcoming-event-row">
            <span data-testid="event-name">{event.eventName}</span>
            {' — '}
            <span data-testid="event-countdown">
              {formatCountdown(event.fireAtMs, elapsed)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
