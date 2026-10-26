import { EnemyTrack, PositionSample } from './types';
import {
  MAX_MOVE_SPEED,
  BLINK_REJECT_FACTOR,
  IDLE_SPEED_FLOOR,
  SPEED_WINDOW_SECONDS,
  MIN_SPEED_SAMPLES,
  FALLBACK_SPEED,
  MIN_FOG_SPEED,
} from './constants';

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function sampleSpeed(prev: PositionSample, next: PositionSample): number | null {
  const dt = next.t - prev.t;
  if (dt <= 0) return null;
  return distance(prev, next) / dt;
}

export function isValidSpeed(speed: number): boolean {
  return speed >= IDLE_SPEED_FLOOR && speed <= MAX_MOVE_SPEED * BLINK_REJECT_FACTOR;
}

export function recordSpeed(track: EnemyTrack, prev: PositionSample, next: PositionSample): void {
  const speed = sampleSpeed(prev, next);
  if (speed === null || !isValidSpeed(speed)) return;

  track.speedSamples.push({ t: next.t, speed });
  track.speedSamples = track.speedSamples.filter((s) => s.t > next.t - SPEED_WINDOW_SECONDS);
  track.validSampleCount++;

  const mean = track.speedSamples.reduce((sum, s) => sum + s.speed, 0) / track.speedSamples.length;
  track.learnedSpeed = Math.min(mean, MAX_MOVE_SPEED);
}

export function effectiveSpeed(track: EnemyTrack): number {
  if (track.validSampleCount < MIN_SPEED_SAMPLES || track.learnedSpeed === null) return FALLBACK_SPEED;
  return track.learnedSpeed;
}

export function fogSpeed(track: EnemyTrack): number {
  return Math.max(effectiveSpeed(track), MIN_FOG_SPEED);
}
