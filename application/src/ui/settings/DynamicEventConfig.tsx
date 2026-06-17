import { useState, useEffect, useCallback, useRef } from 'react';
import { DynamicEventConfig as DynamicEventConfigType } from 'src/config/events.schema';

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
  'hero-items:acquired': 'Notify when hero acquires a new item',
  'hero-items:sold': 'Notify when hero sells an item',
};

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
        </div>
      ))}
    </div>
  );
}
