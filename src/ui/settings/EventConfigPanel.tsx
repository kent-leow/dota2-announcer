import { useState, useCallback } from 'react';
import { GameEvent, EventsConfig } from 'src/config/events.schema';
import { getEvents, reload } from 'src/config/eventsLoader';

export function EventConfigPanel() {
  const [config, setConfig] = useState<EventsConfig>(getEvents);

  const handleReload = useCallback(() => {
    const updated = reload();
    setConfig(updated);
  }, []);

  return (
    <div>
      <h2>Loaded Events</h2>
      <button onClick={handleReload}>Reload Events</button>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Spawn Time</th>
            <th>Warnings</th>
          </tr>
        </thead>
        <tbody>
          {config.events.map((event: GameEvent) => (
            <tr key={event.id}>
              <td>{event.id}</td>
              <td>{event.name}</td>
              <td>{event.spawnTime}s</td>
              <td>
                {event.warnings
                  ? event.warnings.map((w) => `${w.offsetSeconds}s`).join(', ')
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
