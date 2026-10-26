import { useState, useEffect, useCallback, useRef } from 'react';
import { DynamicEventConfig as DynamicEventConfigType } from 'src/config/events.schema';
import { LEAD_SECONDS, ENGAGE_DISTANCE, MAX_FOG_SECONDS, MAP_AWARENESS_EVENT_ID } from 'src/dota/mapAwareness/constants';
import { clampSetting } from 'src/dota/mapAwareness/settings';

function InfoTip({ text, testId }: { text: string; testId: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-dota-grey/20 text-dota-grey/60 hover:bg-dota-grey/30 hover:text-dota-grey text-[9px] leading-none font-bold transition-colors"
        data-testid={testId}
      >
        ?
      </button>
      {open && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-dota-black border border-dota-gold/30 text-dota-grey text-[10px] whitespace-nowrap shadow-lg z-10">
          {text}
        </span>
      )}
    </span>
  );
}

const NOTIFICATION_TOOLTIPS: Record<string, string> = {
  'roshan:kill': 'Notify when Roshan is killed',
  'roshan:countdown': 'Notify when Roshan may respawn (8 min mark)',
  'roshan:respawn': 'Notify when Roshan has respawned',
  'map-awareness:visible': 'Warn when a visible enemy is closing in',
  'map-awareness:fog': 'Warn when an enemy that vanished into fog could reach you',
};

interface SettingField {
  label: string;
  range: { default: number; min: number; max: number };
  step: number;
}

const SETTING_FIELDS: Record<string, SettingField> = {
  [`${MAP_AWARENESS_EVENT_ID}:leadSeconds`]: { label: 'Warn before (s)', range: LEAD_SECONDS, step: 1 },
  [`${MAP_AWARENESS_EVENT_ID}:engageDistance`]: { label: 'Engage distance', range: ENGAGE_DISTANCE, step: 50 },
  [`${MAP_AWARENESS_EVENT_ID}:maxFogSeconds`]: { label: 'Track in fog for (s)', range: MAX_FOG_SECONDS, step: 1 },
};

const EVENT_NOTES: Record<string, string> = {
  [MAP_AWARENESS_EVENT_ID]: 'Uses only what your team can see. Blink, teleports and invisibility in fog can arrive earlier than predicted.',
};

function SettingInput({ eventId, settingKey, value, onCommit }: {
  eventId: string;
  settingKey: string;
  value: number;
  onCommit: (value: number) => void;
}) {
  const field = SETTING_FIELDS[`${eventId}:${settingKey}`];
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  if (!field) return null;

  const commit = () => {
    const parsed = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = clampSetting(parsed, field.range);
    setDraft(String(clamped));
    if (clamped !== value) onCommit(clamped);
  };

  return (
    <label className="flex items-center gap-1.5">
      <span className="text-dota-grey/70">{field.label}</span>
      <input
        type="number"
        min={field.range.min}
        max={field.range.max}
        step={field.step}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
        data-testid={`dynamic-setting-${eventId}-${settingKey}`}
        className="w-16 px-1 py-0.5 rounded bg-dota-black/40 border border-dota-grey/20 text-dota-grey text-xs"
      />
    </label>
  );
}

function RecordMatchesControl() {
  const [recordMatches, setRecordMatches] = useState<boolean | null>(null);

  useEffect(() => {
    window.electronAPI.getRecordMatches().then(setRecordMatches);
  }, []);

  const toggle = useCallback(() => {
    if (recordMatches === null) return;
    const next = !recordMatches;
    setRecordMatches(next);
    window.electronAPI.setRecordMatches(next);
  }, [recordMatches]);

  return (
    <div className="flex items-center justify-between text-xs">
      <label className="flex items-center gap-1.5 cursor-pointer">
        <input
          type="checkbox"
          checked={recordMatches === true}
          disabled={recordMatches === null}
          onChange={toggle}
          data-testid="dynamic-record-matches-toggle"
          className="accent-dota-gold cursor-pointer"
        />
        <span className="text-dota-grey/70">Record matches (for map-awareness tuning)</span>
        <InfoTip text="Saves your hero positions and visible enemy positions each match. Stored locally only." testId="dynamic-record-matches-info" />
      </label>
      <button
        type="button"
        onClick={() => window.electronAPI.openRecordingsFolder()}
        data-testid="dynamic-open-recordings"
        className="px-2 py-1 rounded text-xs bg-dota-black/40 text-dota-grey/80 border border-dota-grey/20 hover:border-dota-gold/40"
      >
        Open recordings folder
      </button>
    </div>
  );
}

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

  const toggleNotification = useCallback((idx: number, key: string) => {
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

  const updateSetting = useCallback((idx: number, key: string, value: number) => {
    setEvents((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        settings: { ...updated[idx].settings, [key]: value },
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
              {Object.keys(event.notifications).map((key) => (
                <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={event.notifications[key]}
                    onChange={() => toggleNotification(idx, key)}
                    data-testid={`dynamic-notif-${event.id}-${key}`}
                    className="accent-dota-gold cursor-pointer"
                  />
                  <span className="text-dota-grey/70 capitalize">{key}</span>
                  <InfoTip text={NOTIFICATION_TOOLTIPS[`${event.id}:${key}`] || `Toggle ${key} notifications`} testId={`dynamic-info-${event.id}-${key}`} />
                </label>
              ))}
            </div>
          )}
          {event.enabled && event.settings && (
            <div className="flex flex-wrap gap-3 text-xs">
              {Object.entries(event.settings).map(([key, value]) => (
                <SettingInput
                  key={key}
                  eventId={event.id}
                  settingKey={key}
                  value={value}
                  onCommit={(v) => updateSetting(idx, key, v)}
                />
              ))}
            </div>
          )}
          {event.enabled && EVENT_NOTES[event.id] && (
            <p className="text-[10px] text-dota-grey/50" data-testid={`dynamic-note-${event.id}`}>{EVENT_NOTES[event.id]}</p>
          )}
        </div>
      ))}
      <RecordMatchesControl />
    </div>
  );
}
