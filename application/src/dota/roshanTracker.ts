import * as gsiServer from './gsiServer';
import { ParsedGameState } from './gsiTypes';
import { getDynamicEvents } from 'src/config/eventsLoader';

export type RoshanEventType = 'killed' | 'countdown' | 'respawn';

export interface RoshanEvent {
  type: RoshanEventType;
  remainingSeconds?: number;
}

export type RoshanEventCallback = (event: RoshanEvent) => void;

let listeners: RoshanEventCallback[] = [];
let unsubGsi: (() => void) | null = null;
let previousRoshanState: string = 'alive';
let lastCountdownMinute: number = -1;

function getConfig() {
  const dynamic = getDynamicEvents();
  return dynamic.dynamicEvents.find((e) => e.id === 'roshan');
}

function handleGsiState(state: ParsedGameState): void {
  const config = getConfig();
  if (!config || !config.enabled) return;

  const currentState = state.roshanState;

  if (previousRoshanState === 'alive' && (currentState === 'respawn_base' || currentState === 'respawn_variable')) {
    if (config.notifications.kill) {
      notify({ type: 'killed' });
    }
    lastCountdownMinute = -1;
  }

  if ((currentState === 'respawn_base' || currentState === 'respawn_variable') && config.notifications.countdown) {
    const endSeconds = state.roshanStateEndSeconds;
    const currentMinute = Math.ceil(endSeconds / 60);
    if (currentMinute > 0 && currentMinute !== lastCountdownMinute) {
      lastCountdownMinute = currentMinute;
      notify({ type: 'countdown', remainingSeconds: endSeconds });
    }
  }

  if ((previousRoshanState === 'respawn_base' || previousRoshanState === 'respawn_variable') && currentState === 'alive') {
    if (config.notifications.respawn) {
      notify({ type: 'respawn' });
    }
    lastCountdownMinute = -1;
  }

  previousRoshanState = currentState;
}

function notify(event: RoshanEvent): void {
  listeners.forEach((cb) => cb(event));
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

export function onRoshanEvent(callback: RoshanEventCallback): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function getRoshanState(): string {
  return previousRoshanState;
}

export function _resetForTesting(): void {
  stopListening();
  previousRoshanState = 'alive';
  lastCountdownMinute = -1;
  listeners = [];
}
