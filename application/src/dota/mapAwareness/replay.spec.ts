import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as zlib from 'zlib';
import * as recorder from '../matchRecorder';
import { createEngine } from './engine';
import { parseGsiPayload } from '../gsiParser';
import { readRecording, replay, parseRecording, DEFAULT_ENGINE_SETTINGS, RecordingLine } from './replay';
import { EngineSettings, MapAwarenessWarning } from './types';
import { GAME_STATES } from '../gsiTypes';

interface Enemy { name: string; x: number; y: number }

function payload(t: number, enemies: Enemy[], opts: { radiantScore?: number; matchId?: string } = {}): string {
  const minimap: Record<string, unknown> = {
    o0: { xpos: 0, ypos: 0, team: 2, unitname: 'npc_dota_hero_ursa' },
    o1: { xpos: 100, ypos: 100, team: 3, unitname: 'npc_dota_creep_badguys_melee' },
  };
  enemies.forEach((e, i) => { minimap[`o${i + 10}`] = { xpos: e.x, ypos: e.y, team: 3, unitname: `npc_dota_hero_${e.name}` }; });
  return JSON.stringify({
    map: { matchid: opts.matchId ?? '0', clock_time: t, game_state: GAME_STATES.GAME_IN_PROGRESS, paused: false, daytime: true, radiant_score: opts.radiantScore ?? 0, dire_score: 0 },
    player: { team_name: 'radiant', steamid: 'secret' },
    hero: { name: 'npc_dota_hero_ursa', alive: true, xpos: 0, ypos: 0 },
    minimap,
  });
}

function scenario(): string[] {
  const bodies: string[] = [];
  for (let t = 0; t <= 8; t++) bodies.push(payload(t, [{ name: 'tidehunter', x: 4000 - 300 * t, y: 0 }]));
  bodies.push(payload(9, [{ name: 'nevermore', x: 0, y: 4000 }]));
  bodies.push(payload(10, [{ name: 'nevermore', x: 0, y: 4000 }]));
  for (let t = 11; t <= 16; t++) bodies.push(payload(t, []));
  bodies.push(payload(17, [{ name: 'lion', x: 1500, y: 0 }]));
  bodies.push(payload(18, [], { radiantScore: 1 }));
  for (let t = 19; t <= 24; t++) bodies.push(payload(t, [], { radiantScore: 1 }));
  return bodies;
}

function simulateLive(bodies: string[], settings: EngineSettings): void {
  const engine = createEngine();
  recorder.appendSettings(settings, 0);
  bodies.forEach((body, i) => {
    const state = parseGsiPayload(body);
    if (state) engine.step(state, settings).forEach((w) => recorder.appendWarning(w, i));
    recorder.append(body, i);
  });
}

describe('replay', () => {
  let dir: string;

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'replay-'));
    recorder._resetForTesting();
    recorder._setRecordingsDirForTesting(dir);
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    recorder._resetForTesting();
    fs.rmSync(dir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  async function record(bodies: string[], settings = DEFAULT_ENGINE_SETTINGS): Promise<string> {
    recorder.start('0');
    const file = recorder.getActiveFilePath()!;
    simulateLive(bodies, settings);
    await recorder.stop();
    return file;
  }

  it('reproduces exactly the warnings fired live', async () => {
    const result = replay(readRecording(await record(scenario())));
    expect(result.liveWarnings.length).toBeGreaterThan(0);
    expect(result.replayWarnings).toEqual(result.liveWarnings);
    expect(result.hasSettings).toBe(true);
  });

  it('builds a per-second timeline of in-progress play', async () => {
    const result = replay(readRecording(await record(scenario())));
    expect(result.timeline.map((e) => e.t)).toEqual(Array.from({ length: 25 }, (_, i) => i));
    expect(result.timeline[0].enemies).toEqual([{ name: 'tidehunter', x: 4000, y: 0 }]);
  });

  it('reads every complete line from a truncated file', async () => {
    const file = await record(scenario());
    const full = fs.readFileSync(file);
    const all = parseRecording(full);
    const truncated = parseRecording(full.subarray(0, Math.floor(full.length * 0.7)));
    expect(truncated.length).toBeGreaterThan(0);
    expect(truncated.length).toBeLessThan(all.length);
    expect(truncated).toEqual(all.slice(0, truncated.length));
  });

  it('applies a settings change from that line onward', () => {
    const lines: RecordingLine[] = [
      { t: 0, s: { ...DEFAULT_ENGINE_SETTINGS, visibleEnabled: false } },
      ...scenario().slice(0, 9).map((b, i) => ({ t: i, p: JSON.parse(b) })),
    ];
    expect(replay(lines).replayWarnings).toEqual([]);

    const enabledLater: RecordingLine[] = [
      { t: 0, s: { ...DEFAULT_ENGINE_SETTINGS, visibleEnabled: false } },
      ...scenario().slice(0, 4).map((b, i) => ({ t: i, p: JSON.parse(b) })),
      { t: 4, s: DEFAULT_ENGINE_SETTINGS },
      ...scenario().slice(4, 9).map((b, i) => ({ t: i + 4, p: JSON.parse(b) })),
    ];
    expect(replay(enabledLater).replayWarnings).toHaveLength(1);
  });

  it('does not step while the feature was disabled', () => {
    const lines: RecordingLine[] = [
      { t: 0, s: null },
      ...scenario().slice(0, 9).map((b, i) => ({ t: i, p: JSON.parse(b) })),
    ];
    expect(replay(lines).replayWarnings).toEqual([]);
  });

  it('uses default settings when the recording has none', () => {
    const lines: RecordingLine[] = scenario().slice(0, 9).map((b, i) => ({ t: i, p: JSON.parse(b) }));
    const result = replay(lines);
    expect(result.hasSettings).toBe(false);
    expect(result.replayWarnings).toHaveLength(1);
  });

  it('resets on unparseable payload markers like the live server', () => {
    const bodies = scenario().slice(0, 5).map((b, i) => ({ t: i, p: JSON.parse(b) }));
    const lines: RecordingLine[] = [...bodies, { t: 5, p: null }, ...scenario().slice(5, 9).map((b, i) => ({ t: i + 5, p: JSON.parse(b) }))];
    const engine = createEngine();
    const live: MapAwarenessWarning[] = [];
    for (const l of lines) {
      const state = l.p ? parseGsiPayload(JSON.stringify(l.p)) : null;
      if (!state) { engine.reset(); continue; }
      live.push(...engine.step(state, DEFAULT_ENGINE_SETTINGS));
    }
    expect(replay(lines).replayWarnings).toEqual(live);
  });

  it('returns empty results for an empty recording', () => {
    const buffer = zlib.gzipSync('');
    expect(replay(parseRecording(buffer))).toMatchObject({ replayWarnings: [], liveWarnings: [], timeline: [] });
  });
});
