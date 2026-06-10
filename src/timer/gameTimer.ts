export type TickCallback = (elapsedMs: number) => void;

const TICK_INTERVAL_MS = 1000;

let startTime: number | null = null;
let elapsed: number = 0;
let tickTimer: ReturnType<typeof setInterval> | null = null;
let running = false;
let listeners: TickCallback[] = [];

function tick(): void {
  if (!running || startTime === null) return;
  elapsed = Date.now() - startTime;
  listeners.forEach((cb) => cb(elapsed));
}

export function start(): void {
  if (running) return;
  running = true;
  startTime = Date.now();
  elapsed = 0;
  tickTimer = setInterval(tick, TICK_INTERVAL_MS);
}

export function stop(): void {
  running = false;
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

export function reset(): void {
  stop();
  elapsed = 0;
  startTime = null;
  listeners.forEach((cb) => cb(0));
}

export function syncTo(clockMs: number): void {
  if (!running) return;
  if (clockMs < 0) return;
  startTime = Date.now() - clockMs;
  elapsed = clockMs;
}

export function getElapsedMillis(): number {
  if (running && startTime !== null) {
    return Date.now() - startTime;
  }
  return elapsed;
}

export function isRunning(): boolean {
  return running;
}

export function onTick(callback: TickCallback): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function _resetForTesting(): void {
  stop();
  elapsed = 0;
  startTime = null;
  listeners = [];
}
