import { useState, useEffect } from 'react';
import { logEvent, clearEvent, clearAll, getStatus } from 'src/tracker/gameStatusTracker';
import { GameStatusState, TrackedEventType } from 'src/tracker/gameStatusTypes';
import { StatusRow } from './StatusRow';

const EVENT_LABELS: { type: TrackedEventType; label: string }[] = [
  { type: 'roshan', label: 'Roshan' },
  { type: 'buyback', label: 'Buyback' },
  { type: 'glyph', label: 'Glyph' },
];

export function GameStatusPanel() {
  const [status, setStatus] = useState<GameStatusState>(getStatus());
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const unsubTick = window.electronAPI.onClockTick((ms) => {
      setElapsed(ms);
    });

    const unsubState = window.electronAPI.onStateChange((newState) => {
      if (newState === 'idle') {
        clearAll();
        setStatus(getStatus());
      }
    });

    return () => {
      unsubTick();
      unsubState();
    };
  }, []);

  const handleLog = (type: TrackedEventType) => {
    logEvent(type, elapsed);
    setStatus(getStatus());
  };

  const handleClear = (type: TrackedEventType) => {
    clearEvent(type);
    setStatus(getStatus());
  };

  return (
    <div data-testid="game-status-panel" className="bg-dota-dark rounded-lg p-4">
      <h3 className="text-dota-gold text-sm font-semibold mb-3 uppercase tracking-wide">Game Status</h3>
      <div className="space-y-2">
        {EVENT_LABELS.map(({ type, label }) => (
          <StatusRow
            key={type}
            label={label}
            tracked={status[type]}
            elapsedMs={elapsed}
            onLog={() => handleLog(type)}
            onClear={() => handleClear(type)}
          />
        ))}
      </div>
    </div>
  );
}
