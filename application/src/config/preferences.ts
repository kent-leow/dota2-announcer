import * as fs from 'fs';
import * as path from 'path';

export type CloseBehavior = 'ask' | 'minimize' | 'quit';

export interface Preferences {
  closeBehavior: CloseBehavior;
}

const DEFAULT_PREFERENCES: Preferences = {
  closeBehavior: 'ask',
};

function getPreferencesPath(): string {
  try {
    const { app } = require('electron');
    return path.resolve(app.getPath('userData'), 'preferences.json');
  } catch {
    return path.resolve(process.cwd(), 'config', 'preferences.json');
  }
}

export function loadPreferences(): Preferences {
  try {
    const raw = fs.readFileSync(getPreferencesPath(), 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      closeBehavior: isCloseBehavior(parsed.closeBehavior) ? parsed.closeBehavior : 'ask',
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

export function savePreferences(prefs: Preferences): void {
  const filePath = getPreferencesPath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(prefs, null, 2), 'utf-8');
}

export function resetClosePreference(): void {
  const prefs = loadPreferences();
  prefs.closeBehavior = 'ask';
  savePreferences(prefs);
}

function isCloseBehavior(val: unknown): val is CloseBehavior {
  return val === 'ask' || val === 'minimize' || val === 'quit';
}
