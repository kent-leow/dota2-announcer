export interface GsiMap {
  matchid: string;
  game_time: number;
  clock_time: number;
  game_state: string;
  paused: boolean;
  daytime: boolean;
}

export interface GsiPlayer {
  steamid: string;
  name: string;
  team_name: string;
}

export interface GsiHero {
  name: string;
  level: number;
  alive: boolean;
}

export interface GsiPayload {
  map?: GsiMap;
  player?: GsiPlayer;
  hero?: GsiHero;
}

export interface ParsedGameState {
  gameState: string;
  clockTime: number;
  matchId: string;
  paused: boolean;
}

export const GAME_STATES = {
  INIT: 'DOTA_GAMERULES_STATE_INIT',
  WAIT_FOR_PLAYERS: 'DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD',
  HERO_SELECTION: 'DOTA_GAMERULES_STATE_HERO_SELECTION',
  STRATEGY_TIME: 'DOTA_GAMERULES_STATE_STRATEGY_TIME',
  PRE_GAME: 'DOTA_GAMERULES_STATE_PRE_GAME',
  GAME_IN_PROGRESS: 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS',
  POST_GAME: 'DOTA_GAMERULES_STATE_POST_GAME',
  DISCONNECT: 'DOTA_GAMERULES_STATE_DISCONNECT',
} as const;
