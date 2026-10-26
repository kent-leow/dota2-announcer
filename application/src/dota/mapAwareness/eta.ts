import { EnemyTrack, Point } from './types';
import { distance, fogSpeed } from './speedModel';
import {
  VISIBLE_ETA_WINDOW_SECONDS,
  MIN_CLOSING_RATE,
  FOG_GRACE_SECONDS,
  TURN_AROUND_SECONDS,
} from './constants';

export function visibleEta(track: EnemyTrack, player: Point, engageDistance: number): number | null {
  const latest = track.samples[track.samples.length - 1];
  if (!latest) return null;
  const current = distance(latest, player);
  if (current <= engageDistance) return 0;

  const windowStart = latest.t - VISIBLE_ETA_WINDOW_SECONDS;
  const oldest = track.samples.find((s) => s.t >= windowStart && s.distanceToPlayer !== null && s.t < latest.t);
  if (!oldest || oldest.distanceToPlayer === null) return null;

  const closingRate = (oldest.distanceToPlayer - current) / (latest.t - oldest.t);
  if (closingRate < MIN_CLOSING_RATE) return null;
  return (current - engageDistance) / closingRate;
}

export function fogAge(track: EnemyTrack, now: number): number | null {
  if (!track.lastSeen) return null;
  return now - track.lastSeen.t;
}

export function isFogExpired(track: EnemyTrack, now: number, maxFogSeconds: number): boolean {
  const age = fogAge(track, now);
  return age !== null && age > maxFogSeconds;
}

export function fogEta(
  track: EnemyTrack,
  player: Point,
  now: number,
  engageDistance: number,
  maxFogSeconds: number,
): number | null {
  if (track.state !== 'fog' || !track.lastSeen || track.vanishedAt === null) return null;
  if (now - track.vanishedAt < FOG_GRACE_SECONDS) return null;
  if (isFogExpired(track, now, maxFogSeconds)) return null;

  const age = fogAge(track, now)!;
  const speed = fogSpeed(track);
  const remaining = distance(track.lastSeen, player) - engageDistance - speed * age;
  const eta = Math.max(0, remaining / speed);
  return track.headingAway ? eta + TURN_AROUND_SECONDS : eta;
}
