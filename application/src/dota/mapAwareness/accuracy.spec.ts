import { computeMatchAccuracy, summarize, median, formatReport, MatchAccuracy } from './accuracy';
import { TimelineEntry } from './replay';
import { MapAwarenessWarning, WarningSource } from './types';

const ENGAGE = 800;
const PLAYER = { team: 'radiant' as const, x: 0, y: 0, alive: true };

function entry(t: number, enemies: { name: string; x: number; y?: number }[], warnings: MapAwarenessWarning[] = [], alive = true): TimelineEntry {
  return { t, player: { ...PLAYER, alive }, enemies: enemies.map((e) => ({ name: e.name, x: e.x, y: e.y ?? 0 })), warnings };
}

function warn(t: number, name: string, eta: number, source: WarningSource = 'visible'): MapAwarenessWarning {
  return { heroes: [{ name, etaSeconds: eta, source }], etaSeconds: eta, clockTime: t, grouped: false };
}

function walkTimeline(warnAt: number | null, eta = 5): TimelineEntry[] {
  const timeline: TimelineEntry[] = [];
  for (let t = 0; t <= 12; t++) {
    const x = 4000 - 300 * t;
    timeline.push(entry(t, [{ name: 'tide', x }], warnAt === t ? [warn(t, 'tide', eta)] : []));
  }
  return timeline;
}

describe('accuracy', () => {
  it('counts an arrival warned 5 s ahead as caught', () => {
    // arrival when x <= 800: 4000 - 300t <= 800 => t = 11
    const m = computeMatchAccuracy(walkTimeline(6), ENGAGE);
    expect(m.arrivals).toEqual([{ hero: 'tide', t: 11, walking: true, caughtWithNotice: true, noticeSeconds: 5 }]);
    expect(m.visibleErrors).toEqual([0]);
    expect(m.falseWarnings).toEqual([]);
  });

  it('counts an arrival warned 2 s ahead but not as caught with notice', () => {
    const m = computeMatchAccuracy(walkTimeline(9, 2), ENGAGE);
    expect(m.arrivals[0]).toMatchObject({ caughtWithNotice: false, noticeSeconds: 2 });
  });

  it('lists an unwarned arrival as a miss', () => {
    const m = computeMatchAccuracy(walkTimeline(null), ENGAGE);
    expect(m.arrivals[0]).toMatchObject({ caughtWithNotice: false, noticeSeconds: null });
  });

  it('excludes a blink arrival from walking arrivals', () => {
    const timeline = [entry(0, [{ name: 'tide', x: 3000 }]), entry(1, [{ name: 'tide', x: 2800 }]), entry(2, [{ name: 'tide', x: 500 }])];
    expect(computeMatchAccuracy(timeline, ENGAGE).arrivals[0].walking).toBe(false);
  });

  it('excludes a fog arrival faster than 550 u/s', () => {
    const timeline = [entry(0, [{ name: 'tide', x: 5000 }]), entry(1, []), entry(2, []), entry(3, [{ name: 'tide', x: 500 }])];
    expect(computeMatchAccuracy(timeline, ENGAGE).arrivals[0].walking).toBe(false);
  });

  it('keeps a plausible fog arrival as walking', () => {
    const timeline = [entry(0, [{ name: 'tide', x: 2000 }]), entry(1, []), entry(2, []), entry(3, [{ name: 'tide', x: 500 }])];
    expect(computeMatchAccuracy(timeline, ENGAGE).arrivals[0].walking).toBe(true);
  });

  it('counts a warning with no arrival as a false warning', () => {
    const timeline = [entry(0, [{ name: 'tide', x: 4000 }], [warn(0, 'tide', 3, 'fog')]), ...Array.from({ length: 20 }, (_, i) => entry(i + 1, []))];
    const m = computeMatchAccuracy(timeline, ENGAGE);
    expect(m.falseWarnings).toEqual([{ t: 0, heroes: ['tide'], source: ['fog'] }]);
  });

  it('does not count arrivals while the player is dead', () => {
    const timeline = [entry(0, [{ name: 'tide', x: 500 }], [], false)];
    expect(computeMatchAccuracy(timeline, ENGAGE).arrivals).toEqual([]);
  });

  it('counts repeated arrivals within 10 s once', () => {
    const timeline = [
      entry(0, [{ name: 'tide', x: 500 }]), entry(1, [{ name: 'tide', x: 1500 }]),
      entry(5, [{ name: 'tide', x: 500 }]), entry(20, [{ name: 'tide', x: 500 }]),
    ];
    expect(computeMatchAccuracy(timeline, ENGAGE).arrivals.map((a) => a.t)).toEqual([0, 20]);
  });

  it('computes the median of even and odd counts', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 3, 2])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  describe('summarize', () => {
    function match(caught: number, missed: number, error = 0.5): MatchAccuracy {
      return {
        arrivals: [
          ...Array.from({ length: caught }, (_, i) => ({ hero: `h${i}`, t: i, walking: true, caughtWithNotice: true, noticeSeconds: 5 })),
          ...Array.from({ length: missed }, (_, i) => ({ hero: `m${i}`, t: i, walking: true, caughtWithNotice: false, noticeSeconds: null })),
          { hero: 'blinker', t: 0, walking: false, caughtWithNotice: false, noticeSeconds: null },
        ],
        falseWarnings: [{ t: 1, heroes: ['x'], source: ['fog'] }],
        visibleErrors: [error],
        playSeconds: 180,
      };
    }

    it('fails with fewer than 5 recordings', () => {
      const s = summarize([match(8, 2), match(8, 2), match(8, 2), match(8, 2)]);
      expect(s.passed).toBe(false);
      expect(s.failures[0]).toContain('need ≥ 5 recordings');
    });

    it('fails at 79.9% and passes at 80%', () => {
      const failing = summarize([match(799, 201), match(0, 0), match(0, 0), match(0, 0), match(0, 0)]);
      expect(failing.catchRate).toBeCloseTo(0.799, 3);
      expect(failing.passed).toBe(false);
      const passing = summarize([match(800, 200), match(0, 0), match(0, 0), match(0, 0), match(0, 0)]);
      expect(passing.catchRate).toBe(0.8);
      expect(passing.passed).toBe(true);
    });

    it('excludes non-walking arrivals and does not gate on false warnings', () => {
      const s = summarize(Array.from({ length: 5 }, () => match(10, 0)));
      expect(s.walkingArrivals).toBe(50);
      expect(s.falseWarnings).toBe(5);
      expect(s.falseWarningsPer3Min).toBe(1);
      expect(s.passed).toBe(true);
    });

    it('fails when the median visible error exceeds 1.5 s', () => {
      const s = summarize(Array.from({ length: 5 }, () => match(10, 0, 2)));
      expect(s.passed).toBe(false);
      expect(s.failures.join()).toContain('median visible ETA error');
    });

    it('renders a markdown report with misses and false warnings', () => {
      const m = match(1, 1);
      const report = formatReport([{ file: 'a.jsonl.gz', accuracy: m, replayMatchesLive: true, notes: ['settings unknown'] }], summarize([m]));
      expect(report).toContain('**Result**: FAIL');
      expect(report).toContain('| a.jsonl.gz | 0 | m0 | none | yes |');
      expect(report).toContain('| a.jsonl.gz | 1 | x | fog |');
      expect(report).toContain('- a.jsonl.gz: settings unknown');
    });
  });
});
