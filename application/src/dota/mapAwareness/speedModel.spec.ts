import { EnemyTrack, PositionSample } from './types';
import { recordSpeed, effectiveSpeed, fogSpeed, sampleSpeed, isValidSpeed } from './speedModel';
import { FALLBACK_SPEED, MAX_MOVE_SPEED } from './constants';

function track(): EnemyTrack {
  return { name: 'tidehunter', state: 'visible', lastSeen: null, samples: [], speedSamples: [], validSampleCount: 0, learnedSpeed: null, vanishedAt: null, headingAway: false };
}

function s(t: number, x: number, y = 0): PositionSample {
  return { t, x, y, distanceToPlayer: null };
}

function walk(tr: EnemyTrack, points: PositionSample[]): void {
  for (let i = 1; i < points.length; i++) recordSpeed(tr, points[i - 1], points[i]);
}

describe('speedModel', () => {
  it('learns a constant walking speed exactly', () => {
    const tr = track();
    walk(tr, [s(0, 0), s(1, 300), s(2, 600), s(3, 900)]);
    expect(tr.learnedSpeed).toBe(300);
    expect(effectiveSpeed(tr)).toBe(300);
  });

  it('caps learned speed at the maximum movement speed', () => {
    const tr = track();
    walk(tr, [s(0, 0), s(1, 600), s(2, 1200), s(3, 1800)]);
    expect(tr.learnedSpeed).toBe(MAX_MOVE_SPEED);
  });

  it('rejects blink jumps and keeps the previous estimate', () => {
    const tr = track();
    walk(tr, [s(0, 0), s(1, 300), s(2, 600), s(3, 900)]);
    recordSpeed(tr, s(3, 900), s(4, 2100));
    expect(tr.learnedSpeed).toBe(300);
    expect(tr.validSampleCount).toBe(3);
  });

  it('ignores standing still', () => {
    const tr = track();
    walk(tr, [s(0, 0), s(1, 300), s(2, 600), s(3, 900)]);
    recordSpeed(tr, s(3, 900), s(4, 920));
    expect(tr.learnedSpeed).toBe(300);
  });

  it('uses the fallback speed with fewer than 3 valid samples', () => {
    const tr = track();
    walk(tr, [s(0, 0), s(1, 200), s(2, 400)]);
    expect(tr.validSampleCount).toBe(2);
    expect(effectiveSpeed(tr)).toBe(FALLBACK_SPEED);
  });

  it('divides by elapsed seconds when a second is skipped', () => {
    expect(sampleSpeed(s(0, 0), s(2, 600))).toBe(300);
  });

  it('returns null for non-increasing time', () => {
    expect(sampleSpeed(s(2, 0), s(2, 600))).toBeNull();
  });

  it('applies the blink and idle boundaries inclusively', () => {
    expect(isValidSpeed(660)).toBe(true);
    expect(isValidSpeed(661)).toBe(false);
    expect(isValidSpeed(50)).toBe(true);
    expect(isValidSpeed(49)).toBe(false);
  });

  it('averages only samples inside the 3 second window', () => {
    const tr = track();
    walk(tr, [s(0, 0), s(1, 200), s(2, 400), s(3, 800), s(4, 1200), s(5, 1600)]);
    expect(tr.learnedSpeed).toBe(400);
  });

  it('never assumes a fogged hero is slower than the fallback speed', () => {
    const tr = track();
    walk(tr, [s(0, 0), s(1, 200), s(2, 400), s(3, 600)]);
    expect(effectiveSpeed(tr)).toBe(200);
    expect(fogSpeed(tr)).toBe(FALLBACK_SPEED);
    walk(tr, [s(3, 600), s(4, 1050), s(5, 1500), s(6, 1950)]);
    expect(fogSpeed(tr)).toBe(450);
  });
});
