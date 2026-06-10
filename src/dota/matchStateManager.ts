import * as gsiServer from './gsiServer';
import * as gameTimer from 'src/timer/gameTimer';
import * as eventScheduler from 'src/scheduler/eventScheduler';
import { ParsedGameState, GAME_STATES } from './gsiTypes';

export type MatchPhase = 'idle' | 'in-match';
export type MatchPhaseCallback = (phase: MatchPhase) => void;

let currentPhase: MatchPhase = 'idle';
let listeners: MatchPhaseCallback[] = [];
let unsubGsi: (() => void) | null = null;

function setPhase(phase: MatchPhase): void {
  if (phase === currentPhase) return;
  currentPhase = phase;
  listeners.forEach((cb) => cb(currentPhase));
}

function handleGsiState(state: ParsedGameState): void {
  if (state.gameState === GAME_STATES.GAME_IN_PROGRESS) {
    if (currentPhase !== 'in-match') {
      setPhase('in-match');
      gameTimer.reset();
      gameTimer.start();
    }
    gameTimer.syncTo(state.clockTime * 1000);
  } else if (
    state.gameState === GAME_STATES.POST_GAME ||
    state.gameState === GAME_STATES.DISCONNECT
  ) {
    if (currentPhase === 'in-match') {
      gameTimer.reset();
      eventScheduler.resetScheduler();
      setPhase('idle');
    }
  }
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

export function getPhase(): MatchPhase {
  return currentPhase;
}

export function onPhaseChange(callback: MatchPhaseCallback): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function _resetForTesting(): void {
  stopListening();
  currentPhase = 'idle';
  listeners = [];
}
