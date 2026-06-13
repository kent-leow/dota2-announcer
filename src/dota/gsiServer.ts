import * as http from 'http';
import { GsiPayload, ParsedGameState, GAME_STATES } from './gsiTypes';

export type GsiStateCallback = (state: ParsedGameState) => void;

const GSI_PORT = 3001;
const GSI_TIMEOUT_MS = 35_000;

let server: http.Server | null = null;
let listeners: GsiStateCallback[] = [];
let lastState: ParsedGameState | null = null;
let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;

function resetHeartbeat(): void {
  if (heartbeatTimer) clearTimeout(heartbeatTimer);
  heartbeatTimer = setTimeout(onHeartbeatTimeout, GSI_TIMEOUT_MS);
}

function onHeartbeatTimeout(): void {
  heartbeatTimer = null;
  if (lastState && lastState.gameState !== GAME_STATES.POST_GAME && lastState.gameState !== GAME_STATES.DISCONNECT) {
    notifyListeners({
      ...lastState,
      gameState: GAME_STATES.DISCONNECT,
    });
  }
}

function parsePayload(body: string): ParsedGameState | null {
  try {
    const data: GsiPayload = JSON.parse(body);
    if (!data.map) return null;

    return {
      gameState: data.map.game_state,
      clockTime: data.map.clock_time,
      matchId: data.map.matchid,
      paused: data.map.paused,
      daytime: data.map.daytime ?? true,
      roshanState: data.map.roshan_state ?? 'alive',
      roshanStateEndSeconds: data.map.roshan_state_end_seconds ?? 0,
    };
  } catch {
    return null;
  }
}

function notifyListeners(state: ParsedGameState): void {
  lastState = state;
  listeners.forEach((cb) => cb(state));
}

function handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end();
    return;
  }

  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    resetHeartbeat();
    const state = parsePayload(body);
    if (state) {
      notifyListeners(state);
    }
    res.writeHead(200);
    res.end();
  });
}

export function start(port: number = GSI_PORT): Promise<void> {
  return new Promise((resolve, reject) => {
    if (server) {
      resolve();
      return;
    }
    server = http.createServer(handleRequest);
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => resolve());
  });
}

export function stop(): Promise<void> {
  if (heartbeatTimer) {
    clearTimeout(heartbeatTimer);
    heartbeatTimer = null;
  }
  return new Promise((resolve) => {
    if (!server) {
      resolve();
      return;
    }
    server.close(() => {
      server = null;
      resolve();
    });
  });
}

export function onStateChange(callback: GsiStateCallback): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function getLastState(): ParsedGameState | null {
  return lastState;
}

export function _resetForTesting(): void {
  if (heartbeatTimer) {
    clearTimeout(heartbeatTimer);
    heartbeatTimer = null;
  }
  listeners = [];
  lastState = null;
}
