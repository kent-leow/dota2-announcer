import * as fs from 'fs';
import * as path from 'path';

export interface AppState {
  volume: number;
  muted: boolean;
}

function getStatePath(): string {
  try {
    const { app } = require('electron');
    return path.resolve(app.getPath('userData'), 'app-state.json');
  } catch {
    return path.resolve(process.cwd(), 'config', 'app-state.json');
  }
}

export function readAppState(): AppState {
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

export function writeAppState(state: AppState): void {
  const statePath = getStatePath();
  const dir = path.dirname(statePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
}
