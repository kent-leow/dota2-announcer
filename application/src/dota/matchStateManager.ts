import * as gsiServer from './gsiServer';
import * as gameTimer from 'src/timer/gameTimer';
import * as eventScheduler from 'src/scheduler/eventScheduler';
import * as roshanTracker from './roshanTracker';
import * as mapAwarenessTracker from './mapAwarenessTracker';
import * as matchRecorder from './matchRecorder';
import { loadPreferences } from 'src/config/preferences';
import { ParsedGameState, GAME_STATES } from './gsiTypes';

export type MatchPhase = 'idle' | 'hero-pick' | 'pre-game' | 'in-match';
export type MatchPhaseCallback = (phase: MatchPhase) => void;
export type PauseCallback = (paused: boolean) => void;

let currentPhase: MatchPhase = 'idle';
let paused = false;
let listeners: MatchPhaseCallback[] = [];
let pauseListeners: PauseCallback[] = [];
let unsubGsi: (() => void) | null = null;
let unsubRaw: (() => void) | null = null;
let recordingMatchId: string | null = null;

function setPhase(phase: MatchPhase): void {
  if (phase === currentPhase) return;
  currentPhase = phase;
  listeners.forEach((cb) => cb(currentPhase));
}

function setPaused(value: boolean): void {
  if (value === paused) return;
  paused = value;
  if (paused) {
    gameTimer.stop();
  } else {
    gameTimer.start();
  }
  pauseListeners.forEach((cb) => cb(paused));
}

function syncRecording(state: ParsedGameState): void {
  if (currentPhase === 'idle') {
    if (recordingMatchId !== null) {
      recordingMatchId = null;
      void matchRecorder.stop();
    }
    return;
  }
  if (recordingMatchId === state.matchId) return;

  const isNewMatchInProgress = recordingMatchId !== null;
  recordingMatchId = state.matchId;
  if (isNewMatchInProgress) void matchRecorder.stop();
  if (loadPreferences().recordMatches) {
    matchRecorder.start(state.matchId);
  }
}

function handleGsiState(state: ParsedGameState): void {
  updatePhase(state);
  syncRecording(state);
}

function updatePhase(state: ParsedGameState): void {
  if (state.gameState === GAME_STATES.HERO_SELECTION || state.gameState === GAME_STATES.STRATEGY_TIME) {
    if (currentPhase !== 'hero-pick') {
      setPhase('hero-pick');
    }
  } else if (state.gameState === GAME_STATES.PRE_GAME) {
    if (currentPhase !== 'pre-game') {
      setPhase('pre-game');
    }
  } else if (state.gameState === GAME_STATES.GAME_IN_PROGRESS) {
    if (currentPhase !== 'in-match') {
      setPhase('in-match');
      paused = false;
      gameTimer.reset();
      gameTimer.start();
    }
    if (state.paused) {
      setPaused(true);
    } else {
      setPaused(false);
      gameTimer.syncTo(state.clockTime * 1000);
    }
  } else if (
    state.gameState === GAME_STATES.POST_GAME ||
    state.gameState === GAME_STATES.DISCONNECT
  ) {
    if (currentPhase !== 'idle') {
      gameTimer.reset();
      eventScheduler.resetScheduler();
      roshanTracker.reset();
      mapAwarenessTracker.reset();
      paused = false;
      setPhase('idle');
    }
  }
}

export function startListening(): void {
  if (unsubGsi) return;
  unsubGsi = gsiServer.onStateChange(handleGsiState);
  unsubRaw = gsiServer.onRawPayload((body, receivedAtMs) => matchRecorder.append(body, receivedAtMs));
  roshanTracker.startListening();
  mapAwarenessTracker.startListening();
}

export function stopListening(): void {
  if (unsubGsi) {
    unsubGsi();
    unsubGsi = null;
  }
  if (unsubRaw) {
    unsubRaw();
    unsubRaw = null;
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

export function onPauseChange(callback: PauseCallback): () => void {
  pauseListeners.push(callback);
  return () => {
    pauseListeners = pauseListeners.filter((cb) => cb !== callback);
  };
}

export function isPaused(): boolean {
  return paused;
}

export function _resetForTesting(): void {
  stopListening();
  roshanTracker._resetForTesting();
  mapAwarenessTracker._resetForTesting();
  recordingMatchId = null;
  currentPhase = 'idle';
  paused = false;
  listeners = [];
  pauseListeners = [];
}
