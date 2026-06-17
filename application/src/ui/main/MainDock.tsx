import { useState, useEffect, useCallback, useRef } from 'react';
import * as eventScheduler from 'src/scheduler/eventScheduler';
import * as announcer from 'src/tts/announcer';

type DotaState = 'idle' | 'hero-pick' | 'pre-game' | 'in-match';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function MainDock() {
  const [status, setStatus] = useState<DotaState>('idle');
  const [elapsed, setElapsed] = useState<number>(0);
  const elapsedRef = useRef<number>(0);
  const notificationEnabledRef = useRef<boolean>(true);
  const persistentEnabledRef = useRef<boolean>(false);
  const persistentEventCountRef = useRef<number>(5);
  const persistentLookaheadRef = useRef<number>(30);
  const roshanStateRef = useRef<{ state: string; minRespawnMs: number; maxRespawnMs: number }>({ state: 'alive', minRespawnMs: 0, maxRespawnMs: 0 });
  const [gamePaused, setGamePaused] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100);
  const [timeSuffix, setTimeSuffix] = useState<boolean>(true);
  const [rate, setRate] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  useEffect(() => {
    window.electronAPI.getState().then((s) => setStatus(s as DotaState));
    window.electronAPI.getElapsed().then(setElapsed);
    window.electronAPI.isPaused().then(setGamePaused);
    window.electronAPI.isMuted().then((m) => {
      setMuted(m);
      announcer.setMuted(m);
    });
    window.electronAPI.getVolume().then((v) => {
      setVolume(v);
      announcer.setVolume(v);
    });
    window.electronAPI.getEvents().then((config) => {
      window.electronAPI.getElapsed().then((ms) => eventScheduler.loadSchedule(config, ms));
    });
    window.electronAPI.getNotificationConfig().then((c) => {
      notificationEnabledRef.current = c.enabled;
    });
    window.electronAPI.getPersistentConfig().then((c) => {
      persistentEnabledRef.current = c.enabled;
      persistentEventCountRef.current = c.eventCount;
      persistentLookaheadRef.current = c.lookaheadSeconds;
    });
    window.electronAPI.getIncludeTimeSuffix().then((v) => {
      setTimeSuffix(v);
      announcer.setIncludeTimeSuffix(v);
    });
    window.electronAPI.getRate().then((r) => {
      setRate(r);
      announcer.setRate(r);
    });
    window.electronAPI.getVoiceUri().then((uri) => {
      setSelectedVoice(uri);
      announcer.setVoice(uri || null);
    });

    const loadVoices = () => {
      const available = announcer.getAvailableVoices();
      if (available.length > 0) setVoices(available);
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    eventScheduler.onAnnouncement((name, offset, eventId, icon) => {
      announcer.speak(announcer.formatMessage(name, offset));
      if (notificationEnabledRef.current) {
        window.electronAPI.sendOverlayNotification({ eventName: name, offsetSeconds: offset, eventId, happenTimeMs: elapsedRef.current + offset * 1000, icon });
      }
    });

    const unsubState = window.electronAPI.onStateChange((newState) => {
      setStatus(newState as DotaState);
      if (newState === 'idle') {
        eventScheduler.resetScheduler();
      } else if (newState === 'in-match') {
        eventScheduler.resetScheduler();
      }
    });

    const unsubRoshan = window.electronAPI.onRoshanEvent((eventType) => {
      const names: Record<string, string> = {
        killed: 'Roshan is dead',
        may_respawn: 'Roshan may respawn',
        respawn: 'Roshan has respawned',
      };
      const text = names[eventType] || eventType;
      announcer.speak(text, 'high');
    });

    const unsubGsi = window.electronAPI.onGsiStatusUpdate((gsi) => {
      const newState = gsi.roshanState;
      if (newState === 'respawn_base' || newState === 'respawn_variable') {
        const now = elapsedRef.current;
        roshanStateRef.current = {
          state: newState,
          minRespawnMs: now + gsi.minRespawnSeconds * 1000,
          maxRespawnMs: now + gsi.maxRespawnSeconds * 1000,
        };
      } else {
        roshanStateRef.current = { state: 'alive', minRespawnMs: 0, maxRespawnMs: 0 };
      }
    });

    const unsubTick = window.electronAPI.onClockTick((ms) => {
      elapsedRef.current = ms;
      setElapsed(ms);
      eventScheduler.tick(ms);
      if (persistentEnabledRef.current) {
        const upcoming = eventScheduler.getUpcomingOccurrences(ms, persistentEventCountRef.current, persistentLookaheadRef.current * 1000);
        const rosh = roshanStateRef.current;
        if (rosh.state === 'respawn_base' || rosh.state === 'respawn_variable') {
          upcoming.unshift({ eventId: 'roshan-must', eventName: 'Roshan must respawn', happenTimeMs: rosh.maxRespawnMs });
          if (rosh.minRespawnMs > ms) {
            upcoming.unshift({ eventId: 'roshan-may', eventName: 'Roshan may respawn', happenTimeMs: rosh.minRespawnMs });
          }
        }
        window.electronAPI.sendOverlayUpcoming(upcoming);
      }
    });

    const unsubPause = window.electronAPI.onPauseChange((isPaused) => {
      setGamePaused(isPaused);
    });

    const unsubEventsChanged = window.electronAPI.onEventsChanged((config) => {
      window.electronAPI.getElapsed().then((ms) => {
        eventScheduler.loadSchedule(config, ms);
        if (persistentEnabledRef.current) {
          const upcoming = eventScheduler.getUpcomingOccurrences(ms, persistentEventCountRef.current);
          window.electronAPI.sendOverlayUpcoming(upcoming);
        }
      });
    });

    const unsubOverlayConfig = window.electronAPI.onOverlayConfigChanged((config) => {
      notificationEnabledRef.current = config.notification.enabled;
      persistentEnabledRef.current = config.persistent.enabled;
      persistentEventCountRef.current = config.persistent.eventCount;
      persistentLookaheadRef.current = config.persistent.lookaheadSeconds;
    });

    return () => {
      unsubState();
      unsubRoshan();
      unsubGsi();
      unsubTick();
      unsubPause();
      unsubEventsChanged();
      unsubOverlayConfig();
    };
  }, []);

  const handleMuteToggle = useCallback(() => {
    window.electronAPI.toggleMute().then((m) => {
      setMuted(m);
      announcer.setMuted(m);
    });
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    window.electronAPI.setVolume(val);
    announcer.setVolume(val);
    setVolume(val);
  }, []);

  const handleTimeSuffixToggle = useCallback(() => {
    const newVal = !timeSuffix;
    setTimeSuffix(newVal);
    announcer.setIncludeTimeSuffix(newVal);
    window.electronAPI.setIncludeTimeSuffix(newVal);
  }, [timeSuffix]);

  const handleRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setRate(val);
    announcer.setRate(val);
    window.electronAPI.setRate(val);
  }, []);

  const handleVoiceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const uri = e.target.value;
    setSelectedVoice(uri);
    announcer.setVoice(uri || null);
    window.electronAPI.setVoiceUri(uri);
  }, []);

  return (
    <div className="bg-dota-dark rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div data-testid="status-line" className="flex items-center gap-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
            status === 'in-match' ? 'bg-dota-gold' :
            status === 'hero-pick' ? 'bg-dota-amber' :
            status === 'pre-game' ? 'bg-dota-green' :
            'bg-dota-grey/40'
          }`} />
          <span className={`text-sm font-medium ${
            status === 'in-match' ? 'text-dota-gold' :
            status === 'hero-pick' ? 'text-dota-amber' :
            status === 'pre-game' ? 'text-dota-green' :
            'text-dota-grey'
          }`}>
            {status === 'in-match' ? 'In Match' :
             status === 'hero-pick' ? 'Hero Pick Phase' :
             status === 'pre-game' ? 'Pre Game' :
             'Idle'}
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

      </div>

      <label data-testid="volume-control" className="flex items-center gap-3 px-2">
        <span className="text-xs text-dota-grey/70 w-8">Vol</span>
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

      <label data-testid="speed-control" className="flex items-center gap-3 px-2">
        <span className="text-xs text-dota-grey/70 w-8">Speed</span>
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={rate}
          onChange={handleRateChange}
          data-testid="speed-slider"
          className="flex-1 h-1.5 rounded-full appearance-none bg-dota-grey/20 accent-dota-gold cursor-pointer"
        />
        <span data-testid="speed-value" className="text-xs text-dota-grey w-10 text-right">{rate.toFixed(1)}x</span>
      </label>

      <label data-testid="voice-control" className="flex items-center gap-3 px-2">
        <span className="text-xs text-dota-grey/70 w-8">Voice</span>
        <select
          value={selectedVoice}
          onChange={handleVoiceChange}
          data-testid="voice-select"
          className="flex-1 text-xs bg-dota-black/60 text-dota-grey border border-dota-gold/30 rounded px-2 py-1.5 cursor-pointer"
        >
          <option value="">Default</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
          ))}
        </select>
      </label>
    </div>
  );
}
