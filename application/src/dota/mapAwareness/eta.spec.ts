import { EnemyTrack, PositionSample } from './types';
import { visibleEta, fogEta } from './eta';

const PLAYER = { x: 0, y: 0 };

function sample(t: number, x: number, player = PLAYER): PositionSample {
  return { t, x, y: 0, distanceToPlayer: Math.hypot(x - player.x, 0 - player.y) };
}

function visibleTrack(samples: PositionSample[]): EnemyTrack {
  return {
    name: 'tidehunter', state: 'visible', lastSeen: samples[samples.length - 1] ?? null, samples,
    speedSamples: [], validSampleCount: 0, learnedSpeed: null, vanishedAt: null, headingAway: false,
  };
}

function fogTrack(lastSeenX: number, lastSeenT: number, vanishedAt: number, speed: number | null = 350, headingAway = false): EnemyTrack {
  return {
    name: 'tidehunter', state: 'fog', lastSeen: sample(lastSeenT, lastSeenX), samples: [],
    speedSamples: [], validSampleCount: speed === null ? 0 : 3, learnedSpeed: speed, vanishedAt, headingAway,
  };
}

describe('visibleEta', () => {
  it('computes ETA from the measured closing rate', () => {
    const tr = visibleTrack([sample(0, 2900), sample(1, 2600), sample(2, 2300), sample(3, 2000)]);
    expect(visibleEta(tr, PLAYER, 800)).toBeCloseTo(4.0, 3);
  });

  it('returns 0 inside engage distance', () => {
    expect(visibleEta(visibleTrack([sample(0, 700)]), PLAYER, 800)).toBe(0);
  });

  it('returns null below the minimum closing rate', () => {
    const tr = visibleTrack([sample(0, 2297), sample(3, 2000)]);
    expect(visibleEta(tr, PLAYER, 800)).toBeNull();
  });

  it('accepts exactly the minimum closing rate', () => {
    const tr = visibleTrack([sample(0, 2300), sample(3, 2000)]);
    expect(visibleEta(tr, PLAYER, 800)).toBeCloseTo(12, 3);
  });

  it('returns null with a single sample outside engage distance', () => {
    expect(visibleEta(visibleTrack([sample(0, 2000)]), PLAYER, 800)).toBeNull();
  });

  it('returns null when moving away', () => {
    const tr = visibleTrack([sample(0, 2000), sample(1, 2300)]);
    expect(visibleEta(tr, PLAYER, 800)).toBeNull();
  });

  it('includes the player moving toward the enemy', () => {
    const playerNow = { x: 300, y: 0 };
    const tr = visibleTrack([sample(0, 2300, PLAYER), sample(1, 2000, playerNow)]);
    // distance went 2300 -> 1700 in 1 s: closing 600 u/s
    expect(visibleEta(tr, playerNow, 800)).toBeCloseTo(1.5, 3);
  });

  it('ignores samples older than the 3 second window', () => {
    const tr = visibleTrack([sample(0, 5000), sample(2, 2300), sample(4, 2000)]);
    expect(visibleEta(tr, PLAYER, 800)).toBeCloseTo(8, 3);
  });
});

describe('fogEta', () => {
  it('computes the worst-case straight-line ETA', () => {
    const tr = fogTrack(3000, 10, 11);
    expect(fogEta(tr, PLAYER, 12, 800, 20)).toBeCloseTo((3000 - 800 - 700) / 350, 3);
  });

  it('adds the turn-around allowance when heading away', () => {
    const tr = fogTrack(3000, 10, 11, 350, true);
    expect(fogEta(tr, PLAYER, 12, 800, 20)).toBeCloseTo((3000 - 800 - 700) / 350 + 1, 3);
  });

  it('expires after the maximum fog age', () => {
    const tr = fogTrack(9000, 10, 11);
    expect(fogEta(tr, PLAYER, 30, 800, 20)).not.toBeNull();
    expect(fogEta(tr, PLAYER, 31, 800, 20)).toBeNull();
  });

  it('waits one second of grace after vanishing', () => {
    const tr = fogTrack(3000, 10, 11);
    expect(fogEta(tr, PLAYER, 11, 800, 20)).toBeNull();
    expect(fogEta(tr, PLAYER, 12, 800, 20)).not.toBeNull();
  });

  it('drops as the player walks toward the last seen position', () => {
    const tr = fogTrack(6000, 10, 11);
    const before = fogEta(tr, PLAYER, 12, 800, 20)!;
    const after = fogEta(tr, { x: 1000, y: 0 }, 12, 800, 20)!;
    expect(after).toBeLessThan(before);
  });

  it('uses the fallback speed when speed is not learned', () => {
    const tr = fogTrack(3000, 10, 11, null);
    expect(fogEta(tr, PLAYER, 12, 800, 20)).toBeCloseTo((3000 - 800 - 700) / 350, 3);
  });

  it('uses a faster learned speed', () => {
    const tr = fogTrack(3000, 10, 11, 500);
    expect(fogEta(tr, PLAYER, 12, 800, 20)).toBeCloseTo((3000 - 800 - 1000) / 500, 3);
  });

  it('never returns a negative ETA', () => {
    const tr = fogTrack(1000, 10, 11);
    expect(fogEta(tr, PLAYER, 15, 800, 20)).toBe(0);
  });

  it('returns null for dead heroes', () => {
    const tr = { ...fogTrack(3000, 10, 11), state: 'dead' as const };
    expect(fogEta(tr, PLAYER, 12, 800, 20)).toBeNull();
  });

  it('handles opposite-corner distances', () => {
    const tr = fogTrack(23000, 10, 11);
    expect(Number.isFinite(fogEta(tr, PLAYER, 12, 800, 20)!)).toBe(true);
  });
});
