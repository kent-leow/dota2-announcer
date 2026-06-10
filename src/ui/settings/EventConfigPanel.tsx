import { useState, useEffect, useCallback } from 'react';
import { GameEvent, EventsConfig } from 'src/config/events.schema';

export function EventConfigPanel() {
  const [config, setConfig] = useState<EventsConfig>({ events: [] });

  useEffect(() => {
    window.electronAPI.getEvents().then(setConfig);
  }, []);

  const handleReload = useCallback(() => {
    window.electronAPI.reloadEvents().then(setConfig);
  }, []);

  return (
    <div className="bg-dota-dark rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-dota-gold text-sm font-semibold uppercase tracking-wide">Loaded Events</h2>
        <button
          onClick={handleReload}
          className="px-3 py-1.5 rounded text-xs font-medium bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30 transition-colors"
        >
          Reload Events
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dota-gold/20">
              <th className="text-left py-2 px-2 text-dota-gold font-medium">ID</th>
              <th className="text-left py-2 px-2 text-dota-gold font-medium">Name</th>
              <th className="text-left py-2 px-2 text-dota-gold font-medium">Spawn Time</th>
              <th className="text-left py-2 px-2 text-dota-gold font-medium">Warnings</th>
            </tr>
          </thead>
          <tbody>
            {config.events.map((event: GameEvent, idx: number) => (
              <tr
                key={event.id}
                className={`border-b border-dota-black/40 hover:bg-dota-gold/5 transition-colors ${
                  idx % 2 === 0 ? 'bg-dota-black/20' : ''
                }`}
              >
                <td className="py-2 px-2 font-mono text-dota-grey/80">{event.id}</td>
                <td className="py-2 px-2 text-dota-grey">{event.name}</td>
                <td className="py-2 px-2 font-mono text-dota-amber">{event.spawnTime}s</td>
                <td className="py-2 px-2 text-dota-grey/70">
                  {event.warnings
                    ? event.warnings.map((w) => `${w.offsetSeconds}s`).join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
