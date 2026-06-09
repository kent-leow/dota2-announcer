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
    <div className="bg-dota-dark rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div data-testid="status-line" className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${status === 'in-match' ? 'bg-dota-gold' : 'bg-dota-grey/40'}`} />
          <span className={`text-sm font-medium ${status === 'in-match' ? 'text-dota-gold' : 'text-dota-grey'}`}>
            {status === 'in-match' ? 'In Match' : 'Idle'}
          </span>
        </div>
      </div>

      <div data-testid="game-clock" className="text-center text-5xl font-mono font-bold text-white tracking-wider">
        {formatTime(elapsed)}
      </div>

      <div data-testid="controls" className="flex flex-wrap items-center gap-3 justify-center">
        <button
          data-testid="mute-toggle"
          onClick={handleMuteToggle}
          className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
            muted
              ? 'bg-dota-red/80 text-white hover:bg-dota-red'
              : 'bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30'
          }`}
        >
          {muted ? 'Unmute' : 'Mute'}
        </button>

        <button
          data-testid="start-stop"
          onClick={handleStartStop}
          className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
            announcing
              ? 'bg-dota-green/20 text-dota-green border border-dota-green/40 hover:bg-dota-green/30'
              : 'bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30'
          }`}
        >
          {announcing ? 'Stop' : 'Start'}
        </button>

        <button
          data-testid="reload-config"
          onClick={handleReload}
          className="px-4 py-2 rounded font-medium text-sm bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30 transition-colors"
        >
          Reload Config
        </button>
      </div>

      <label data-testid="volume-control" className="flex items-center gap-3 px-2">
        <span className="text-xs text-dota-grey/70 w-6">Vol</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          data-testid="volume-slider"
          className="flex-1 h-1.5 rounded-full appearance-none bg-dota-grey/20 accent-dota-gold cursor-pointer"
        />
        <span data-testid="volume-value" className="text-xs text-dota-grey w-10 text-right">{volume}%</span>
      </label>
    </div>
  );
}
