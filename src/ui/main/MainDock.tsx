import { useState, useEffect, useCallback } from 'react';
import { DotaState, getState, onStateChange } from 'src/dota/processDetector';
import * as gameTimer from 'src/timer/gameTimer';
import * as muteManager from 'src/tts/muteManager';
import * as volumeController from 'src/tts/volumeController';
import * as eventsLoader from 'src/config/eventsLoader';
import * as eventScheduler from 'src/scheduler/eventScheduler';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function MainDock() {
  const [status, setStatus] = useState<DotaState>(getState());
  const [elapsed, setElapsed] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(muteManager.isMuted());
  const [volume, setVolume] = useState<number>(volumeController.getVolume());
  const [announcing, setAnnouncing] = useState<boolean>(true);

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

  const handleMuteToggle = useCallback(() => {
    const next = muteManager.toggleMute();
    setMuted(next);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    volumeController.setVolume(val);
    setVolume(val);
  }, []);

  const handleStartStop = useCallback(() => {
    setAnnouncing((prev) => !prev);
  }, []);

  const handleReload = useCallback(() => {
    eventsLoader.reload();
    eventScheduler.loadSchedule();
  }, []);

  return (
    <div>
      <div data-testid="status-line">
        {status === 'in-match' ? 'In Match' : 'Idle'}
      </div>
      <div data-testid="game-clock">{formatTime(elapsed)}</div>

      <div data-testid="controls">
        <button data-testid="mute-toggle" onClick={handleMuteToggle}>
          {muted ? 'Unmute' : 'Mute'}
        </button>

        <label data-testid="volume-control">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            data-testid="volume-slider"
          />
          <span data-testid="volume-value">{volume}%</span>
        </label>

        <button data-testid="start-stop" onClick={handleStartStop}>
          {announcing ? 'Stop' : 'Start'}
        </button>

        <button data-testid="reload-config" onClick={handleReload}>
          Reload Config
        </button>
      </div>
    </div>
  );
}
