import * as gsiServer from './gsiServer';
import { ParsedGameState } from './gsiTypes';
import { getDynamicEvents } from 'src/config/eventsLoader';

export type RoshanEventType = 'killed' | 'may_respawn' | 'respawn';

export interface RoshanEvent {
  type: RoshanEventType;
}

export type RoshanEventCallback = (event: RoshanEvent) => void;

let listeners: RoshanEventCallback[] = [];
let unsubGsi: (() => void) | null = null;
let previousRoshanState: string = 'alive';

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
  }

  if (previousRoshanState === 'respawn_base' && currentState === 'respawn_variable') {
    if (config.notifications.countdown) {
      notify({ type: 'may_respawn' });
    }
  }

  if ((previousRoshanState === 'respawn_base' || previousRoshanState === 'respawn_variable') && currentState === 'alive') {
    if (config.notifications.respawn) {
      notify({ type: 'respawn' });
    }
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

export function reset(): void {
  previousRoshanState = 'alive';
}

export function _resetForTesting(): void {
  stopListening();
  reset();
  listeners = [];
}
