import { useState, useEffect } from 'react';
import { DotaState, getState, onStateChange } from 'src/dota/processDetector';
import * as gameTimer from 'src/timer/gameTimer';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function MainDock() {
  const [status, setStatus] = useState<DotaState>(getState());
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    const unsubState = onStateChange((newState) => {
      setStatus(newState);
      if (newState === 'in-match') {
        gameTimer.reset();
        gameTimer.start();
      } else {
        gameTimer.stop();
      }
    });

    const unsubTick = gameTimer.onTick((ms) => {
      setElapsed(ms);
    });

    return () => {
      unsubState();
      unsubTick();
    };
  }, []);

  return (
    <div>
      <div data-testid="status-line">
        {status === 'in-match' ? 'In Match' : 'Idle'}
      </div>
      <div data-testid="game-clock">{formatTime(elapsed)}</div>
    </div>
  );
}
