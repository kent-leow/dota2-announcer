import { KillScores, TeamSide } from '../gsiTypes';
import { TrackMap } from './heroTracks';
import { DEATH_MATCH_WINDOW_SECONDS } from './constants';

interface VanishEntry {
  t: number;
  name: string;
}

interface ScoreEntry {
  t: number;
  delta: number;
}

export interface DeathInference {
  update(tracks: TrackMap, vanished: string[], reappeared: string[], scores: KillScores | undefined, team: TeamSide, now: number): string[];
  reset(): void;
}

export function createDeathInference(): DeathInference {
  let vanishes: VanishEntry[] = [];
  let scoreDeltas: ScoreEntry[] = [];
  let lastOwnScore: number | null = null;

  function expire(now: number): void {
    const cutoff = now - DEATH_MATCH_WINDOW_SECONDS;
    vanishes = vanishes.filter((v) => v.t >= cutoff);
    scoreDeltas = scoreDeltas.filter((s) => s.t >= cutoff);
  }

  return {
    update(tracks, vanished, reappeared, scores, team, now) {
      for (const name of vanished) vanishes.push({ t: now, name });
      if (reappeared.length > 0) vanishes = vanishes.filter((v) => !reappeared.includes(v.name));

      if (scores) {
        const own = team === 'radiant' ? scores.radiant : scores.dire;
        if (lastOwnScore !== null && own > lastOwnScore) scoreDeltas.push({ t: now, delta: own - lastOwnScore });
        lastOwnScore = own;
      }

      expire(now);

      const kills = scoreDeltas.reduce((sum, s) => sum + s.delta, 0);
      const candidates = vanishes.filter((v) => tracks.get(v.name)?.state === 'fog');
      if (kills === 0 || kills !== candidates.length) return [];

      for (const v of candidates) {
        const track = tracks.get(v.name)!;
        track.state = 'dead';
      }
      vanishes = [];
      scoreDeltas = [];
      return candidates.map((v) => v.name);
    },
    reset() {
      vanishes = [];
      scoreDeltas = [];
      lastOwnScore = null;
    },
  };
}
