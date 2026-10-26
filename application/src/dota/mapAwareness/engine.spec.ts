import { createEngine } from './engine';
import { EngineSettings } from './types';
import { GAME_STATES, ParsedGameState, VisibleHero } from '../gsiTypes';

const SETTINGS: EngineSettings = { leadSeconds: 5, engageDistance: 800, maxFogSeconds: 20, visibleEnabled: true, fogEnabled: true };

interface StateOpts {
  enemies?: VisibleHero[];
  player?: { x: number; y: number; alive?: boolean } | null;
  matchId?: string;
  gameState?: string;
  paused?: boolean;
  scores?: { radiant: number; dire: number };
}

function state(clockTime: number, opts: StateOpts = {}): ParsedGameState {
  const player = opts.player === null ? undefined : { team: 'radiant' as const, x: 0, y: 0, alive: true, ...opts.player };
  return {
    gameState: opts.gameState ?? GAME_STATES.GAME_IN_PROGRESS,
    clockTime,
    matchId: opts.matchId ?? '0',
    paused: opts.paused ?? false,
    daytime: true,
    heroName: 'ursa',
    events: [],
    player,
    enemyHeroes: opts.enemies ?? [],
    killScores: opts.scores ?? { radiant: 0, dire: 0 },
  };
}

const tide = (x: number, y = 0): VisibleHero => ({ name: 'tidehunter', x, y });

describe('mapAwareness engine', () => {
  let engine: ReturnType<typeof createEngine>;

  beforeEach(() => {
    engine = createEngine();
  });

  describe('ingestion and reset', () => {
    it('processes only the first state of each game second', () => {
      engine.step(state(10, { enemies: [tide(4000)] }), SETTINGS);
      engine.step(state(10, { enemies: [tide(100)] }), SETTINGS);
      expect(engine.getTracks()[0].lastSeen!.x).toBe(4000);
    });

    it('resets when the match id changes', () => {
      engine.step(state(10, { enemies: [tide(4000)], matchId: 'a' }), SETTINGS);
      engine.step(state(11, { matchId: 'b' }), SETTINGS);
      expect(engine.getTracks()).toHaveLength(0);
    });

    it('resets when leaving in-progress state', () => {
      engine.step(state(10, { enemies: [tide(4000)] }), SETTINGS);
      expect(engine.step(state(11, { gameState: GAME_STATES.POST_GAME }), SETTINGS)).toEqual([]);
      expect(engine.getTracks()).toHaveLength(0);
    });

    it('resets when the clock goes backwards', () => {
      engine.step(state(100, { enemies: [tide(4000)] }), SETTINGS);
      engine.step(state(5), SETTINGS);
      expect(engine.getTracks()).toHaveLength(0);
    });

    it('keeps tracking across a stable "0" match id', () => {
      engine.step(state(10, { enemies: [tide(4000)] }), SETTINGS);
      engine.step(state(11, { enemies: [tide(3800)] }), SETTINGS);
      expect(engine.getTracks()[0].samples).toHaveLength(2);
    });

    it('does nothing without a player snapshot', () => {
      expect(() => engine.step(state(10, { enemies: [tide(4000)], player: null }), SETTINGS)).not.toThrow();
      expect(engine.getTracks()).toHaveLength(0);
    });
  });

  describe('ETA computation', () => {
    it('computes visible and fog ETAs each second', () => {
      engine.step(state(1, { enemies: [tide(3000)] }), SETTINGS);
      engine.step(state(2, { enemies: [tide(2700)] }), SETTINGS);
      expect(engine.getEtas().get('tidehunter')).toEqual({ eta: (2700 - 800) / 300, source: 'visible', expired: false });
      engine.step(state(3), SETTINGS);
      engine.step(state(4), SETTINGS);
      const fog = engine.getEtas().get('tidehunter')!;
      expect(fog.source).toBe('fog');
      expect(fog.eta).toBeCloseTo((2700 - 800 - 350 * 2) / 350, 3);
    });

    it('freezes fog age while paused', () => {
      engine.step(state(1, { enemies: [tide(9000)] }), SETTINGS);
      engine.step(state(2), SETTINGS);
      engine.step(state(3), SETTINGS);
      const before = engine.getEtas().get('tidehunter')!.eta;
      engine.step(state(3, { paused: true, player: { x: 5000, y: 0 } }), SETTINGS);
      engine.step(state(3, { paused: true, player: { x: 8000, y: 0 } }), SETTINGS);
      expect(engine.getEtas().get('tidehunter')!.eta).toBe(before);
      engine.step(state(4), SETTINGS);
      expect(engine.getEtas().get('tidehunter')!.eta).toBeCloseTo(before! - 1, 3);
    });

    it('stops predicting after the maximum fog age', () => {
      engine.step(state(1, { enemies: [tide(15000)] }), SETTINGS);
      engine.step(state(22), SETTINGS);
      expect(engine.getEtas().get('tidehunter')).toEqual({ eta: null, source: 'fog', expired: true });
    });
  });

  describe('warnings', () => {
    it('warns exactly once for an enemy walking toward a stationary player', () => {
      const warnings = [];
      for (let t = 0; t <= 12; t++) {
        warnings.push(...engine.step(state(t, { enemies: [tide(4000 - 300 * t)] }), SETTINGS));
      }
      expect(warnings).toHaveLength(1);
      // ETA = (4000 - 300t - 800) / 300 <= 5  =>  t >= 5.67  => first at t = 6
      expect(warnings[0].clockTime).toBe(6);
      expect(warnings[0].heroes[0]).toMatchObject({ name: 'tidehunter', source: 'visible' });
    });

    it('warns once for an enemy that vanishes into fog nearby', () => {
      const warnings = [];
      warnings.push(...engine.step(state(1, { enemies: [tide(4000)] }), SETTINGS));
      warnings.push(...engine.step(state(2, { enemies: [tide(4000)] }), SETTINGS));
      for (let t = 3; t <= 15; t++) warnings.push(...engine.step(state(t), SETTINGS));
      expect(warnings).toHaveLength(1);
      // ETA = (4000 - 800 - 350*(t-2)) / 350 <= 5  =>  t - 2 >= 4.14  => t = 7
      expect(warnings[0].clockTime).toBe(7);
      expect(warnings[0].heroes[0].source).toBe('fog');
    });

    it('does not warn about an enemy killed as it vanished', () => {
      const warnings = [];
      warnings.push(...engine.step(state(1, { enemies: [tide(2000)] }), SETTINGS));
      warnings.push(...engine.step(state(2, { scores: { radiant: 1, dire: 0 } }), SETTINGS));
      for (let t = 3; t <= 15; t++) warnings.push(...engine.step(state(t, { scores: { radiant: 1, dire: 0 } }), SETTINGS));
      expect(warnings).toHaveLength(0);
      expect(engine.getTracks()[0].state).toBe('dead');
    });

    it('stays silent while the player is dead', () => {
      const warnings = [];
      for (let t = 0; t <= 12; t++) {
        warnings.push(...engine.step(state(t, { enemies: [tide(4000 - 300 * t)], player: { x: 0, y: 0, alive: false } }), SETTINGS));
      }
      expect(warnings).toHaveLength(0);
    });

    it('is deterministic for identical inputs', () => {
      const inputs = [
        state(1, { enemies: [tide(5000)] }),
        state(2, { enemies: [tide(4600)] }),
        state(3, { enemies: [tide(4200), { name: 'nevermore', x: 0, y: 3000 }] }),
        state(4, { enemies: [{ name: 'nevermore', x: 0, y: 2700 }] }),
        ...Array.from({ length: 12 }, (_, i) => state(5 + i)),
      ];
      const runOnce = () => {
        const e = createEngine();
        return inputs.flatMap((s) => e.step(s, SETTINGS));
      };
      const first = runOnce();
      expect(first.length).toBeGreaterThan(0);
      expect(runOnce()).toEqual(first);
    });
  });
});
