import * as fs from 'fs';
import * as path from 'path';
import * as announcer from './announcer';

const STATE_PATH = path.resolve(process.cwd(), 'config', 'app-state.json');

interface AppState {
  volume: number;
  muted: boolean;
}

function readState(): AppState {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      volume: typeof parsed.volume === 'number' ? parsed.volume : 100,
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : false,
    };
  } catch {
    return { volume: 100, muted: false };
  }
}

function writeState(state: AppState): void {
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

export function loadVolume(): number {
  const state = readState();
  announcer.setVolume(state.volume);
  return state.volume;
}

export function setVolume(value: number): void {
  const clamped = Math.max(0, Math.min(100, value));
  announcer.setVolume(clamped);
  const state = readState();
  state.volume = clamped;
  writeState(state);
}

export function getVolume(): number {
  return announcer.getVolume();
}
