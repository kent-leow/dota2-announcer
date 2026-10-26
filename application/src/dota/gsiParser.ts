import {
  GsiPayload,
  GsiEvent,
  GsiMinimapEntry,
  ParsedGameState,
  PlayerSnapshot,
  VisibleHero,
  KillScores,
  TeamSide,
} from './gsiTypes';

const HERO_UNIT_PREFIX = 'npc_dota_hero_';

const TEAM_NUMBER: Record<TeamSide, number> = {
  radiant: 2,
  dire: 3,
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function extractHeroName(heroName?: string): string {
  if (!heroName) return '';
  return heroName.replace(/^npc_dota_hero_/, '');
}

function extractEvents(events?: GsiEvent[]): GsiEvent[] {
  if (!events || !Array.isArray(events)) return [];
  return events;
}

function parseSide(teamName: unknown): TeamSide | undefined {
  if (teamName === 'radiant' || teamName === 'dire') return teamName;
  return undefined;
}

function extractPlayer(data: GsiPayload): PlayerSnapshot | undefined {
  const team = parseSide(data.player?.team_name);
  const hero = data.hero;
  if (!team || !hero || !isFiniteNumber(hero.xpos) || !isFiniteNumber(hero.ypos)) return undefined;
  return { team, x: hero.xpos, y: hero.ypos, alive: hero.alive !== false };
}

function extractEnemyHeroes(minimap: unknown, team: TeamSide): VisibleHero[] {
  if (!minimap || typeof minimap !== 'object') return [];
  const enemyTeam = team === 'radiant' ? TEAM_NUMBER.dire : TEAM_NUMBER.radiant;
  const heroes: VisibleHero[] = [];
  for (const raw of Object.values(minimap as Record<string, unknown>)) {
    if (!raw || typeof raw !== 'object') continue;
    const entry = raw as GsiMinimapEntry;
    if (typeof entry.unitname !== 'string' || !entry.unitname.startsWith(HERO_UNIT_PREFIX)) continue;
    if (entry.team !== enemyTeam) continue;
    if (!isFiniteNumber(entry.xpos) || !isFiniteNumber(entry.ypos)) continue;
    heroes.push({ name: entry.unitname.slice(HERO_UNIT_PREFIX.length), x: entry.xpos, y: entry.ypos });
  }
  return heroes;
}

function extractKillScores(data: GsiPayload): KillScores | undefined {
  const radiant = data.map?.radiant_score;
  const dire = data.map?.dire_score;
  if (!isFiniteNumber(radiant) || !isFiniteNumber(dire)) return undefined;
  return { radiant, dire };
}

export function parseGsiPayload(body: string): ParsedGameState | null {
  try {
    const data: GsiPayload = JSON.parse(body);
    if (!data || typeof data !== 'object' || !data.map) return null;

    const team = parseSide(data.player?.team_name);
    const state: ParsedGameState = {
      gameState: data.map.game_state,
      clockTime: data.map.clock_time,
      matchId: data.map.matchid,
      paused: data.map.paused,
      daytime: data.map.daytime ?? true,
      heroName: extractHeroName(data.hero?.name),
      events: extractEvents(data.events),
    };
    const player = extractPlayer(data);
    if (player) state.player = player;
    if (team) state.enemyHeroes = extractEnemyHeroes(data.minimap, team);
    const killScores = extractKillScores(data);
    if (killScores) state.killScores = killScores;
    return state;
  } catch {
    return null;
  }
}
