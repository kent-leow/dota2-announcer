import * as gsiServer from './gsiServer';
import { ParsedGameState } from './gsiTypes';
import { createEngine } from './mapAwareness/engine';
import { toEngineSettings } from './mapAwareness/settings';
import * as configHolder from './mapAwareness/configHolder';
import { EngineSettings, MapAwarenessWarning } from './mapAwareness/types';
import * as matchRecorder from './matchRecorder';

export type MapAwarenessWarningCallback = (warning: MapAwarenessWarning) => void;

const engine = createEngine();
let listeners: MapAwarenessWarningCallback[] = [];
let unsubGsi: (() => void) | null = null;
let errorLogged = false;
let recordedSettingsKey: string | null = null;

function recordSettings(settings: EngineSettings | null): void {
  const filePath = matchRecorder.getActiveFilePath();
  if (!filePath) return;
  const key = `${filePath}|${JSON.stringify(settings)}`;
  if (key === recordedSettingsKey) return;
  recordedSettingsKey = key;
  matchRecorder.appendSettings(settings);
}

function emit(warning: MapAwarenessWarning): void {
  console.info('[map-awareness] warning', {
    clockTime: warning.clockTime,
    heroes: warning.heroes.map((h) => `${h.name}:${h.source}:${h.etaSeconds.toFixed(1)}`),
  });
  matchRecorder.appendWarning(warning);
  listeners.forEach((cb) => cb(warning));
}

function handleGsiState(state: ParsedGameState): void {
  const settings = toEngineSettings(configHolder.getConfig());
  recordSettings(settings);
  if (!settings) {
    engine.reset();
    return;
  }

  let warnings: MapAwarenessWarning[];
  try {
    warnings = engine.step(state, settings);
  } catch (error) {
    if (!errorLogged) {
      errorLogged = true;
      console.error('[map-awareness] engine step failed', (error as Error).message);
    }
    return;
  }
  warnings.forEach(emit);
}

export function startListening(): void {
  if (unsubGsi) return;
  unsubGsi = gsiServer.onStateChange(handleGsiState);
}

export function stopListening(): void {
  if (unsubGsi) {
    unsubGsi();
    unsubGsi = null;
  }
}

export function onWarning(callback: MapAwarenessWarningCallback): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function reset(): void {
  engine.reset();
  errorLogged = false;
  recordedSettingsKey = null;
}

export function _resetForTesting(): void {
  stopListening();
  reset();
  listeners = [];
}
