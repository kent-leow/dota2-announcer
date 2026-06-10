import { useState, useEffect, useCallback } from 'react';
import * as eventScheduler from 'src/scheduler/eventScheduler';
import * as announcer from 'src/tts/announcer';

type DotaState = 'in-match' | 'idle';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function MainDock() {
  const [status, setStatus] = useState<DotaState>('idle');
  const [elapsed, setElapsed] = useState<number>(0);
  const [gamePaused, setGamePaused] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100);
  const [announcing, setAnnouncing] = useState<boolean>(true);
  const [timeSuffix, setTimeSuffix] = useState<boolean>(true);

  useEffect(() => {
    window.electronAPI.getState().then((s) => setStatus(s as DotaState));
    window.electronAPI.getElapsed().then(setElapsed);
    window.electronAPI.isPaused().then(setGamePaused);
    window.electronAPI.isMuted().then(setMuted);
    window.electronAPI.getVolume().then(setVolume);
    window.electronAPI.getEvents().then((config) => eventScheduler.loadSchedule(config));
    window.electronAPI.getIncludeTimeSuffix().then((v) => {
      setTimeSuffix(v);
      announcer.setIncludeTimeSuffix(v);
    });

    eventScheduler.onAnnouncement((name, offset) => {
      announcer.speak(announcer.formatMessage(name, offset));
    });

    const unsubState = window.electronAPI.onStateChange((newState) => {
      setStatus(newState as DotaState);
      if (newState === 'idle') {
        eventScheduler.resetScheduler();
      }
    });

    const unsubTick = window.electronAPI.onClockTick((ms) => {
      setElapsed(ms);
      eventScheduler.tick(ms);
    });

    const unsubPause = window.electronAPI.onPauseChange((isPaused) => {
      setGamePaused(isPaused);
    });

    return () => {
      unsubState();
      unsubTick();
      unsubPause();
    };
  }, []);

  const handleMuteToggle = useCallback(() => {
    window.electronAPI.toggleMute().then(setMuted);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    window.electronAPI.setVolume(val);
    setVolume(val);
  }, []);

  const handleStartStop = useCallback(() => {
    setAnnouncing((prev) => !prev);
  }, []);

  const handleTimeSuffixToggle = useCallback(() => {
    const newVal = !timeSuffix;
    setTimeSuffix(newVal);
    announcer.setIncludeTimeSuffix(newVal);
    window.electronAPI.setIncludeTimeSuffix(newVal);
  }, [timeSuffix]);

  const handleReload = useCallback(() => {
    window.electronAPI.reloadEvents().then((config) => eventScheduler.loadSchedule(config));
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
        {gamePaused && <span className="block text-sm text-dota-red font-sans mt-1">PAUSED</span>}
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
          data-testid="time-suffix-toggle"
          onClick={handleTimeSuffixToggle}
          className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
            timeSuffix
              ? 'bg-dota-green/20 text-dota-green border border-dota-green/40 hover:bg-dota-green/30'
              : 'bg-dota-gold/20 text-dota-gold border border-dota-gold/40 hover:bg-dota-gold/30'
          }`}
        >
          {timeSuffix ? 'Time: On' : 'Time: Off'}
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
