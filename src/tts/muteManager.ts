import * as fs from 'fs';
import * as path from 'path';
import * as announcer from './announcer';

function getStatePath(): string {
  try {
    const { app } = require('electron');
    return path.resolve(app.getPath('userData'), 'app-state.json');
  } catch {
    return path.resolve(process.cwd(), 'config', 'app-state.json');
  }
}

interface AppState {
  volume: number;
  muted: boolean;
}

function readState(): AppState {
  try {
    const raw = fs.readFileSync(getStatePath(), 'utf-8');
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
  const statePath = getStatePath();
  const dir = path.dirname(statePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
}

export function loadMuteState(): boolean {
  const state = readState();
  announcer.setMuted(state.muted);
  return state.muted;
}

export function toggleMute(): boolean {
  const current = announcer.getMuted();
  const next = !current;
  announcer.setMuted(next);
  const state = readState();
  state.muted = next;
  writeState(state);
  return next;
}

export function setMuted(muted: boolean): void {
  announcer.setMuted(muted);
  const state = readState();
  state.muted = muted;
  writeState(state);
}

export function isMuted(): boolean {
  return announcer.getMuted();
}
