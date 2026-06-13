import { useState, useEffect, useCallback } from 'react';
import { GameEvent, EventsConfig } from 'src/config/events.schema';
import * as soundPlayer from 'src/tts/soundPlayer';
import { SoundAssignment, SoundAssignments } from 'src/renderer/electron.d';

interface EditableEvent extends GameEvent {
  enabled: boolean;
}

function nameToId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type OverlayPosition = 'left-center' | 'right-center';
type OverlayMode = 'notification' | 'persistent';

export function TimingConfig() {
  const [events, setEvents] = useState<EditableEvent[]>([]);
  const [dirty, setDirty] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [soundAssignments, setSoundAssignments] = useState<SoundAssignments>({});
  const [soundDisabled, setSoundDisabled] = useState<Record<string, boolean>>({});
  const [soundError, setSoundError] = useState('');
  const [overlayPosition, setOverlayPosition] = useState<OverlayPosition>('right-center');
  const [fontSizeName, setFontSizeName] = useState(16);
  const [fontSizeOffset, setFontSizeOffset] = useState(13);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('notification');
  const [overlayEventCount, setOverlayEventCount] = useState(5);

  useEffect(() => {
    window.electronAPI.getEvents().then((config) => {
      setEvents(config.events.map((e) => ({ ...e, enabled: true })));
    });
    window.electronAPI.getSoundAssignments().then(setSoundAssignments);
    window.electronAPI.getSoundDisabled().then(setSoundDisabled);
    window.electronAPI.getOverlayPosition().then(setOverlayPosition);
    window.electronAPI.getOverlayFontSize().then((fs) => {
      setFontSizeName(fs.name);
      setFontSizeOffset(fs.offset);
    });
    window.electronAPI.getOverlayMode().then((m) => setOverlayMode(m as OverlayMode));
    window.electronAPI.getOverlayEventCount().then(setOverlayEventCount);
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
      setDirty(false);
    }
  }, [events]);

  const handleReload = useCallback(() => {
    window.electronAPI.reloadEvents().then((config) => {
      setEvents(config.events.map((e) => ({ ...e, enabled: true })));
      setDirty(false);
    });
  }, []);

  const handleSoundToggle = useCallback(async (eventId: string) => {
    const newDisabled = !soundDisabled[eventId];
    await window.electronAPI.setSoundDisabled(eventId, newDisabled);
    setSoundDisabled((prev) => ({ ...prev, [eventId]: newDisabled }));
  }, [soundDisabled]);

  const handleSoundUpload = useCallback(async (eventId: string) => {
    setSoundError('');
    const dialogResult = await window.electronAPI.openSoundFileDialog();
    if (!dialogResult.success || dialogResult.canceled || !dialogResult.filePath) return;

    const result = await window.electronAPI.assignSound(eventId, dialogResult.filePath);
    if (!result.success) {
      setSoundError(result.error || 'Failed to assign sound');
      return;
    }
    const updated = await window.electronAPI.getSoundAssignments();
    setSoundAssignments(updated);
  }, []);

  const handleSoundRemove = useCallback(async (eventId: string) => {
    await window.electronAPI.removeSound(eventId);
    const updated = await window.electronAPI.getSoundAssignments();
    setSoundAssignments(updated);
  }, []);

  const handleSoundPreview = useCallback(async (eventId: string) => {
    const filePath = await window.electronAPI.getSoundFilePath(eventId);
    if (filePath) {
      soundPlayer.playSound(filePath);
    }
  }, []);

  const handleOverlayPositionChange = useCallback((pos: OverlayPosition) => {
    setOverlayPosition(pos);
    window.electronAPI.setOverlayPosition(pos);
  }, []);

  const handleFontSizeNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setFontSizeName(val);
    window.electronAPI.setOverlayFontSize({ name: val, offset: fontSizeOffset });
  }, [fontSizeOffset]);

  const handleFontSizeOffsetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setFontSizeOffset(val);
    window.electronAPI.setOverlayFontSize({ name: fontSizeName, offset: val });
  }, [fontSizeName]);

  const handleOverlayModeChange = useCallback((mode: OverlayMode) => {
    setOverlayMode(mode);
    window.electronAPI.setOverlayMode(mode);
  }, []);

  const handleOverlayEventCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Math.min(10, Number(e.target.value) || 1));
    setOverlayEventCount(val);
    window.electronAPI.setOverlayEventCount(val);
  }, []);

  return (
    <div className="bg-dota-dark rounded-lg p-4 space-y-4 flex-1 flex flex-col min-h-0">
      <div className="space-y-3 border-b border-dota-gold/10 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-dota-grey/70">Overlay Position</span>
          <div className="flex gap-1">
            {(['left-center', 'right-center'] as OverlayPosition[]).map((pos) => (
              <button
                key={pos}
                onClick={() => handleOverlayPositionChange(pos)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  overlayPosition === pos
                    ? 'bg-dota-gold/30 text-dota-gold border border-dota-gold/60'
                    : 'bg-dota-black/40 text-dota-grey/60 border border-dota-grey/20 hover:border-dota-gold/30'
                }`}
              >
                {pos === 'left-center' ? 'Left' : 'Right'}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3">
          <span className="text-xs text-dota-grey/70 w-24">Event Font</span>
          <input
            type="range"
            min="10"
            max="32"
            value={fontSizeName}
            onChange={handleFontSizeNameChange}
            className="flex-1 h-1.5 rounded-full appearance-none bg-dota-grey/20 accent-dota-gold cursor-pointer"
          />
          <span className="text-xs text-dota-grey w-10 text-right">{fontSizeName}px</span>
        </label>
        <label className="flex items-center gap-3">
          <span className="text-xs text-dota-grey/70 w-24">Timer Font</span>
          <input
            type="range"
            min="8"
            max="28"
            value={fontSizeOffset}
            onChange={handleFontSizeOffsetChange}
            className="flex-1 h-1.5 rounded-full appearance-none bg-dota-grey/20 accent-dota-gold cursor-pointer"
          />
          <span className="text-xs text-dota-grey w-10 text-right">{fontSizeOffset}px</span>
        </label>
        <div className="flex items-center justify-between">
          <span className="text-xs text-dota-grey/70">Overlay Mode</span>
          <div className="flex gap-1">
            {(['notification', 'persistent'] as OverlayMode[]).map((m) => (
              <button
                key={m}
                data-testid={`mode-${m}`}
                onClick={() => handleOverlayModeChange(m)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  overlayMode === m
                    ? 'bg-dota-gold/30 text-dota-gold border border-dota-gold/60'
                    : 'bg-dota-black/40 text-dota-grey/60 border border-dota-grey/20 hover:border-dota-gold/30'
                }`}
              >
                {m === 'notification' ? 'Notification' : 'Persistent'}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3">
          <span className="text-xs text-dota-grey/70 w-24">Events Shown</span>
          <input
            data-testid="event-count"
            type="number"
            min="1"
            max="10"
            value={overlayEventCount}
            onChange={handleOverlayEventCountChange}
            disabled={overlayMode !== 'persistent'}
            className="w-16 px-2 py-1 rounded text-xs bg-dota-black border border-dota-gold/20 text-dota-grey disabled:opacity-40"
          />
          <span className="text-xs text-dota-grey/50">(persistent mode)</span>
        </label>
      </div>
      {soundError && (
        <p data-testid="sound-error" className="text-red-400 text-xs bg-red-400/10 rounded px-3 py-2">{soundError}</p>
      )}
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
                <div data-testid={`sound-row-${event.id}`} className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-dota-grey/70 w-12">Sound</span>
                  <button
                    data-testid={`sound-toggle-${event.id}`}
                    onClick={() => handleSoundToggle(event.id)}
                    className={`px-2 py-0.5 rounded transition-colors ${
                      soundDisabled[event.id]
                        ? 'bg-dota-gold/20 text-dota-gold border border-dota-gold/40'
                        : 'bg-dota-green/20 text-dota-green border border-dota-green/40'
                    }`}
                  >
                    {soundDisabled[event.id] ? 'TTS' : 'SFX'}
                  </button>
                  <span className="text-dota-grey/50 flex-1 truncate">
                    {soundDisabled[event.id]
                      ? 'Using TTS announcer'
                      : soundAssignments[event.id]
                        ? `${soundAssignments[event.id].filename} ${soundAssignments[event.id].type === 'bundled' ? '(default)' : '(custom)'}`
                        : 'None (TTS)'}
                  </span>
                  {!soundDisabled[event.id] && soundAssignments[event.id] && (
                    <button
                      data-testid={`preview-${event.id}`}
                      onClick={() => handleSoundPreview(event.id)}
                      className="px-2 py-0.5 rounded bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30 transition-colors"
                    >
                      Play
                    </button>
                  )}
                  {!soundDisabled[event.id] && (
                    <button
                      data-testid={`upload-${event.id}`}
                      onClick={() => handleSoundUpload(event.id)}
                      className="px-2 py-0.5 rounded bg-green-600/20 text-green-400 border border-green-500/40 hover:bg-green-600/30 transition-colors"
                    >
                      Upload
                    </button>
                  )}
                  {!soundDisabled[event.id] && soundAssignments[event.id] && soundAssignments[event.id].type === 'custom' && (
                    <button
                      data-testid={`remove-${event.id}`}
                      onClick={() => handleSoundRemove(event.id)}
                      className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/40 hover:bg-red-600/30 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
