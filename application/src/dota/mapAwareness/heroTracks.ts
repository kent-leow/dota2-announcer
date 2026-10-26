import { VisibleHero } from '../gsiTypes';
import { EnemyTrack, Point, PositionSample, TrackTransitions } from './types';
import { distance, recordSpeed } from './speedModel';
import { SAMPLE_HISTORY_SECONDS, IDLE_SPEED_FLOOR } from './constants';

export type TrackMap = Map<string, EnemyTrack>;

function createTrack(name: string): EnemyTrack {
  return {
    name,
    state: 'visible',
    lastSeen: null,
    samples: [],
    speedSamples: [],
    validSampleCount: 0,
    learnedSpeed: null,
    vanishedAt: null,
    headingAway: false,
  };
}

function pickClosest(candidates: VisibleHero[], reference: Point | null): VisibleHero {
  if (!reference || candidates.length === 1) return candidates[0];
  return candidates.reduce((best, c) => (distance(c, reference) < distance(best, reference) ? c : best));
}

function groupByName(heroes: VisibleHero[]): Map<string, VisibleHero[]> {
  const groups = new Map<string, VisibleHero[]>();
  for (const hero of heroes) {
    const list = groups.get(hero.name);
    if (list) list.push(hero);
    else groups.set(hero.name, [hero]);
  }
  return groups;
}

export function isMovingAway(track: EnemyTrack, player: Point | null): boolean {
  if (!player || track.samples.length < 2) return false;
  const last = track.samples[track.samples.length - 1];
  const prev = track.samples[track.samples.length - 2];
  const dt = last.t - prev.t;
  if (dt <= 0) return false;
  const mx = last.x - prev.x;
  const my = last.y - prev.y;
  if (Math.hypot(mx, my) / dt < IDLE_SPEED_FLOOR) return false;
  const tx = player.x - last.x;
  const ty = player.y - last.y;
  return mx * tx + my * ty < 0;
}

export function updateTracks(
  tracks: TrackMap,
  enemyHeroes: VisibleHero[],
  clockSecond: number,
  player: Point | null,
): TrackTransitions {
  const transitions: TrackTransitions = { vanished: [], reappeared: [] };
  const present = groupByName(enemyHeroes);

  for (const [name, candidates] of present) {
    let track = tracks.get(name);
    if (!track) {
      track = createTrack(name);
      tracks.set(name, track);
    }
    const hero = pickClosest(candidates, track.lastSeen);
    const sample: PositionSample = {
      x: hero.x,
      y: hero.y,
      t: clockSecond,
      distanceToPlayer: player ? distance(hero, player) : null,
    };

    if (track.state !== 'visible') {
      transitions.reappeared.push(name);
      track.state = 'visible';
      track.samples = [];
      track.vanishedAt = null;
      track.headingAway = false;
    } else if (track.samples.length > 0) {
      recordSpeed(track, track.samples[track.samples.length - 1], sample);
    }

    track.samples.push(sample);
    track.samples = track.samples.filter((s) => s.t > clockSecond - SAMPLE_HISTORY_SECONDS);
    track.lastSeen = sample;
  }

  for (const track of tracks.values()) {
    if (track.state !== 'visible' || present.has(track.name)) continue;
    track.state = 'fog';
    track.vanishedAt = clockSecond;
    track.headingAway = isMovingAway(track, player);
    transitions.vanished.push(track.name);
  }

  return transitions;
}
