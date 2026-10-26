import { ParsedGameState, GAME_STATES } from '../gsiTypes';
import { EngineSettings, EnemyTrack, EtaResult, MapAwarenessWarning, Point } from './types';
import { TrackMap, updateTracks } from './heroTracks';
import { createDeathInference } from './deathInference';
import { visibleEta, fogEta, isFogExpired } from './eta';
import { createWarningPolicy } from './warningPolicy';

export interface MapAwarenessEngine {
  step(state: ParsedGameState, settings: EngineSettings): MapAwarenessWarning[];
  reset(): void;
  getTracks(): EnemyTrack[];
  getEtas(): Map<string, EtaResult>;
}

export function createEngine(): MapAwarenessEngine {
  const tracks: TrackMap = new Map();
  const deaths = createDeathInference();
  const policy = createWarningPolicy();
  let etas = new Map<string, EtaResult>();
  let lastSecond: number | null = null;
  let matchId: string | null = null;

  function reset(): void {
    tracks.clear();
    deaths.reset();
    policy.reset();
    etas = new Map();
    lastSecond = null;
    matchId = null;
  }

  function computeEtas(player: Point, now: number, settings: EngineSettings): Map<string, EtaResult> {
    const result = new Map<string, EtaResult>();
    for (const track of tracks.values()) {
      if (track.state === 'visible') {
        result.set(track.name, { eta: visibleEta(track, player, settings.engageDistance), source: 'visible', expired: false });
      } else if (track.state === 'fog') {
        result.set(track.name, {
          eta: fogEta(track, player, now, settings.engageDistance, settings.maxFogSeconds),
          source: 'fog',
          expired: isFogExpired(track, now, settings.maxFogSeconds),
        });
      }
    }
    return result;
  }

  function step(state: ParsedGameState, settings: EngineSettings): MapAwarenessWarning[] {
    const now = state.clockTime;
    const matchChanged = matchId !== null && state.matchId !== matchId;
    const clockRewound = lastSecond !== null && now < lastSecond;
    if (state.gameState !== GAME_STATES.GAME_IN_PROGRESS || matchChanged || clockRewound) {
      reset();
      if (state.gameState !== GAME_STATES.GAME_IN_PROGRESS) return [];
    }
    matchId = state.matchId;

    if (state.paused) return [];
    if (lastSecond !== null && now <= lastSecond) return [];
    if (!state.player) return [];
    lastSecond = now;

    const player: Point = { x: state.player.x, y: state.player.y };
    const transitions = updateTracks(tracks, state.enemyHeroes ?? [], now, player);
    const died = deaths.update(tracks, transitions.vanished, transitions.reappeared, state.killScores, state.player.team, now);
    etas = computeEtas(player, now, settings);

    return policy.evaluate({
      etas,
      rearm: new Set([...transitions.reappeared, ...died]),
      playerAlive: state.player.alive,
      now,
      settings,
    });
  }

  return {
    step,
    reset,
    getTracks: () => [...tracks.values()],
    getEtas: () => etas,
  };
}
