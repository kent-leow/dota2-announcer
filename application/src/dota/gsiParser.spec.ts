import { parseGsiPayload } from './gsiParser';
import { GAME_STATES } from './gsiTypes';

// Trimmed from .docs/.sample/gsi-dump-after-ros.json (game second 832)
const AFTER_ROS = {
  map: { matchid: '0', game_time: 832, clock_time: 718, game_state: GAME_STATES.GAME_IN_PROGRESS, paused: false, daytime: true, radiant_score: 16, dire_score: 3 },
  player: { team_name: 'radiant', steamid: 'x' },
  hero: { name: 'npc_dota_hero_ursa', level: 12, alive: true, xpos: -2797, ypos: 2023 },
  events: [
    { game_time: 824, event_type: 'aegis_picked_up', player_id: 0, snatched: false },
    { game_time: 823, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 },
  ],
  minimap: {
    o132: { xpos: -1791, ypos: -1130, image: 'minimap_herocircle', team: 2, name: 'npc_dota_hero_warlock', yaw: 28, unitname: 'npc_dota_hero_warlock', visionrange: 1800 },
    o133: { xpos: -1193, ypos: 5874, image: 'minimap_herocircle', team: 2, name: 'npc_dota_hero_viper', yaw: 4, unitname: 'npc_dota_hero_viper', visionrange: 1800 },
    o134: { xpos: -1265, ypos: -771, image: 'minimap_herocircle', team: 2, name: 'npc_dota_hero_omniknight', yaw: 37, unitname: 'npc_dota_hero_omniknight', visionrange: 1800 },
    o135: { xpos: 4611, ypos: -5980, image: 'minimap_herocircle', team: 2, name: 'npc_dota_hero_crystal_maiden', yaw: 2, unitname: 'npc_dota_hero_crystal_maiden', visionrange: 1800 },
    o136: { xpos: -2797, ypos: 2023, image: 'minimap_herocircle_self', team: 2, name: 'npc_dota_hero_ursa', yaw: -119, unitname: 'npc_dota_hero_ursa', visionrange: 1800 },
    o137: { xpos: 5820, ypos: -5770, image: 'minimap_enemyicon', team: 3, name: 'npc_dota_hero_tidehunter', yaw: 112, unitname: 'npc_dota_hero_tidehunter', visionrange: 1800 },
    o138: { xpos: -71, ypos: -589, image: 'minimap_enemyicon', team: 3, name: 'npc_dota_hero_nevermore', yaw: -29, unitname: 'npc_dota_hero_nevermore', visionrange: 1800 },
    o0: { xpos: -7456, ypos: -6938, image: 'minimap_ward_obs', team: 2, yaw: 65, unitname: 'dota_fountain', visionrange: 1800 },
    o1: { xpos: -5597, ypos: -3710, image: 'minimap_miscbuilding', team: 2, yaw: 302, unitname: 'npc_dota_goodguys_fillers', visionrange: 900 },
  } as Record<string, Record<string, unknown>>,
};

// Trimmed from .docs/.sample/gsi-dump-before-ros.json (game second 64)
const BEFORE_ROS = {
  map: { matchid: '0', game_time: 64, clock_time: -48, game_state: GAME_STATES.PRE_GAME, paused: false, daytime: false, radiant_score: 0, dire_score: 0 },
  player: { team_name: 'radiant', steamid: 'x' },
  hero: { name: 'npc_dota_hero_ursa', level: 1, alive: true, xpos: -2058, ypos: -284 },
  events: [],
  minimap: {
    o84: { xpos: -2278, ypos: 94, image: 'minimap_herocircle', team: 2, unitname: 'npc_dota_hero_warlock' },
    o88: { xpos: -2058, ypos: -284, image: 'minimap_herocircle_self', team: 2, unitname: 'npc_dota_hero_ursa' },
    o0: { xpos: -7456, ypos: -6938, image: 'minimap_ward_obs', team: 2, unitname: 'dota_fountain' },
  },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function parse(payload: unknown) {
  const state = parseGsiPayload(JSON.stringify(payload));
  if (!state) throw new Error('expected parsed state');
  return state;
}

describe('parseGsiPayload', () => {
  it('extracts exactly the visible enemy heroes from the after-ros sample', () => {
    const state = parse(AFTER_ROS);
    expect(state.enemyHeroes).toEqual([
      { name: 'tidehunter', x: 5820, y: -5770 },
      { name: 'nevermore', x: -71, y: -589 },
    ]);
  });

  it('extracts player side, position and alive state', () => {
    expect(parse(AFTER_ROS).player).toEqual({ team: 'radiant', x: -2797, y: 2023, alive: true });
  });

  it('extracts kill scores', () => {
    expect(parse(AFTER_ROS).killScores).toEqual({ radiant: 16, dire: 3 });
  });

  it('returns no enemies when none are visible (before-ros sample)', () => {
    const state = parse(BEFORE_ROS);
    expect(state.enemyHeroes).toEqual([]);
    expect(state.player).toEqual({ team: 'radiant', x: -2058, y: -284, alive: true });
  });

  it('never reports allies or the player as enemies', () => {
    const names = parse(AFTER_ROS).enemyHeroes!.map((h) => h.name);
    expect(names).not.toContain('ursa');
    expect(names).not.toContain('warlock');
    expect(names).not.toContain('crystal_maiden');
  });

  it('treats radiant heroes as enemies for a dire player', () => {
    const payload = clone(AFTER_ROS);
    payload.player.team_name = 'dire';
    const names = parse(payload).enemyHeroes!.map((h) => h.name).sort();
    expect(names).toEqual(['crystal_maiden', 'omniknight', 'ursa', 'viper', 'warlock']);
    expect(parse(payload).player!.team).toBe('dire');
  });

  it('gives the same result when minimap slot keys are reshuffled', () => {
    const payload = clone(AFTER_ROS);
    const entries = Object.values(payload.minimap).reverse();
    payload.minimap = Object.fromEntries(entries.map((e, i) => [`o${i + 500}`, e]));
    const names = parse(payload).enemyHeroes!.map((h) => h.name).sort();
    expect(names).toEqual(['nevermore', 'tidehunter']);
  });

  it('handles absent, empty and malformed minimap without throwing', () => {
    const absent = clone(AFTER_ROS) as Partial<typeof AFTER_ROS>;
    delete absent.minimap;
    expect(parse(absent).enemyHeroes).toEqual([]);

    const empty = clone(AFTER_ROS);
    empty.minimap = {};
    expect(parse(empty).enemyHeroes).toEqual([]);

    const malformed = clone(AFTER_ROS);
    malformed.minimap.o137.xpos = 'abc';
    delete malformed.minimap.o138.ypos;
    (malformed.minimap as Record<string, unknown>).bad = null;
    expect(parse(malformed).enemyHeroes).toEqual([]);
  });

  it('accepts zero coordinates', () => {
    const payload = clone(AFTER_ROS);
    payload.minimap.o137.xpos = 0;
    payload.minimap.o137.ypos = 0;
    expect(parse(payload).enemyHeroes).toContainEqual({ name: 'tidehunter', x: 0, y: 0 });
  });

  it('reports no player and no enemies when the side is unknown', () => {
    const payload = clone(AFTER_ROS);
    payload.player.team_name = 'spectator';
    const state = parse(payload);
    expect(state.player).toBeUndefined();
    expect(state.enemyHeroes ?? []).toEqual([]);
  });

  it('omits player when hero coordinates are missing', () => {
    const payload = clone(AFTER_ROS) as { hero: Record<string, unknown> };
    delete payload.hero.xpos;
    expect(parse(payload).player).toBeUndefined();
  });

  it('marks a dead player hero as not alive', () => {
    const payload = clone(AFTER_ROS);
    payload.hero.alive = false;
    expect(parse(payload).player!.alive).toBe(false);
  });

  it('returns every entry when two share a hero name (illusions)', () => {
    const payload = clone(AFTER_ROS);
    payload.minimap.o999 = { ...payload.minimap.o137, xpos: 100, ypos: 100 };
    const tides = parse(payload).enemyHeroes!.filter((h) => h.name === 'tidehunter');
    expect(tides).toHaveLength(2);
  });

  it('omits kill scores when either score is missing', () => {
    const payload = clone(AFTER_ROS) as { map: Record<string, unknown> };
    delete payload.map.dire_score;
    expect(parse(payload).killScores).toBeUndefined();
  });

  it('keeps existing fields unchanged', () => {
    const state = parse(AFTER_ROS);
    expect(state.gameState).toBe(GAME_STATES.GAME_IN_PROGRESS);
    expect(state.clockTime).toBe(718);
    expect(state.matchId).toBe('0');
    expect(state.paused).toBe(false);
    expect(state.daytime).toBe(true);
    expect(state.heroName).toBe('ursa');
    expect(state.events).toHaveLength(2);
  });

  it('returns null for malformed JSON or missing map', () => {
    expect(parseGsiPayload('{not json')).toBeNull();
    expect(parseGsiPayload(JSON.stringify({ player: {} }))).toBeNull();
    expect(parseGsiPayload('null')).toBeNull();
  });

  it('parses a large payload quickly', () => {
    const payload = clone(AFTER_ROS);
    for (let i = 0; i < 200; i++) {
      payload.minimap[`x${i}`] = { xpos: i, ypos: i, team: 3, unitname: 'npc_dota_creep_badguys_melee' };
    }
    const body = JSON.stringify(payload);
    const start = Date.now();
    for (let i = 0; i < 20; i++) parseGsiPayload(body);
    expect((Date.now() - start) / 20).toBeLessThan(5);
  });
});
