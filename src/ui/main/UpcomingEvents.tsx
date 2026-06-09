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
    return (
      <div data-testid="upcoming-events-empty" className="bg-dota-dark rounded-lg p-4 text-center text-dota-grey/60 text-sm">
        No upcoming events
      </div>
    );
  }

  return (
    <div data-testid="upcoming-events" className="bg-dota-dark rounded-lg p-4">
      <h3 className="text-dota-gold text-sm font-semibold mb-3 uppercase tracking-wide">Upcoming Events</h3>
      <ul className="space-y-1">
        {events.map((event, idx) => (
          <li
            key={`${event.eventId}-${event.fireAtMs}-${idx}`}
            data-testid="upcoming-event-row"
            className={`flex items-center justify-between px-3 py-2 rounded text-sm ${
              idx % 2 === 0 ? 'bg-dota-black/40' : 'bg-dota-black/20'
            }`}
          >
            <span data-testid="event-name" className="text-dota-grey font-medium">{event.eventName}</span>
            <span data-testid="event-countdown" className="font-mono text-dota-amber">{formatCountdown(event.fireAtMs, elapsed)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
