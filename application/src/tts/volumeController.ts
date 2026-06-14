import { readAppState, writeAppState } from './stateStore';

let currentVolume = 100;

export function loadVolume(): number {
  const state = readAppState();
  currentVolume = state.volume;
  return currentVolume;
}

export function setVolume(value: number): void {
  const clamped = Math.max(0, Math.min(100, value));
  currentVolume = clamped;
  const state = readAppState();
  state.volume = clamped;
  writeAppState(state);
}

export function getVolume(): number {
  return currentVolume;
}
