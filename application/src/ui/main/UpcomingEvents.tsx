import { useState, useEffect } from 'react';
import { getUpcoming } from 'src/scheduler/eventScheduler';
import { UpcomingEvent } from 'src/scheduler/eventSchedulerTypes';
import { PLACEHOLDER_ICON } from 'src/config/defaultIcons';

function formatCountdown(ms: number, currentMs: number): string {
  const remainingSeconds = Math.max(0, Math.floor((ms - currentMs) / 1000));
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatGameTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const unsub = window.electronAPI.onClockTick((ms) => {
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
        {events.map((event, idx) => {
          const spawnAtMs = event.fireAtMs + event.offsetSeconds * 1000;
          return (
            <li
              key={`${event.eventId}-${event.fireAtMs}-${idx}`}
              data-testid="upcoming-event-row"
              className={`flex items-center justify-between px-3 py-2 rounded text-sm ${
                idx % 2 === 0 ? 'bg-dota-black/40' : 'bg-dota-black/20'
              }`}
            >
              <span className="flex items-center gap-2">
                <img
                  data-testid="event-icon"
                  src={event.icon || PLACEHOLDER_ICON}
                  alt=""
                  width={16}
                  height={16}
                  className="rounded-sm"
                />
                <span data-testid="event-name" className="text-dota-grey font-medium">{event.eventName}</span>
              </span>
              <span className="flex gap-2 items-center">
                <span data-testid="event-countdown" className="font-mono text-dota-amber">{formatCountdown(event.fireAtMs, elapsed)}</span>
                <span data-testid="event-spawn-time" className="font-mono text-dota-grey/60 text-xs">@{formatGameTime(spawnAtMs)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
