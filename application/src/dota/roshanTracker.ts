import * as gsiServer from './gsiServer';
import { ParsedGameState } from './gsiTypes';
import { getDynamicEvents } from 'src/config/eventsLoader';

export type RoshanEventType = 'killed' | 'may_respawn' | 'respawn';

export interface RoshanEvent {
  type: RoshanEventType;
  killedByTeam?: string;
}

export type RoshanEventCallback = (event: RoshanEvent) => void;

let listeners: RoshanEventCallback[] = [];
let unsubGsi: (() => void) | null = null;
let previousRoshanState: string = 'alive';
let lastProcessedRoshanKillTime: number = -1;
let roshanKillGameTime: number = 0;
let lastMayRespawnMinute: number = -1;

const ROSHAN_MIN_RESPAWN_S = 480;
const ROSHAN_MAX_RESPAWN_S = 660;
const MAY_RESPAWN_INTERVAL_S = 60;

function getConfig() {
  const dynamic = getDynamicEvents();
  return dynamic.dynamicEvents.find((e) => e.id === 'roshan');
}

function handleGsiState(state: ParsedGameState): void {
  const config = getConfig();
  if (!config || !config.enabled) return;

  const roshanKillEvent = state.events.find(
    (e) => e.event_type === 'roshan_killed' && e.game_time !== lastProcessedRoshanKillTime,
  );

  if (roshanKillEvent && previousRoshanState === 'alive') {
    lastProcessedRoshanKillTime = roshanKillEvent.game_time;
    roshanKillGameTime = roshanKillEvent.game_time;
    previousRoshanState = 'respawn_base';
    if (config.notifications.kill) {
      notify({ type: 'killed', killedByTeam: roshanKillEvent.killed_by_team });
    }
    return;
  }

  const hasExplicitRoshanState = state.roshanState !== 'alive' || roshanKillGameTime > 0;

  if (hasExplicitRoshanState && roshanKillGameTime > 0) {
    const elapsed = state.clockTime - roshanKillGameTime;

    if (elapsed >= ROSHAN_MAX_RESPAWN_S) {
      previousRoshanState = 'alive';
      roshanKillGameTime = 0;
      lastMayRespawnMinute = -1;
      if (config.notifications.respawn) {
        notify({ type: 'respawn' });
      }
      return;
    }

    if (elapsed >= ROSHAN_MIN_RESPAWN_S) {
      if (previousRoshanState === 'respawn_base') {
        previousRoshanState = 'respawn_variable';
      }
      const minutesSinceMin = Math.floor((elapsed - ROSHAN_MIN_RESPAWN_S) / MAY_RESPAWN_INTERVAL_S);
      if (minutesSinceMin > lastMayRespawnMinute) {
        lastMayRespawnMinute = minutesSinceMin;
        if (config.notifications.countdown) {
          notify({ type: 'may_respawn' });
        }
      }
      return;
    }
  }

  const currentState = state.roshanState;
  if (currentState && currentState !== 'alive') {
    if (previousRoshanState === 'alive' && (currentState === 'respawn_base' || currentState === 'respawn_variable')) {
      previousRoshanState = currentState;
      if (lastProcessedRoshanKillTime !== state.clockTime) {
        if (config.notifications.kill) {
          notify({ type: 'killed' });
        }
      }
    } else if (previousRoshanState === 'respawn_base' && currentState === 'respawn_variable') {
      previousRoshanState = currentState;
      if (config.notifications.countdown) {
        notify({ type: 'may_respawn' });
      }
    }
  } else if (currentState === 'alive' && previousRoshanState !== 'alive' && roshanKillGameTime === 0) {
    previousRoshanState = 'alive';
    if (config.notifications.respawn) {
      notify({ type: 'respawn' });
    }
  }
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

export function getRoshanTimerState(): { state: string; minRespawnGameTime: number; maxRespawnGameTime: number } {
  if (roshanKillGameTime === 0) {
    return { state: previousRoshanState, minRespawnGameTime: 0, maxRespawnGameTime: 0 };
  }
  return {
    state: previousRoshanState,
    minRespawnGameTime: roshanKillGameTime + ROSHAN_MIN_RESPAWN_S,
    maxRespawnGameTime: roshanKillGameTime + ROSHAN_MAX_RESPAWN_S,
  };
}

export function reset(): void {
  previousRoshanState = 'alive';
  lastProcessedRoshanKillTime = -1;
  roshanKillGameTime = 0;
  lastMayRespawnMinute = -1;
}

export function _resetForTesting(): void {
  stopListening();
  reset();
  listeners = [];
}
