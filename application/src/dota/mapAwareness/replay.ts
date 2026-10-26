import * as fs from 'fs';
import * as zlib from 'zlib';
import { parseGsiPayload } from '../gsiParser';
import { GAME_STATES, PlayerSnapshot, VisibleHero } from '../gsiTypes';
import { createEngine } from './engine';
import { EngineSettings, MapAwarenessWarning } from './types';
import { LEAD_SECONDS, ENGAGE_DISTANCE, MAX_FOG_SECONDS } from './constants';

export interface RecordingLine {
  t: number;
  p?: Record<string, unknown> | null;
  s?: EngineSettings | null;
  w?: MapAwarenessWarning;
}

export interface TimelineEntry {
  t: number;
  player: PlayerSnapshot | null;
  enemies: VisibleHero[];
  warnings: MapAwarenessWarning[];
}

export interface ReplayResult {
  replayWarnings: MapAwarenessWarning[];
  liveWarnings: MapAwarenessWarning[];
  timeline: TimelineEntry[];
  engageDistance: number;
  hasSettings: boolean;
  hasLiveWarnings: boolean;
}

export const DEFAULT_ENGINE_SETTINGS: EngineSettings = {
  leadSeconds: LEAD_SECONDS.default,
  engageDistance: ENGAGE_DISTANCE.default,
  maxFogSeconds: MAX_FOG_SECONDS.default,
  visibleEnabled: true,
  fogEnabled: true,
};

export function parseRecording(buffer: Buffer): RecordingLine[] {
  // Z_SYNC_FLUSH lets a file truncated by a crash still yield every complete line.
  const text = zlib.gunzipSync(buffer, { finishFlush: zlib.constants.Z_SYNC_FLUSH }).toString('utf-8');
  const lines: RecordingLine[] = [];
  for (const raw of text.split('\n')) {
    if (raw.trim().length === 0) continue;
    try {
      lines.push(JSON.parse(raw));
    } catch {
      // A partially written final line is expected after a crash.
    }
  }
  return lines;
}

export function readRecording(filePath: string): RecordingLine[] {
  return parseRecording(fs.readFileSync(filePath));
}

export function replay(lines: RecordingLine[]): ReplayResult {
  const engine = createEngine();
  const hasSettings = lines.some((l) => 's' in l);
  let settings: EngineSettings | null = hasSettings ? null : DEFAULT_ENGINE_SETTINGS;
  let engageDistance = DEFAULT_ENGINE_SETTINGS.engageDistance;
  const replayWarnings: MapAwarenessWarning[] = [];
  const liveWarnings: MapAwarenessWarning[] = [];
  const timeline: TimelineEntry[] = [];

  for (const line of lines) {
    if ('s' in line) {
      settings = line.s ?? null;
      if (settings) engageDistance = settings.engageDistance;
      continue;
    }
    if (line.w) {
      liveWarnings.push(line.w);
      continue;
    }
    if (!('p' in line)) continue;

    const state = line.p ? parseGsiPayload(JSON.stringify(line.p)) : null;
    if (!state) {
      engine.reset();
      continue;
    }
    if (!settings) {
      engine.reset();
      continue;
    }

    const warnings = engine.step(state, settings);
    replayWarnings.push(...warnings);

    const last = timeline[timeline.length - 1];
    const isNewSecond = !last || state.clockTime > last.t;
    if (state.gameState === GAME_STATES.GAME_IN_PROGRESS && !state.paused && isNewSecond) {
      timeline.push({ t: state.clockTime, player: state.player ?? null, enemies: state.enemyHeroes ?? [], warnings });
    }
  }

  return {
    replayWarnings,
    liveWarnings,
    timeline,
    engageDistance,
    hasSettings,
    hasLiveWarnings: liveWarnings.length > 0,
  };
}
