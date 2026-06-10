import { TrackedEvent, Deadline } from 'src/tracker/gameStatusTypes';

interface StatusRowProps {
  label: string;
  tracked: TrackedEvent | null;
  elapsedMs: number;
  onLog: () => void;
  onClear: () => void;
}

function formatGameTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatCountdown(deadlineMs: number, currentMs: number): string {
  const remaining = Math.max(0, Math.floor((deadlineMs - currentMs) / 1000));
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getDeadlineColor(deadlines: Deadline[], elapsedMs: number): string {
  if (deadlines.length >= 2 && elapsedMs >= deadlines[1].timeMs) {
    return 'text-dota-green';
  }
  if (deadlines.length >= 1 && elapsedMs >= deadlines[0].timeMs) {
    return 'text-dota-amber';
  }
  return 'text-dota-grey';
}

export function StatusRow({ label, tracked, elapsedMs, onLog, onClear }: StatusRowProps) {
  if (!tracked) {
    return (
      <div data-testid={`status-row-${label.toLowerCase()}`} className="flex items-center justify-between px-3 py-2 rounded bg-dota-black/40">
        <span className="text-dota-grey/60 text-sm">{label}</span>
        <button
          data-testid={`log-btn-${label.toLowerCase()}`}
          onClick={onLog}
          className="px-3 py-1 rounded text-xs font-medium bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30 transition-colors"
        >
          Log
        </button>
      </div>
    );
  }

  const colorClass = getDeadlineColor(tracked.deadlines, elapsedMs);

  return (
    <div data-testid={`status-row-${label.toLowerCase()}`} className={`px-3 py-2 rounded bg-dota-black/40 space-y-1 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label} killed at {formatGameTime(tracked.loggedAtMs)}</span>
        <button
          data-testid={`clear-btn-${label.toLowerCase()}`}
          onClick={onClear}
          className="px-2 py-0.5 rounded text-xs bg-dota-red/20 text-dota-red border border-dota-red/40 hover:bg-dota-red/30 transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="space-y-0.5">
        {tracked.deadlines.map((deadline) => (
          <div key={deadline.label} className="flex items-center justify-between text-xs">
            <span>{deadline.label} at {formatGameTime(deadline.timeMs)}</span>
            <span data-testid={`countdown-${label.toLowerCase()}`} className="font-mono">
              {elapsedMs >= deadline.timeMs ? '00:00' : formatCountdown(deadline.timeMs, elapsedMs)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
