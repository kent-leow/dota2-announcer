import { useState, useEffect } from 'react';
import { updateFromGsi, clearAll, getStatus } from 'src/tracker/gameStatusTracker';
import { GameStatusState } from 'src/tracker/gameStatusTypes';

function formatCountdown(endSeconds: number, currentSeconds: number): string {
  const remaining = Math.max(0, endSeconds - currentSeconds);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getRoshanLabel(state: string): string {
  if (state === 'respawn_base') return 'May respawn';
  if (state === 'respawn_extra') return 'Will respawn';
  return 'Alive';
}

function getRoshanColor(state: string): string {
  if (state === 'respawn_base') return 'text-dota-amber';
  if (state === 'respawn_extra') return 'text-dota-green';
  return 'text-dota-grey';
}

export function GameStatusPanel() {
  const [status, setStatus] = useState<GameStatusState>(getStatus());
  const [clockTime, setClockTime] = useState<number>(0);

  useEffect(() => {
    const unsubGsi = window.electronAPI.onGsiStatusUpdate((gsi) => {
      updateFromGsi(gsi.daytime, gsi.roshanState, gsi.roshanStateEndSeconds);
      setStatus(getStatus());
      setClockTime(gsi.clockTime);
    });

    const unsubState = window.electronAPI.onStateChange((newState) => {
      if (newState === 'idle') {
        clearAll();
        setStatus(getStatus());
        setClockTime(0);
      }
    });

    return () => {
      unsubGsi();
      unsubState();
    };
  }, []);

  return (
    <div data-testid="game-status-panel" className="bg-dota-dark rounded-lg p-4">
      <h3 className="text-dota-gold text-sm font-semibold mb-3 uppercase tracking-wide">Game Status</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-3 py-2 rounded bg-dota-black/40">
          <span className="text-sm text-dota-grey">Day/Night</span>
          <span className={`text-sm font-medium ${status.daytime ? 'text-dota-gold' : 'text-blue-400'}`}>
            {status.daytime ? 'Daytime' : 'Nighttime'}
          </span>
        </div>

        <div className={`px-3 py-2 rounded bg-dota-black/40 ${getRoshanColor(status.roshan.state)}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-dota-grey">Roshan</span>
            <span className="text-sm font-medium">{getRoshanLabel(status.roshan.state)}</span>
          </div>
          {status.roshan.state !== 'alive' && status.roshan.endSeconds > 0 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs opacity-70">
                {status.roshan.state === 'respawn_base' ? 'Until may respawn' : 'Until confirmed'}
              </span>
              <span className="text-xs font-mono">
                {formatCountdown(status.roshan.endSeconds, clockTime)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
