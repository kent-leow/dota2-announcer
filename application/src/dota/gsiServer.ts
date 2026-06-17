import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { GsiPayload, GsiItems, ParsedGameState, GAME_STATES } from './gsiTypes';

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

function getGsiDumpPath(): string {
  try {
    const { app } = require('electron');
    return path.join(app.getPath('userData'), 'gsi-dump.json');
  } catch {
    return path.join(process.cwd(), 'gsi-dump.json');
  }
}

function dumpRawPayload(body: string): void {
  try {
    fs.writeFileSync(getGsiDumpPath(), body, 'utf-8');
  } catch { /* best-effort */ }
}

function extractItems(items?: GsiItems): string[] {
  if (!items) return [];
  const slots = [items.slot0, items.slot1, items.slot2, items.slot3, items.slot4, items.slot5, items.slot6, items.slot7, items.slot8];
  return slots
    .map((s) => s?.name)
    .filter((name): name is string => !!name && name !== 'empty');
}

function extractHeroName(heroName?: string): string {
  if (!heroName) return '';
  return heroName.replace(/^npc_dota_hero_/, '');
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
      heroName: extractHeroName(data.hero?.name),
      items: extractItems(data.items),
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
    dumpRawPayload(body);
    const state = parsePayload(body);
    if (state) {
      notifyListeners(state);
    } else if (lastState && lastState.gameState !== GAME_STATES.POST_GAME && lastState.gameState !== GAME_STATES.DISCONNECT) {
      notifyListeners({
        ...lastState,
        gameState: GAME_STATES.DISCONNECT,
      });
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
