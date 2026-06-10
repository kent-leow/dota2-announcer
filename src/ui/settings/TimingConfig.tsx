import { useState, useEffect, useCallback } from 'react';
import { GameEvent, EventsConfig } from 'src/config/events.schema';
import * as eventScheduler from 'src/scheduler/eventScheduler';

interface EditableEvent extends GameEvent {
  enabled: boolean;
}

export function TimingConfig() {
  const [events, setEvents] = useState<EditableEvent[]>([]);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    window.electronAPI.getEvents().then((config) => {
      setEvents(config.events.map((e) => ({ ...e, enabled: true })));
    });
  }, []);

  const handleWarningChange = useCallback((eventIdx: number, warningIdx: number, value: string) => {
    setEvents((prev) => {
      const updated = [...prev];
      const event = { ...updated[eventIdx] };
      const warnings = [...(event.warnings ?? [])];
      warnings[warningIdx] = { offsetSeconds: Math.max(1, Number(value) || 1) };
      event.warnings = warnings;
      updated[eventIdx] = event;
      return updated;
    });
    setDirty(true);
  }, []);

  const handleSpawnTimeChange = useCallback((eventIdx: number, value: string) => {
    setEvents((prev) => {
      const updated = [...prev];
      updated[eventIdx] = { ...updated[eventIdx], spawnTime: Math.max(0, Number(value) || 0) };
      return updated;
    });
    setDirty(true);
  }, []);

  const handleRepeatChange = useCallback((eventIdx: number, value: string) => {
    setEvents((prev) => {
      const updated = [...prev];
      const numVal = Number(value) || 0;
      updated[eventIdx] = { ...updated[eventIdx], repeatEvery: numVal > 0 ? numVal : undefined };
      return updated;
    });
    setDirty(true);
  }, []);

  const handleToggleEvent = useCallback((eventIdx: number) => {
    setEvents((prev) => {
      const updated = [...prev];
      updated[eventIdx] = { ...updated[eventIdx], enabled: !updated[eventIdx].enabled };
      return updated;
    });
    setDirty(true);
  }, []);

  const handleApply = useCallback(() => {
    const enabledEvents = events.filter((e) => e.enabled);
    const config: EventsConfig = {
      events: enabledEvents.map(({ enabled: _e, ...rest }) => rest),
    };
    eventScheduler.loadSchedule(config);
    setDirty(false);
  }, [events]);

  const handleReload = useCallback(() => {
    window.electronAPI.reloadEvents().then((config) => {
      setEvents(config.events.map((e) => ({ ...e, enabled: true })));
      eventScheduler.loadSchedule(config);
      setDirty(false);
    });
  }, []);

  return (
    <div className="bg-dota-dark rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-dota-gold text-sm font-semibold uppercase tracking-wide">Event Timings</h2>
        <div className="flex gap-2">
          <button
            onClick={handleReload}
            className="px-3 py-1.5 rounded text-xs font-medium bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30 transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleApply}
            disabled={!dirty}
            className="px-3 py-1.5 rounded text-xs font-medium bg-dota-green/20 text-dota-green border border-dota-green/40 hover:bg-dota-green/30 transition-colors disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {events.map((event, idx) => (
          <div
            key={event.id}
            className={`rounded p-3 border transition-colors ${
              event.enabled
                ? 'border-dota-gold/20 bg-dota-black/30'
                : 'border-dota-grey/10 bg-dota-black/10 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={event.enabled}
                  onChange={() => handleToggleEvent(idx)}
                  className="accent-dota-gold"
                />
                <span className="text-sm font-medium text-dota-grey">{event.name}</span>
              </label>
              <span className="text-xs text-dota-grey/50 font-mono">{event.id}</span>
            </div>

            {event.enabled && (
              <div className="grid grid-cols-3 gap-3 text-xs">
                <label className="space-y-1">
                  <span className="text-dota-grey/70">Spawn (s)</span>
                  <input
                    type="number"
                    min="0"
                    value={event.spawnTime}
                    onChange={(e) => handleSpawnTimeChange(idx, e.target.value)}
                    className="w-full bg-dota-black/60 text-dota-grey border border-dota-gold/20 rounded px-2 py-1"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-dota-grey/70">Repeat (s)</span>
                  <input
                    type="number"
                    min="0"
                    value={event.repeatEvery ?? 0}
                    onChange={(e) => handleRepeatChange(idx, e.target.value)}
                    className="w-full bg-dota-black/60 text-dota-grey border border-dota-gold/20 rounded px-2 py-1"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-dota-grey/70">Warnings (s)</span>
                  <input
                    type="text"
                    value={(event.warnings ?? []).map((w) => w.offsetSeconds).join(', ')}
                    onChange={(e) => {
                      const parts = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setEvents((prev) => {
                        const updated = [...prev];
                        updated[idx] = {
                          ...updated[idx],
                          warnings: parts.map((p) => ({ offsetSeconds: Math.max(1, Number(p) || 1) })),
                        };
                        return updated;
                      });
                      setDirty(true);
                    }}
                    className="w-full bg-dota-black/60 text-dota-grey border border-dota-gold/20 rounded px-2 py-1"
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
