import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as zlib from 'zlib';
import * as recorder from './matchRecorder';

function readLines(filePath: string): Record<string, unknown>[] {
  const text = zlib.gunzipSync(fs.readFileSync(filePath)).toString('utf-8');
  return text.split('\n').filter((l) => l.length > 0).map((l) => JSON.parse(l));
}

function listRecordings(dir: string): string[] {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl.gz')).sort();
}

const FULL_PAYLOAD = {
  provider: { name: 'Dota 2' },
  map: { matchid: '123', clock_time: 10, game_state: 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS' },
  player: { steamid: '76561198000000000', accountid: '1', name: 'Someone', team_name: 'radiant', gold: 100 },
  hero: { name: 'npc_dota_hero_ursa', alive: true, xpos: 1, ypos: 2, health: 500 },
  items: { slot0: { name: 'item_blink' } },
  wearables: { wearable0: 1 },
  abilities: {},
  buildings: {},
  minimap: {
    o1: { xpos: 5, ypos: 6, team: 3, unitname: 'npc_dota_hero_tidehunter', yaw: 10 },
    o2: { xpos: 7, ypos: 8, team: 2, unitname: 'npc_dota_creep_goodguys_melee' },
  },
  events: [{ event_type: 'roshan_killed', game_time: 5 }],
  previously: { map: { clock_time: 9 } },
};

describe('matchRecorder', () => {
  let dir: string;

  beforeEach(() => {
    recorder._resetForTesting();
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'recorder-'));
    recorder._setRecordingsDirForTesting(dir);
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    recorder._resetForTesting();
    fs.rmSync(dir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  it('writes trimmed payload lines in order into one gzip file', async () => {
    recorder.start('123', Date.UTC(2026, 9, 26, 10, 0, 0));
    for (let i = 0; i < 3; i++) {
      recorder.append(JSON.stringify({ ...FULL_PAYLOAD, map: { ...FULL_PAYLOAD.map, clock_time: i } }), 1000 + i);
    }
    await recorder.stop();

    const files = listRecordings(dir);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(/^\d{8}-\d{6}-123\.jsonl\.gz$/);
    const lines = readLines(path.join(dir, files[0]));
    expect(lines.map((l) => l.t)).toEqual([1000, 1001, 1002]);
    expect(lines.map((l) => (l.p as { map: { clock_time: number } }).map.clock_time)).toEqual([0, 1, 2]);
  });

  it('strips personal data and non-hero entries', async () => {
    recorder.start('123');
    recorder.append(JSON.stringify(FULL_PAYLOAD), 1);
    await recorder.stop();

    const [line] = readLines(path.join(dir, listRecordings(dir)[0]));
    const text = JSON.stringify(line);
    expect(text).not.toContain('steamid');
    expect(text).not.toContain('accountid');
    expect(text).not.toContain('Someone');
    expect(text).not.toContain('item_blink');
    expect(text).not.toContain('wearable');
    expect(text).not.toContain('previously');
    expect(text).not.toContain('creep');
    expect(line.p).toEqual({
      map: FULL_PAYLOAD.map,
      player: { team_name: 'radiant' },
      hero: { name: 'npc_dota_hero_ursa', alive: true, xpos: 1, ypos: 2 },
      minimap: { o1: FULL_PAYLOAD.minimap.o1 },
      events: FULL_PAYLOAD.events,
    });
  });

  it('records malformed bodies as null payloads and keeps recording', async () => {
    recorder.start('123');
    recorder.append('{broken', 1);
    recorder.append(JSON.stringify(FULL_PAYLOAD), 2);
    await recorder.stop();
    const lines = readLines(path.join(dir, listRecordings(dir)[0]));
    expect(lines).toHaveLength(2);
    expect(lines[0]).toEqual({ t: 1, p: null });
    expect(lines[1].p).toBeDefined();
  });

  it('ignores append when not recording', async () => {
    recorder.append(JSON.stringify(FULL_PAYLOAD), 1);
    recorder.appendSettings({ leadSeconds: 5 }, 1);
    recorder.appendWarning({ heroes: [] }, 1);
    expect(recorder.isRecording()).toBe(false);
    expect(listRecordings(dir)).toHaveLength(0);
  });

  it('closes the first file when start is called twice', async () => {
    recorder.start('1', Date.UTC(2026, 0, 1));
    recorder.append(JSON.stringify(FULL_PAYLOAD), 1);
    recorder.start('2', Date.UTC(2026, 0, 1));
    recorder.append(JSON.stringify(FULL_PAYLOAD), 2);
    await recorder.stop();
    await new Promise((r) => setTimeout(r, 50));

    const files = listRecordings(dir);
    expect(files).toHaveLength(2);
    for (const f of files) {
      expect(readLines(path.join(dir, f))).toHaveLength(1);
    }
  });

  it('sanitises match ids used in file names', async () => {
    recorder.start('../../evil');
    await recorder.stop();
    const files = listRecordings(dir);
    expect(files).toHaveLength(1);
    expect(files[0]).not.toContain('/');
    expect(files[0]).toMatch(/-______evil\.jsonl\.gz$/);
  });

  it('stops recording without throwing on write errors', async () => {
    recorder.start('123');
    fs.rmSync(dir, { recursive: true, force: true });
    expect(() => recorder.append(JSON.stringify(FULL_PAYLOAD), 1)).not.toThrow();
    await new Promise((r) => setTimeout(r, 50));
    expect(recorder.isRecording()).toBe(false);
    expect(console.error).toHaveBeenCalled();
    await expect(recorder.stop()).resolves.toBeUndefined();
  });

  it('does not record when the folder cannot be created', () => {
    const blocker = path.join(dir, 'blocker');
    fs.writeFileSync(blocker, '');
    recorder._setRecordingsDirForTesting(path.join(blocker, 'sub'));
    expect(() => recorder.start('123')).not.toThrow();
    expect(recorder.isRecording()).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it('keeps only the newest recordings', async () => {
    for (let i = 0; i < recorder.MAX_RECORDINGS + 1; i++) {
      fs.writeFileSync(path.join(dir, `2025010${i < 10 ? '0' : ''}${i}-000000-old.jsonl.gz`), '');
    }
    recorder.start('new', Date.UTC(2026, 0, 1));
    await recorder.stop();

    const files = listRecordings(dir);
    expect(files).toHaveLength(recorder.MAX_RECORDINGS);
    expect(files[files.length - 1]).toMatch(/-new\.jsonl\.gz$/);
    expect(files).not.toContain('2025010000-000000-old.jsonl.gz');
  });

  it('writes settings and warning lines while recording', async () => {
    recorder.start('123');
    recorder.appendSettings({ leadSeconds: 5 }, 1);
    recorder.append(JSON.stringify(FULL_PAYLOAD), 2);
    recorder.appendWarning({ heroes: [{ name: 'tidehunter' }] }, 3);
    await recorder.stop();
    const lines = readLines(path.join(dir, listRecordings(dir)[0]));
    expect(lines[0]).toEqual({ t: 1, s: { leadSeconds: 5 } });
    expect(lines[1].p).toBeDefined();
    expect(lines[2]).toEqual({ t: 3, w: { heroes: [{ name: 'tidehunter' }] } });
  });
});
