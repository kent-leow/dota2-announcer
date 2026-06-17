import { useState, useEffect, useCallback } from 'react';
import { DynamicEventConfig as DynamicEventConfigType } from 'src/config/events.schema';

export function DynamicEventConfig() {
  const [events, setEvents] = useState<DynamicEventConfigType[]>([]);

  useEffect(() => {
    window.electronAPI.getDynamicEvents().then((config) => {
      setEvents(config.dynamicEvents);
    });
  }, []);

  const save = useCallback((updated: DynamicEventConfigType[]) => {
    window.electronAPI.setDynamicEvents({ dynamicEvents: updated });
  }, []);

  const toggleEnabled = useCallback((idx: number) => {
    setEvents((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
      save(updated);
      return updated;
    });
  }, [save]);

  const toggleNotification = useCallback((idx: number, key: 'kill' | 'countdown' | 'respawn') => {
    setEvents((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        notifications: {
          ...updated[idx].notifications,
          [key]: !updated[idx].notifications[key],
        },
      };
      save(updated);
      return updated;
    });
  }, [save]);

  return (
    <div className="space-y-3 border-b border-dota-gold/10 pb-3">
      <h3 className="text-dota-gold text-xs font-semibold uppercase tracking-wide">Dynamic Events (GSI)</h3>
      {events.map((event, idx) => (
        <div key={event.id} className="rounded p-3 border border-dota-gold/20 bg-dota-black/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-dota-grey">{event.name}</span>
            <button
              data-testid={`dynamic-toggle-${event.id}`}
              onClick={() => toggleEnabled(idx)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                event.enabled
                  ? 'bg-dota-green/30 text-dota-green border border-dota-green/60'
                  : 'bg-dota-black/40 text-dota-grey/60 border border-dota-grey/20'
              }`}
            >
              {event.enabled ? 'On' : 'Off'}
            </button>
          </div>
          {event.enabled && (
            <div className="flex gap-3 text-xs">
              {([
                { key: 'kill' as const, tooltip: 'Notify when Roshan is killed' },
                { key: 'countdown' as const, tooltip: 'Notify each minute during respawn window' },
                { key: 'respawn' as const, tooltip: 'Notify when Roshan is confirmed alive' },
              ]).map(({ key, tooltip }) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={event.notifications[key]}
                    onChange={() => toggleNotification(idx, key)}
                    data-testid={`dynamic-notif-${event.id}-${key}`}
                    className="accent-dota-gold cursor-pointer"
                  />
                  <span className="text-dota-grey/70 capitalize">{key}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); alert(tooltip); }}
                    className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-dota-grey/20 text-dota-grey/60 hover:bg-dota-grey/30 hover:text-dota-grey text-[9px] leading-none font-bold transition-colors"
                    data-testid={`dynamic-info-${event.id}-${key}`}
                  >
                    ?
                  </button>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
