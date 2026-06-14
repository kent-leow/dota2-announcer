import { useState, useEffect, useCallback } from 'react';
import { GameEvent, EventsConfig } from 'src/config/events.schema';

interface NewEventForm {
  id: string;
  name: string;
  spawnTime: string;
  repeatEvery: string;
  warnings: string;
}

const EMPTY_FORM: NewEventForm = { id: '', name: '', spawnTime: '', repeatEvery: '', warnings: '60,30' };

export function EventConfigPanel() {
  const [config, setConfig] = useState<EventsConfig>({ events: [] });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewEventForm>(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    window.electronAPI.getEvents().then(setConfig);
  }, []);

  const handleReload = useCallback(() => {
    window.electronAPI.reloadEvents().then(setConfig);
  }, []);

  const handleAdd = useCallback(async () => {
    setError('');
    const spawnTime = parseInt(form.spawnTime, 10);
    if (!form.id.trim() || !form.name.trim() || isNaN(spawnTime) || spawnTime < 0) {
      setError('ID, Name, and valid Spawn Time are required.');
      return;
    }

    if (config.events.some((e) => e.id === form.id.trim())) {
      setError('An event with this ID already exists.');
      return;
    }

    const newEvent: GameEvent = {
      id: form.id.trim(),
      name: form.name.trim(),
      spawnTime,
    };

    const repeatEvery = parseInt(form.repeatEvery, 10);
    if (!isNaN(repeatEvery) && repeatEvery > 0) {
      newEvent.repeatEvery = repeatEvery;
    }

    const warnings = form.warnings
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0);
    if (warnings.length > 0) {
      newEvent.warnings = warnings.map((offsetSeconds) => ({ offsetSeconds }));
    }

    const updated: EventsConfig = { events: [...config.events, newEvent] };
    const result = await window.electronAPI.saveEvents(updated);
    if (result.success && result.config) {
      setConfig(result.config);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } else {
      setError(result.error || 'Failed to save.');
    }
  }, [form, config]);

  const handleRemove = useCallback(async (id: string) => {
    const updated: EventsConfig = { events: config.events.filter((e) => e.id !== id) };
    const result = await window.electronAPI.saveEvents(updated);
    if (result.success && result.config) {
      setConfig(result.config);
    }
  }, [config]);

  return (
    <div className="bg-dota-dark rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-dota-gold text-sm font-semibold uppercase tracking-wide">Loaded Events</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 rounded text-xs font-medium bg-green-600/20 text-green-400 border border-green-500/40 hover:bg-green-600/30 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Add Event'}
          </button>
          <button
            onClick={handleReload}
            className="px-3 py-1.5 rounded text-xs font-medium bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30 transition-colors"
          >
            Reload Events
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-4 p-3 rounded bg-dota-black/40 border border-dota-gold/20 space-y-2">
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="ID (e.g. my-event)"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="px-2 py-1.5 rounded text-xs bg-dota-black border border-dota-gold/30 text-dota-grey placeholder-dota-grey/50 focus:border-dota-gold/60 outline-none"
            />
            <input
              placeholder="Name (e.g. My Event)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-2 py-1.5 rounded text-xs bg-dota-black border border-dota-gold/30 text-dota-grey placeholder-dota-grey/50 focus:border-dota-gold/60 outline-none"
            />
            <input
              placeholder="Spawn Time (seconds)"
              value={form.spawnTime}
              onChange={(e) => setForm({ ...form, spawnTime: e.target.value })}
              className="px-2 py-1.5 rounded text-xs bg-dota-black border border-dota-gold/30 text-dota-grey placeholder-dota-grey/50 focus:border-dota-gold/60 outline-none"
              type="number"
              min="0"
            />
            <input
              placeholder="Repeat Every (seconds, optional)"
              value={form.repeatEvery}
              onChange={(e) => setForm({ ...form, repeatEvery: e.target.value })}
              className="px-2 py-1.5 rounded text-xs bg-dota-black border border-dota-gold/30 text-dota-grey placeholder-dota-grey/50 focus:border-dota-gold/60 outline-none"
              type="number"
              min="1"
            />
          </div>
          <input
            placeholder="Warnings (comma-separated seconds, e.g. 60,30)"
            value={form.warnings}
            onChange={(e) => setForm({ ...form, warnings: e.target.value })}
            className="w-full px-2 py-1.5 rounded text-xs bg-dota-black border border-dota-gold/30 text-dota-grey placeholder-dota-grey/50 focus:border-dota-gold/60 outline-none"
          />
          <button
            onClick={handleAdd}
            className="px-3 py-1.5 rounded text-xs font-medium bg-green-600/30 text-green-300 border border-green-500/40 hover:bg-green-600/40 transition-colors"
          >
            Save Event
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-dota-gold/20">
              <th className="text-left py-2 px-2 text-dota-gold font-medium">ID</th>
              <th className="text-left py-2 px-2 text-dota-gold font-medium">Name</th>
              <th className="text-left py-2 px-2 text-dota-gold font-medium">Spawn Time</th>
              <th className="text-left py-2 px-2 text-dota-gold font-medium">Warnings</th>
              <th className="text-right py-2 px-2 text-dota-gold font-medium">Actions</th>
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
                <td className="py-2 px-2 text-right">
                  <button
                    onClick={() => handleRemove(event.id)}
                    className="text-red-400/70 hover:text-red-400 text-xs transition-colors"
                    title="Remove event"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
