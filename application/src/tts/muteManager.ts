import { readAppState, writeAppState } from './stateStore';

let currentMuted = false;

export function loadMuteState(): boolean {
  const state = readAppState();
  currentMuted = state.muted;
  return currentMuted;
}

export function toggleMute(): boolean {
  currentMuted = !currentMuted;
  const state = readAppState();
  state.muted = currentMuted;
  writeAppState(state);
  return currentMuted;
}

export function setMuted(muted: boolean): void {
  currentMuted = muted;
  const state = readAppState();
  state.muted = muted;
  writeAppState(state);
}

export function isMuted(): boolean {
  return currentMuted;
}
