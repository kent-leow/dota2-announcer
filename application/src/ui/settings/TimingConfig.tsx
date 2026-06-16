import { useState, useEffect, useCallback, useRef } from 'react';
import { GameEvent, EventsConfig } from 'src/config/events.schema';
import { PLACEHOLDER_ICON, DEFAULT_EVENT_ICONS } from 'src/config/defaultIcons';
import { IconCropDialog } from './IconCropDialog';

interface EditableEvent extends GameEvent {
  enabled: boolean;
}

function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

import { NotificationOverlayConfig, PersistentOverlayConfig, OverlayPosition } from 'src/renderer/electron.d';

export function TimingConfig() {
  const [events, setEvents] = useState<EditableEvent[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [notifConfig, setNotifConfig] = useState<NotificationOverlayConfig>({ enabled: true, position: 'right', fontSize: { name: 16, offset: 13 } });
  const [persistConfig, setPersistConfig] = useState<PersistentOverlayConfig>({ enabled: false, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5 });
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropTargetId, setCropTargetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.electronAPI.getEvents().then((config) => {
      setEvents(config.events.map((e) => ({ ...e, enabled: true })));
    });
    window.electronAPI.getNotificationConfig().then(setNotifConfig);
    window.electronAPI.getPersistentConfig().then(setPersistConfig);
  }, []);

  const saveEvents = useCallback((updated: EditableEvent[]) => {
    const enabledEvents = updated.filter((e) => e.enabled);
    const config: EventsConfig = {
      events: enabledEvents.map(({ enabled: _e, ...rest }) => rest),
    };
    window.electronAPI.saveEvents(config);
  }, []);

  const commitField = useCallback((eventIdx: number, field: string, value: string) => {
    setEvents((prev) => {
      const updated = [...prev];
      const event = { ...updated[eventIdx] };
      if (field === 'spawnTime') {
        event.spawnTime = Math.max(0, Number(value) || 0);
      } else if (field === 'repeatEvery') {
        const numVal = Number(value) || 0;
        event.repeatEvery = numVal > 0 ? numVal : undefined;
      } else if (field === 'maxOccurrences') {
        const numVal = parseInt(value, 10);
        event.maxOccurrences = numVal > 0 ? numVal : undefined;
      } else if (field === 'warnings') {
        const parts = value.split(',').map((s) => s.trim()).filter((s) => s !== '');
        event.warnings = parts
          .map((p) => Number(p))
          .filter((n) => !isNaN(n) && n >= 0)
          .map((n) => ({ offsetSeconds: n }));
      }
      updated[eventIdx] = event;
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  const handleToggleEvent = useCallback((eventIdx: number) => {
    setEvents((prev) => {
      const updated = [...prev];
      updated[eventIdx] = { ...updated[eventIdx], enabled: !updated[eventIdx].enabled };
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  const handleRemoveEvent = useCallback((eventIdx: number) => {
    setEvents((prev) => {
      const updated = prev.filter((_, i) => i !== eventIdx);
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

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
      warnings: [{ offsetSeconds: 0 }],
    };
    setEvents((prev) => {
      const updated = [...prev, newEvent];
      saveEvents(updated);
      return updated;
    });
    setNewName('');
    setShowAdd(false);
  }, [newName, events, saveEvents]);

  const handleReload = useCallback(() => {
    window.electronAPI.reloadEvents().then((config) => {
      setEvents(config.events.map((e) => ({ ...e, enabled: true })));
    });
  }, []);

  const updateNotifConfig = useCallback((patch: Partial<NotificationOverlayConfig>) => {
    setNotifConfig((prev) => ({ ...prev, ...patch }));
    window.electronAPI.setNotificationConfig(patch);
  }, []);

  const updatePersistConfig = useCallback((patch: Partial<PersistentOverlayConfig>) => {
    setPersistConfig((prev) => ({ ...prev, ...patch }));
    window.electronAPI.setPersistentConfig(patch);
  }, []);

  const handleIconUpload = useCallback((eventId: string) => {
    setCropTargetId(eventId);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropFile(file);
    }
    e.target.value = '';
  }, []);

  const handleCropConfirm = useCallback((dataUri: string) => {
    if (!cropTargetId) return;
    setEvents((prev) => {
      const updated = prev.map((ev) =>
        ev.id === cropTargetId ? { ...ev, icon: dataUri } : ev
      );
      saveEvents(updated);
      return updated;
    });
    setCropFile(null);
    setCropTargetId(null);
  }, [cropTargetId, saveEvents]);

  const handleCropCancel = useCallback(() => {
    setCropFile(null);
    setCropTargetId(null);
  }, []);

  const handleRemoveIcon = useCallback((eventId: string) => {
    setEvents((prev) => {
      const updated = prev.map((ev) =>
        ev.id === eventId ? { ...ev, icon: undefined } : ev
      );
      saveEvents(updated);
      return updated;
    });
  }, [saveEvents]);

  return (
    <div className="bg-dota-dark rounded-lg p-4 space-y-4 flex-1 flex flex-col min-h-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        className="hidden"
        data-testid="icon-file-input"
        onChange={handleFileChange}
      />
      <div className="space-y-3 border-b border-dota-gold/10 pb-3">
        <h3 className="text-dota-gold text-xs font-semibold uppercase tracking-wide">Notification Overlay</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dota-grey/70">Enabled</span>
          <button
            data-testid="notif-enabled"
            onClick={() => updateNotifConfig({ enabled: !notifConfig.enabled })}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              notifConfig.enabled
                ? 'bg-dota-green/30 text-dota-green border border-dota-green/60'
                : 'bg-dota-black/40 text-dota-grey/60 border border-dota-grey/20'
            }`}
          >
            {notifConfig.enabled ? 'On' : 'Off'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dota-grey/70">Position</span>
          <div className="flex gap-1">
            {(['left', 'right'] as OverlayPosition[]).map((pos) => (
              <button
                key={pos}
                data-testid={`notif-pos-${pos}`}
                onClick={() => updateNotifConfig({ position: pos })}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  notifConfig.position === pos
                    ? 'bg-dota-gold/30 text-dota-gold border border-dota-gold/60'
                    : 'bg-dota-black/40 text-dota-grey/60 border border-dota-grey/20 hover:border-dota-gold/30'
                }`}
              >
                {pos === 'left' ? 'Left' : 'Right'}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3">
          <span className="text-xs text-dota-grey/70 w-24">Event Font</span>
          <input type="range" min="10" max="32" value={notifConfig.fontSize.name}
            onChange={(e) => updateNotifConfig({ fontSize: { ...notifConfig.fontSize, name: Number(e.target.value) } })}
            className="flex-1 h-1.5 rounded-full appearance-none bg-dota-grey/20 accent-dota-gold cursor-pointer" />
          <span className="text-xs text-dota-grey w-10 text-right">{notifConfig.fontSize.name}px</span>
        </label>
        <label className="flex items-center gap-3">
          <span className="text-xs text-dota-grey/70 w-24">Timer Font</span>
          <input type="range" min="8" max="28" value={notifConfig.fontSize.offset}
            onChange={(e) => updateNotifConfig({ fontSize: { ...notifConfig.fontSize, offset: Number(e.target.value) } })}
            className="flex-1 h-1.5 rounded-full appearance-none bg-dota-grey/20 accent-dota-gold cursor-pointer" />
          <span className="text-xs text-dota-grey w-10 text-right">{notifConfig.fontSize.offset}px</span>
        </label>
      </div>

      <div className="space-y-3 border-b border-dota-gold/10 pb-3">
        <h3 className="text-dota-gold text-xs font-semibold uppercase tracking-wide">Persistent Overlay</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dota-grey/70">Enabled</span>
          <button
            data-testid="persist-enabled"
            onClick={() => updatePersistConfig({ enabled: !persistConfig.enabled })}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              persistConfig.enabled
                ? 'bg-dota-green/30 text-dota-green border border-dota-green/60'
                : 'bg-dota-black/40 text-dota-grey/60 border border-dota-grey/20'
            }`}
          >
            {persistConfig.enabled ? 'On' : 'Off'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dota-grey/70">Position</span>
          <div className="flex gap-1">
            {(['left', 'right'] as OverlayPosition[]).map((pos) => (
              <button
                key={pos}
                data-testid={`persist-pos-${pos}`}
                onClick={() => updatePersistConfig({ position: pos })}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  persistConfig.position === pos
                    ? 'bg-dota-gold/30 text-dota-gold border border-dota-gold/60'
                    : 'bg-dota-black/40 text-dota-grey/60 border border-dota-grey/20 hover:border-dota-gold/30'
                }`}
              >
                {pos === 'left' ? 'Left' : 'Right'}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3">
          <span className="text-xs text-dota-grey/70 w-24">Event Font</span>
          <input type="range" min="10" max="32" value={persistConfig.fontSize.name}
            onChange={(e) => updatePersistConfig({ fontSize: { ...persistConfig.fontSize, name: Number(e.target.value) } })}
            className="flex-1 h-1.5 rounded-full appearance-none bg-dota-grey/20 accent-dota-gold cursor-pointer" />
          <span className="text-xs text-dota-grey w-10 text-right">{persistConfig.fontSize.name}px</span>
        </label>
        <label className="flex items-center gap-3">
          <span className="text-xs text-dota-grey/70 w-24">Timer Font</span>
          <input type="range" min="8" max="28" value={persistConfig.fontSize.offset}
            onChange={(e) => updatePersistConfig({ fontSize: { ...persistConfig.fontSize, offset: Number(e.target.value) } })}
            className="flex-1 h-1.5 rounded-full appearance-none bg-dota-grey/20 accent-dota-gold cursor-pointer" />
          <span className="text-xs text-dota-grey w-10 text-right">{persistConfig.fontSize.offset}px</span>
        </label>
        <label className="flex items-center gap-3">
          <span className="text-xs text-dota-grey/70 w-24">Events Shown</span>
          <input
            data-testid="event-count"
            type="number"
            min="1"
            max="10"
            value={persistConfig.eventCount}
            onChange={(e) => updatePersistConfig({ eventCount: Math.max(1, Math.min(10, Number(e.target.value) || 1)) })}
            className="w-16 px-2 py-1 rounded text-xs bg-dota-black border border-dota-gold/20 text-dota-grey"
          />
        </label>
      </div>
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

      <div className="space-y-2 flex-1 overflow-y-auto min-h-0">
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
                <div className="flex items-center gap-2">
                  <img
                    src={event.icon || DEFAULT_EVENT_ICONS[event.id] || PLACEHOLDER_ICON}
                    alt=""
                    width={24}
                    height={24}
                    className="rounded-sm"
                    data-testid={`event-icon-${event.id}`}
                  />
                  <button
                    onClick={(e) => { e.preventDefault(); handleIconUpload(event.id); }}
                    className="text-dota-gold/60 hover:text-dota-gold text-xs transition-colors"
                    title="Upload icon"
                    data-testid={`upload-icon-${event.id}`}
                  >
                    ↑
                  </button>
                  {event.icon && (
                    <button
                      onClick={(e) => { e.preventDefault(); handleRemoveIcon(event.id); }}
                      className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                      title="Remove custom icon"
                      data-testid={`remove-icon-${event.id}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
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
              <>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <label className="space-y-1">
                    <span className="text-dota-grey/70">Spawn (s)</span>
                    <input
                      type="number"
                      min="0"
                      key={`${event.id}-spawn`}
                      defaultValue={event.spawnTime}
                      onBlur={(e) => commitField(idx, 'spawnTime', e.target.value)}
                      className="w-full bg-dota-black/60 text-dota-grey border border-dota-gold/20 rounded px-2 py-1"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-dota-grey/70">Repeat (s)</span>
                    <input
                      type="number"
                      min="0"
                      key={`${event.id}-repeat`}
                      defaultValue={event.repeatEvery ?? 0}
                      onBlur={(e) => commitField(idx, 'repeatEvery', e.target.value)}
                      className="w-full bg-dota-black/60 text-dota-grey border border-dota-gold/20 rounded px-2 py-1"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-dota-grey/70">Max Iterations</span>
                    <input
                      type="number"
                      min="0"
                      key={`${event.id}-max`}
                      defaultValue={event.maxOccurrences ?? 0}
                      onBlur={(e) => commitField(idx, 'maxOccurrences', e.target.value)}
                      placeholder="∞"
                      className="w-full bg-dota-black/60 text-dota-grey border border-dota-gold/20 rounded px-2 py-1"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-dota-grey/70">Warnings (s)</span>
                    <input
                      type="text"
                      key={`${event.id}-warn`}
                      defaultValue={(event.warnings ?? []).map((w) => w.offsetSeconds).join(', ')}
                      onBlur={(e) => commitField(idx, 'warnings', e.target.value)}
                      placeholder="60, 30, 0"
                      className="w-full bg-dota-black/60 text-dota-grey border border-dota-gold/20 rounded px-2 py-1"
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {cropFile && (
        <IconCropDialog
          imageFile={cropFile}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
