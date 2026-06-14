import { exec } from 'child_process';

export type DotaState = 'in-match' | 'idle';

export type StateChangeCallback = (state: DotaState) => void;

const PROCESS_NAME = 'dota2.exe';
const POLL_INTERVAL_MS = 2000;

let currentState: DotaState = 'idle';
let pollTimer: ReturnType<typeof setInterval> | null = null;
let listeners: StateChangeCallback[] = [];

function checkProcess(): Promise<boolean> {
  return new Promise((resolve) => {
    exec(
      `tasklist /FI "IMAGENAME eq ${PROCESS_NAME}" /NH`,
      (error, stdout) => {
        if (error) {
          resolve(false);
          return;
        }
        resolve(stdout.toLowerCase().includes(PROCESS_NAME.toLowerCase()));
      }
    );
  });
}

function setState(newState: DotaState): void {
  if (newState !== currentState) {
    currentState = newState;
    listeners.forEach((cb) => cb(currentState));
  }
}

async function poll(): Promise<void> {
  const running = await checkProcess();
  setState(running ? 'in-match' : 'idle');
}

export function startDetection(): void {
  if (pollTimer) return;
  poll();
  pollTimer = setInterval(poll, POLL_INTERVAL_MS);
}

export function stopDetection(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function getState(): DotaState {
  return currentState;
}

export function onStateChange(callback: StateChangeCallback): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function _resetForTesting(): void {
  stopDetection();
  currentState = 'idle';
  listeners = [];
}
