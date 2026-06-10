import { useState, useEffect, useCallback } from 'react';
import { GameEvent, EventsConfig } from 'src/config/events.schema';
import * as eventScheduler from 'src/scheduler/eventScheduler';

interface EditableEvent extends GameEvent {
  enabled: boolean;
}

function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function TimingConfig() {
  const [events, setEvents] = useState<EditableEvent[]>([]);
  const [dirty, setDirty] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');

  useEffect(() => {
    window.electronAPI.getEvents().then((config) => {
      setEvents(config.events.map((e) => ({ ...e, enabled: true })));
    });
  }, []);

  const handleWarningChange = useCallback((eventIdx: number, value: string) => {
    setEvents((prev) => {
      const updated = [...prev];
      const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
      updated[eventIdx] = {
        ...updated[eventIdx],
        warnings: parts.map((p) => ({ offsetSeconds: Math.max(1, Number(p) || 1) })),
      };
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

  const handleMaxOccurrencesChange = useCallback((eventIdx: number, value: string) => {
    setEvents((prev) => {
      const updated = [...prev];
      const numVal = parseInt(value, 10);
      updated[eventIdx] = { ...updated[eventIdx], maxOccurrences: numVal > 0 ? numVal : undefined };
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

  const handleRemoveEvent = useCallback((eventIdx: number) => {
    setEvents((prev) => prev.filter((_, i) => i !== eventIdx));
    setDirty(true);
  }, []);

  const handleAddEvent = useCallback(() => {
    setAddError('');
    const name = newName.trim();
    if (!name) {
      setAddError('Name is required.');
      return;
    }
    const id = nameToId(name);
    if (!id) {
      setAddError('Name must contain alphanumeric characters.');
      return;
    }
    if (events.some((e) => e.id === id)) {
      setAddError(`Event "${id}" already exists.`);
      return;
    }
    const newEvent: EditableEvent = {
      id,
      name,
      spawnTime: 0,
      enabled: true,
      warnings: [{ offsetSeconds: 30 }],
    };
    setEvents((prev) => [...prev, newEvent]);
    setNewName('');
    setShowAdd(false);
    setDirty(true);
  }, [newName, events]);

  const handleApply = useCallback(async () => {
    const enabledEvents = events.filter((e) => e.enabled);
    const config: EventsConfig = {
      events: enabledEvents.map(({ enabled: _e, ...rest }) => rest),
    };
    const result = await window.electronAPI.saveEvents(config);
    if (result.success) {
      eventScheduler.loadSchedule(config);
      setDirty(false);
    }
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
            onClick={() => setShowAdd(!showAdd)}
            className="px-3 py-1.5 rounded text-xs font-medium bg-green-600/20 text-green-400 border border-green-500/40 hover:bg-green-600/30 transition-colors"
          >
            {showAdd ? 'Cancel' : '+ Add'}
          </button>
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
            Apply & Save
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="p-3 rounded bg-dota-black/40 border border-green-500/20 space-y-2">
          {addError && <p className="text-red-400 text-xs">{addError}</p>}
          <div className="flex gap-2 items-end">
            <label className="flex-1 space-y-1">
              <span className="text-dota-grey/70 text-xs">Event Name</span>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Siege Creep"
                onKeyDown={(e) => e.key === 'Enter' && handleAddEvent()}
                className="w-full px-2 py-1.5 rounded text-xs bg-dota-black border border-dota-gold/30 text-dota-grey placeholder-dota-grey/50 focus:border-dota-gold/60 outline-none"
              />
            </label>
            {newName.trim() && (
              <span className="text-xs text-dota-grey/50 font-mono pb-1.5">
                id: {nameToId(newName.trim())}
              </span>
            )}
            <button
              onClick={handleAddEvent}
              className="px-3 py-1.5 rounded text-xs font-medium bg-green-600/30 text-green-300 border border-green-500/40 hover:bg-green-600/40 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-[55vh] overflow-y-auto">
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
              <div className="flex items-center gap-3">
                <span className="text-xs text-dota-grey/50 font-mono">{event.id}</span>
                <button
                  onClick={() => handleRemoveEvent(idx)}
                  className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                  title="Remove event"
                >
                  ✕
                </button>
              </div>
            </div>

            {event.enabled && (
              <div className="grid grid-cols-4 gap-3 text-xs">
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
                  <span className="text-dota-grey/70">Max Iterations</span>
                  <input
                    type="number"
                    min="0"
                    value={event.maxOccurrences ?? 0}
                    onChange={(e) => handleMaxOccurrencesChange(idx, e.target.value)}
                    placeholder="∞"
                    className="w-full bg-dota-black/60 text-dota-grey border border-dota-gold/20 rounded px-2 py-1"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-dota-grey/70">Warnings (s)</span>
                  <input
                    type="text"
                    value={(event.warnings ?? []).map((w) => w.offsetSeconds).join(', ')}
                    onChange={(e) => handleWarningChange(idx, e.target.value)}
                    placeholder="60, 30"
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
