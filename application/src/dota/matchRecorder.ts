import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

const HERO_UNIT_PREFIX = 'npc_dota_hero_';
const RECORDING_EXTENSION = '.jsonl.gz';
export const MAX_RECORDINGS = 20;

interface ActiveRecording {
  filePath: string;
  gzip: zlib.Gzip;
  finished: Promise<void>;
}

let active: ActiveRecording | null = null;
let dirOverride: string | null = null;

export function getRecordingsDir(): string {
  if (dirOverride) return dirOverride;
  try {
    const { app } = require('electron');
    return path.join(app.getPath('userData'), 'recordings');
  } catch {
    return path.join(process.cwd(), 'recordings');
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function sanitizeMatchId(matchId: string): string {
  const cleaned = String(matchId).replace(/[^A-Za-z0-9_-]/g, '_');
  return cleaned.length > 0 ? cleaned : 'unknown';
}

function uniqueFilePath(dir: string, base: string): string {
  let candidate = path.join(dir, `${base}${RECORDING_EXTENSION}`);
  let counter = 1;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${base}-${counter}${RECORDING_EXTENSION}`);
    counter++;
  }
  return candidate;
}

function pick(source: unknown, keys: string[]): Record<string, unknown> | undefined {
  if (!source || typeof source !== 'object') return undefined;
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const value = (source as Record<string, unknown>)[key];
    if (value !== undefined) result[key] = value;
  }
  return result;
}

export function trimPayload(body: string): Record<string, unknown> | null {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(body);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;

  const trimmed: Record<string, unknown> = {};
  if (data.map !== undefined) trimmed.map = data.map;
  const player = pick(data.player, ['team_name']);
  if (player) trimmed.player = player;
  const hero = pick(data.hero, ['name', 'alive', 'xpos', 'ypos']);
  if (hero) trimmed.hero = hero;
  if (data.minimap && typeof data.minimap === 'object') {
    const heroes: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(data.minimap as Record<string, unknown>)) {
      const unitname = entry && typeof entry === 'object' ? (entry as Record<string, unknown>).unitname : undefined;
      if (typeof unitname === 'string' && unitname.startsWith(HERO_UNIT_PREFIX)) heroes[key] = entry;
    }
    trimmed.minimap = heroes;
  }
  if (Array.isArray(data.events)) trimmed.events = data.events;
  return trimmed;
}

function writeLine(line: Record<string, unknown>): void {
  if (!active) return;
  active.gzip.write(`${JSON.stringify(line)}\n`);
}

function enforceRetention(dir: string): void {
  try {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(RECORDING_EXTENSION)).sort();
    const excess = files.length - MAX_RECORDINGS;
    for (let i = 0; i < excess; i++) {
      fs.unlinkSync(path.join(dir, files[i]));
    }
  } catch (error) {
    console.error('[matchRecorder] retention cleanup failed', { dir, error: (error as Error).message });
  }
}

function handleStreamError(recording: ActiveRecording, error: Error): void {
  if (active !== recording) return;
  console.error('[matchRecorder] recording stopped after write error', { filePath: recording.filePath, error: error.message });
  active = null;
  recording.gzip.destroy();
}

export function start(matchId: string, nowMs: number = Date.now()): void {
  if (active) void stop();

  const dir = getRecordingsDir();
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (error) {
    console.error('[matchRecorder] cannot create recordings folder', { dir, error: (error as Error).message });
    return;
  }

  const filePath = uniqueFilePath(dir, `${formatTimestamp(nowMs)}-${sanitizeMatchId(matchId)}`);
  const gzip = zlib.createGzip();
  const file = fs.createWriteStream(filePath);
  const finished = new Promise<void>((resolve) => {
    file.on('close', () => resolve());
    file.on('error', () => resolve());
  });
  const recording: ActiveRecording = { filePath, gzip, finished };
  gzip.on('error', (error) => handleStreamError(recording, error));
  file.on('error', (error) => handleStreamError(recording, error));
  gzip.pipe(file);
  active = recording;
  console.info('[matchRecorder] recording started', { filePath });
}

// Unparseable bodies are kept as `p: null` because the live server treats them as a disconnect.
export function append(rawBody: string, receivedAtMs: number = Date.now()): void {
  if (!active) return;
  writeLine({ t: receivedAtMs, p: trimPayload(rawBody) });
}

export function appendSettings(settings: unknown, receivedAtMs: number = Date.now()): void {
  writeLine({ t: receivedAtMs, s: settings });
}

export function appendWarning(warning: unknown, receivedAtMs: number = Date.now()): void {
  writeLine({ t: receivedAtMs, w: warning });
}

export function stop(): Promise<void> {
  const recording = active;
  if (!recording) return Promise.resolve();
  active = null;
  recording.gzip.end();
  return recording.finished.then(() => {
    console.info('[matchRecorder] recording stopped', { filePath: recording.filePath });
    enforceRetention(path.dirname(recording.filePath));
  });
}

export function isRecording(): boolean {
  return active !== null;
}

export function getActiveFilePath(): string | null {
  return active ? active.filePath : null;
}

export function _setRecordingsDirForTesting(dir: string | null): void {
  dirOverride = dir;
}

export function _resetForTesting(): void {
  if (active) {
    active.gzip.destroy();
    active = null;
  }
  dirOverride = null;
}
