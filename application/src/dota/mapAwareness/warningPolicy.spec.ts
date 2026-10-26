import { createWarningPolicy } from './warningPolicy';
import { EngineSettings, EtaResult } from './types';

const SETTINGS: EngineSettings = { leadSeconds: 5, engageDistance: 800, maxFogSeconds: 20, visibleEnabled: true, fogEnabled: true };

function v(eta: number | null): EtaResult {
  return { eta, source: 'visible', expired: false };
}

function f(eta: number | null, expired = false): EtaResult {
  return { eta, source: 'fog', expired };
}

describe('warningPolicy', () => {
  let policy: ReturnType<typeof createWarningPolicy>;

  function run(now: number, etas: Record<string, EtaResult>, opts: { rearm?: string[]; alive?: boolean; settings?: Partial<EngineSettings> } = {}) {
    return policy.evaluate({
      etas: new Map(Object.entries(etas)),
      rearm: new Set(opts.rearm ?? []),
      playerAlive: opts.alive ?? true,
      now,
      settings: { ...SETTINGS, ...opts.settings },
    });
  }

  beforeEach(() => {
    policy = createWarningPolicy();
  });

  it('fires in the same second ETA reaches lead time', () => {
    expect(run(1, { tide: v(6) })).toEqual([]);
    const [w] = run(2, { tide: v(5) });
    expect(w).toEqual({ heroes: [{ name: 'tide', etaSeconds: 5, source: 'visible' }], etaSeconds: 5, clockTime: 2, grouped: false });
  });

  it('fires when the ETA skips past the lead time', () => {
    run(1, { tide: v(6) });
    expect(run(2, { tide: v(4) })).toHaveLength(1);
  });

  it('fires only once while ETA flickers around lead time', () => {
    const fired = [5, 4, 5, 4, 6, 5].flatMap((eta, i) => run(i, { tide: v(eta) }));
    expect(fired).toHaveLength(1);
  });

  it('re-arms after the visible ETA rises above lead + 3', () => {
    run(1, { tide: v(5) });
    run(2, { tide: v(8.1) });
    expect(run(3, { tide: v(5) })).toHaveLength(1);
  });

  it('does not re-arm when ETA rises only to lead + 2.9', () => {
    run(1, { tide: v(5) });
    run(2, { tide: v(7.9) });
    expect(run(3, { tide: v(5) })).toHaveLength(0);
  });

  it('re-arms when a visible hero stops approaching', () => {
    run(1, { tide: v(5) });
    run(2, { tide: v(null) });
    expect(run(3, { tide: v(4) })).toHaveLength(1);
  });

  it('does not re-fire when a warned visible hero enters fog', () => {
    run(1, { tide: v(5) });
    run(2, { tide: f(null) });
    expect(run(3, { tide: f(3) })).toHaveLength(0);
  });

  it('re-arms on reappearance from fog', () => {
    run(1, { tide: f(4) });
    expect(run(2, { tide: v(4) }, { rearm: ['tide'] })).toHaveLength(1);
  });

  it('re-arms when the fog prediction expires', () => {
    run(1, { tide: f(4) });
    run(2, { tide: f(null, true) });
    expect(run(3, { tide: f(4) })).toHaveLength(1);
  });

  it('re-arms when a hero is no longer tracked (dead)', () => {
    run(1, { tide: v(4) });
    run(2, {});
    expect(run(3, { tide: v(4) })).toHaveLength(1);
  });

  it('groups heroes crossing in the same second', () => {
    const [w] = run(1, { tide: v(4), sf: f(2), lion: v(9) });
    expect(w.grouped).toBe(true);
    expect(w.heroes.map((h) => h.name)).toEqual(['sf', 'tide']);
    expect(w.etaSeconds).toBe(2);
  });

  it('groups a second hero crossing within 3 seconds of the first', () => {
    run(1, { tide: v(5), sf: v(9) });
    const [w] = run(3, { tide: v(3), sf: v(4) });
    expect(w.grouped).toBe(true);
    expect(w.heroes.map((h) => h.name).sort()).toEqual(['sf', 'tide']);
    expect(w.etaSeconds).toBe(3);
  });

  it('warns separately when the second hero crosses after 3 seconds', () => {
    run(1, { tide: v(5), sf: v(9) });
    const [w] = run(5, { tide: v(1), sf: v(4) });
    expect(w.grouped).toBe(false);
    expect(w.heroes.map((h) => h.name)).toEqual(['sf']);
  });

  it('stays silent while the player is dead and fires after respawn', () => {
    expect(run(1, { tide: v(4) }, { alive: false })).toEqual([]);
    expect(run(2, { tide: v(3) }, { alive: true })).toHaveLength(1);
  });

  it('ignores disabled warning sources and keeps them armed', () => {
    expect(run(1, { tide: f(3) }, { settings: { fogEnabled: false } })).toEqual([]);
    expect(run(2, { sf: v(3) }, { settings: { fogEnabled: false } })).toHaveLength(1);
    expect(run(3, { tide: f(3) })).toHaveLength(1);
  });

  it('ignores visible crossings when visible warnings are disabled', () => {
    expect(run(1, { tide: v(3) }, { settings: { visibleEnabled: false } })).toEqual([]);
  });

  it('supports minimum and maximum lead times', () => {
    expect(run(1, { a: v(2.5) }, { settings: { leadSeconds: 2 } })).toEqual([]);
    expect(run(2, { a: v(2) }, { settings: { leadSeconds: 2 } })).toHaveLength(1);
    expect(run(3, { b: v(15) }, { settings: { leadSeconds: 15 } })).toHaveLength(1);
  });

  it('fires immediately for ETA 0', () => {
    expect(run(1, { tide: v(0) })[0].etaSeconds).toBe(0);
  });

  it('reset clears episodes', () => {
    run(1, { tide: v(4) });
    policy.reset();
    expect(run(2, { tide: v(4) })).toHaveLength(1);
  });
});
