import {
  ROSHAN_MIN_RESPAWN_MS,
  ROSHAN_MAX_RESPAWN_MS,
  BUYBACK_COOLDOWN_MS,
  GLYPH_COOLDOWN_MS,
} from './gameConstants';
import { TrackedEventType, TrackedEvent, GameStatusState, Deadline } from './gameStatusTypes';

let state: GameStatusState = {
  roshan: null,
  buyback: null,
  glyph: null,
};

function computeDeadlines(type: TrackedEventType, loggedAtMs: number): Deadline[] {
  switch (type) {
    case 'roshan':
      return [
        { label: 'May respawn', timeMs: loggedAtMs + ROSHAN_MIN_RESPAWN_MS },
        { label: 'Confirmed respawn', timeMs: loggedAtMs + ROSHAN_MAX_RESPAWN_MS },
      ];
    case 'buyback':
      return [{ label: 'Buyback available', timeMs: loggedAtMs + BUYBACK_COOLDOWN_MS }];
    case 'glyph':
      return [{ label: 'Glyph available', timeMs: loggedAtMs + GLYPH_COOLDOWN_MS }];
  }
}

export function logEvent(type: TrackedEventType, currentTimeMs: number): void {
  state[type] = {
    type,
    loggedAtMs: currentTimeMs,
    deadlines: computeDeadlines(type, currentTimeMs),
  };
}

export function clearEvent(type: TrackedEventType): void {
  state[type] = null;
}

export function clearAll(): void {
  state = { roshan: null, buyback: null, glyph: null };
}

export function getStatus(): GameStatusState {
  return { ...state };
}

export function _resetForTesting(): void {
  clearAll();
}
