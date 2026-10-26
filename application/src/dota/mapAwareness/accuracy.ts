import { TimelineEntry } from './replay';
import { MapAwarenessWarning, WarningSource } from './types';
import { MAX_MOVE_SPEED, BLINK_REJECT_FACTOR } from './constants';

export const ARRIVAL_COOLDOWN_SECONDS = 10;
export const CATCH_WINDOW_SECONDS = 30;
export const MIN_NOTICE_SECONDS = 3;
export const FALSE_WARNING_GRACE_SECONDS = 5;
export const BLINK_LOOKBACK_SECONDS = 3;
export const REQUIRED_RECORDINGS = 5;
export const REQUIRED_CATCH_RATE = 0.8;
export const MAX_MEDIAN_VISIBLE_ERROR = 1.5;

export interface Arrival {
  hero: string;
  t: number;
  walking: boolean;
  caughtWithNotice: boolean;
  noticeSeconds: number | null;
}

export interface FalseWarning {
  t: number;
  heroes: string[];
  source: WarningSource[];
}

export interface MatchAccuracy {
  arrivals: Arrival[];
  falseWarnings: FalseWarning[];
  visibleErrors: number[];
  playSeconds: number;
}

export interface AccuracySummary {
  recordings: number;
  walkingArrivals: number;
  caughtWithNotice: number;
  catchRate: number | null;
  medianVisibleError: number | null;
  falseWarnings: number;
  falseWarningsPer3Min: number | null;
  passed: boolean;
  failures: string[];
}

interface Seen {
  t: number;
  x: number;
  y: number;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function heroHistory(timeline: TimelineEntry[]): Map<string, Seen[]> {
  const history = new Map<string, Seen[]>();
  for (const entry of timeline) {
    for (const e of entry.enemies) {
      const list = history.get(e.name) ?? [];
      list.push({ t: entry.t, x: e.x, y: e.y });
      history.set(e.name, list);
    }
  }
  return history;
}

function isWalking(seen: Seen[], arrivalT: number): boolean {
  const idx = seen.findIndex((s) => s.t === arrivalT);
  if (idx <= 0) return true;
  const arrival = seen[idx];
  const prev = seen[idx - 1];
  if (arrival.t - prev.t > 1) {
    return dist(prev, arrival) <= (arrival.t - prev.t) * MAX_MOVE_SPEED;
  }
  for (let i = idx; i > 0 && seen[i].t >= arrivalT - BLINK_LOOKBACK_SECONDS; i--) {
    const a = seen[i - 1];
    const b = seen[i];
    if (b.t - a.t !== 1) break;
    if (dist(a, b) > MAX_MOVE_SPEED * BLINK_REJECT_FACTOR) return false;
  }
  return true;
}

function findArrivals(timeline: TimelineEntry[], engageDistance: number): Omit<Arrival, 'caughtWithNotice' | 'noticeSeconds'>[] {
  const history = heroHistory(timeline);
  const lastInRange = new Map<string, number>();
  const arrivals: Omit<Arrival, 'caughtWithNotice' | 'noticeSeconds'>[] = [];
  for (const entry of timeline) {
    if (!entry.player || !entry.player.alive) continue;
    for (const e of entry.enemies) {
      if (dist(e, entry.player) > engageDistance) continue;
      const previous = lastInRange.get(e.name);
      if (previous === undefined || entry.t - previous > ARRIVAL_COOLDOWN_SECONDS) {
        arrivals.push({ hero: e.name, t: entry.t, walking: isWalking(history.get(e.name) ?? [], entry.t) });
      }
      lastInRange.set(e.name, entry.t);
    }
  }
  return arrivals;
}

function allWarnings(timeline: TimelineEntry[]): MapAwarenessWarning[] {
  return timeline.flatMap((e) => e.warnings);
}

export function computeMatchAccuracy(timeline: TimelineEntry[], engageDistance: number): MatchAccuracy {
  const warnings = allWarnings(timeline);
  const rawArrivals = findArrivals(timeline, engageDistance);

  const arrivals: Arrival[] = rawArrivals.map((a) => {
    const matching = warnings.filter((w) => w.clockTime <= a.t && w.clockTime >= a.t - CATCH_WINDOW_SECONDS && w.heroes.some((h) => h.name === a.hero));
    const latest = matching.length > 0 ? matching[matching.length - 1] : null;
    return {
      ...a,
      caughtWithNotice: matching.some((w) => a.t - w.clockTime >= MIN_NOTICE_SECONDS),
      noticeSeconds: latest ? a.t - latest.clockTime : null,
    };
  });

  const visibleErrors: number[] = [];
  const falseWarnings: FalseWarning[] = [];
  for (const w of warnings) {
    let explained = false;
    for (const h of w.heroes) {
      const arrival = rawArrivals.find((a) => a.hero === h.name && a.t >= w.clockTime && a.t <= w.clockTime + h.etaSeconds + FALSE_WARNING_GRACE_SECONDS);
      if (!arrival) continue;
      explained = true;
      if (h.source === 'visible') visibleErrors.push(Math.abs(h.etaSeconds - (arrival.t - w.clockTime)));
    }
    if (!explained) {
      falseWarnings.push({ t: w.clockTime, heroes: w.heroes.map((h) => h.name), source: w.heroes.map((h) => h.source) });
    }
  }

  return { arrivals, falseWarnings, visibleErrors, playSeconds: timeline.length };
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function summarize(matches: MatchAccuracy[]): AccuracySummary {
  const walking = matches.flatMap((m) => m.arrivals.filter((a) => a.walking));
  const caught = walking.filter((a) => a.caughtWithNotice).length;
  const catchRate = walking.length > 0 ? caught / walking.length : null;
  const medianVisibleError = median(matches.flatMap((m) => m.visibleErrors));
  const falseWarnings = matches.reduce((sum, m) => sum + m.falseWarnings.length, 0);
  const playSeconds = matches.reduce((sum, m) => sum + m.playSeconds, 0);

  const failures: string[] = [];
  if (matches.length < REQUIRED_RECORDINGS) failures.push(`need ≥ ${REQUIRED_RECORDINGS} recordings (have ${matches.length})`);
  if (catchRate === null) failures.push('no walking arrivals recorded');
  else if (catchRate < REQUIRED_CATCH_RATE) failures.push(`catch rate ${(catchRate * 100).toFixed(1)}% < ${REQUIRED_CATCH_RATE * 100}%`);
  if (medianVisibleError === null) failures.push('no visible warnings matched an arrival');
  else if (medianVisibleError > MAX_MEDIAN_VISIBLE_ERROR) failures.push(`median visible ETA error ${medianVisibleError.toFixed(2)} s > ${MAX_MEDIAN_VISIBLE_ERROR} s`);

  return {
    recordings: matches.length,
    walkingArrivals: walking.length,
    caughtWithNotice: caught,
    catchRate,
    medianVisibleError,
    falseWarnings,
    falseWarningsPer3Min: playSeconds > 0 ? falseWarnings / (playSeconds / 180) : null,
    passed: failures.length === 0,
    failures,
  };
}

export interface FileReport {
  file: string;
  accuracy: MatchAccuracy;
  replayMatchesLive: boolean | null;
  notes: string[];
}

function pct(value: number | null): string {
  return value === null ? 'n/a' : `${(value * 100).toFixed(1)}%`;
}

function num(value: number | null, digits = 2): string {
  return value === null ? 'n/a' : value.toFixed(digits);
}

export function formatReport(files: FileReport[], summary: AccuracySummary): string {
  const lines: string[] = [
    '# Map Awareness Accuracy Report',
    '',
    `**Result**: ${summary.passed ? 'PASS' : 'FAIL'}${summary.failures.length > 0 ? ` — ${summary.failures.join('; ')}` : ''}`,
    '',
    '| Metric | Value | Target |',
    '|---|---|---|',
    `| Recordings | ${summary.recordings} | ≥ ${REQUIRED_RECORDINGS} |`,
    `| Walking arrivals | ${summary.walkingArrivals} | — |`,
    `| Caught with ≥ ${MIN_NOTICE_SECONDS} s notice | ${summary.caughtWithNotice} (${pct(summary.catchRate)}) | ≥ ${REQUIRED_CATCH_RATE * 100}% |`,
    `| Median visible ETA error | ${num(summary.medianVisibleError)} s | ≤ ${MAX_MEDIAN_VISIBLE_ERROR} s |`,
    `| False warnings | ${summary.falseWarnings} (${num(summary.falseWarningsPer3Min)} per 3 min) | reported only |`,
    '',
    '## Per match',
    '',
    '| File | Play (s) | Walking arrivals | Caught | False warnings | Replay = live |',
    '|---|---|---|---|---|---|',
  ];
  for (const f of files) {
    const walking = f.accuracy.arrivals.filter((a) => a.walking);
    const caught = walking.filter((a) => a.caughtWithNotice).length;
    const live = f.replayMatchesLive === null ? 'skipped' : f.replayMatchesLive ? 'yes' : '**NO**';
    lines.push(`| ${f.file} | ${f.accuracy.playSeconds} | ${walking.length} | ${caught} | ${f.accuracy.falseWarnings.length} | ${live} |`);
  }

  lines.push('', '## Misses', '', '| File | Clock | Hero | Notice (s) | Walking |', '|---|---|---|---|---|');
  for (const f of files) {
    for (const a of f.accuracy.arrivals.filter((x) => !x.caughtWithNotice)) {
      lines.push(`| ${f.file} | ${a.t} | ${a.hero} | ${a.noticeSeconds ?? 'none'} | ${a.walking ? 'yes' : 'no (excluded)'} |`);
    }
  }

  lines.push('', '## False warnings', '', '| File | Clock | Heroes | Source |', '|---|---|---|---|');
  for (const f of files) {
    for (const w of f.accuracy.falseWarnings) {
      lines.push(`| ${f.file} | ${w.t} | ${w.heroes.join(', ')} | ${w.source.join(', ')} |`);
    }
  }

  const notes = files.flatMap((f) => f.notes.map((n) => `- ${f.file}: ${n}`));
  if (notes.length > 0) lines.push('', '## Notes', '', ...notes);
  return `${lines.join('\n')}\n`;
}
