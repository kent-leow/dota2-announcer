import { ParsedGameState } from './gsiTypes';

let gsiCallback: ((state: ParsedGameState) => void) | null = null;

jest.mock('./gsiServer', () => ({
  onStateChange: jest.fn((cb: (state: ParsedGameState) => void) => {
    gsiCallback = cb;
    return () => { gsiCallback = null; };
  }),
}));

jest.mock('src/config/eventsLoader', () => ({
  getDynamicEvents: jest.fn(() => ({
    dynamicEvents: [
      { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: true, respawn: true } },
    ],
  })),
}));

import {
  startListening,
  onRoshanEvent,
  getRoshanState,
  getRoshanTimerState,
  _resetForTesting,
  RoshanEvent,
} from './roshanTracker';
import { getDynamicEvents } from 'src/config/eventsLoader';

function makeState(clockTime: number = 600, events: Array<{ game_time: number; event_type: string; [key: string]: unknown }> = []): ParsedGameState {
  return {
    gameState: 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS',
    clockTime,
    matchId: 'test-match',
    paused: false,
    daytime: true,
    heroName: 'ursa',
    events,
  };
}

describe('roshanTracker', () => {
  let events: RoshanEvent[];

  beforeEach(() => {
    _resetForTesting();
    gsiCallback = null;
    events = [];
    jest.clearAllMocks();
    (getDynamicEvents as jest.Mock).mockReturnValue({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: true, respawn: true } },
      ],
    });
    startListening();
    onRoshanEvent((e) => events.push(e));
  });

  it('detects kill from events array', () => {
    gsiCallback?.(makeState(823, [{ game_time: 823, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'killed', killedByTeam: 'radiant' });
  });

  it('does not fire duplicate kill for same game_time', () => {
    const evts = [{ game_time: 823, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }];
    gsiCallback?.(makeState(823, evts));
    gsiCallback?.(makeState(824, evts));
    const kills = events.filter((e) => e.type === 'killed');
    expect(kills).toHaveLength(1);
  });

  it('fires may_respawn after 8 minutes elapsed from kill', () => {
    gsiCallback?.(makeState(100, [{ game_time: 100, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
    events = [];

    gsiCallback?.(makeState(580, []));
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('may_respawn');
  });

  it('fires may_respawn every minute between 8-11 min', () => {
    gsiCallback?.(makeState(100, [{ game_time: 100, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
    events = [];

    gsiCallback?.(makeState(580, [])); // 480s elapsed → first may_respawn
    gsiCallback?.(makeState(610, [])); // 510s → still minute 0
    gsiCallback?.(makeState(640, [])); // 540s → minute 1
    gsiCallback?.(makeState(700, [])); // 600s → minute 2

    expect(events).toHaveLength(3);
    expect(events.every((e) => e.type === 'may_respawn')).toBe(true);
  });

  it('fires respawn after 11 minutes elapsed from kill', () => {
    gsiCallback?.(makeState(100, [{ game_time: 100, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
    events = [];

    gsiCallback?.(makeState(760, []));
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('respawn');
    expect(getRoshanState()).toBe('alive');
  });

  it('transitions state from respawn_base to respawn_variable at 8 min', () => {
    gsiCallback?.(makeState(100, [{ game_time: 100, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
    expect(getRoshanState()).toBe('respawn_base');

    gsiCallback?.(makeState(580, []));
    expect(getRoshanState()).toBe('respawn_variable');
  });

  it('getRoshanTimerState returns correct times', () => {
    gsiCallback?.(makeState(100, [{ game_time: 100, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
    const timer = getRoshanTimerState();
    expect(timer.state).toBe('respawn_base');
    expect(timer.minRespawnGameTime).toBe(580);
    expect(timer.maxRespawnGameTime).toBe(760);
  });

  it('getRoshanTimerState returns alive when no kill tracked', () => {
    const timer = getRoshanTimerState();
    expect(timer.state).toBe('alive');
    expect(timer.minRespawnGameTime).toBe(0);
    expect(timer.maxRespawnGameTime).toBe(0);
  });

  it('fires no events when disabled', () => {
    (getDynamicEvents as jest.Mock).mockReturnValue({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: false, notifications: { kill: true, countdown: true, respawn: true } },
      ],
    });
    gsiCallback?.(makeState(823, [{ game_time: 823, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
    expect(events).toHaveLength(0);
  });

  it('respects individual notification toggles', () => {
    (getDynamicEvents as jest.Mock).mockReturnValue({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: false, countdown: false, respawn: true } },
      ],
    });
    gsiCallback?.(makeState(100, [{ game_time: 100, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
    expect(events).toHaveLength(0);

    gsiCallback?.(makeState(580, []));
    expect(events).toHaveLength(0);

    gsiCallback?.(makeState(760, []));
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('respawn');
  });

  it('uses clockTime not event game_time for timer calculations', () => {
    gsiCallback?.(makeState(600, [{ game_time: 780, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
    const timer = getRoshanTimerState();
    expect(timer.minRespawnGameTime).toBe(1080);
    expect(timer.maxRespawnGameTime).toBe(1260);

    gsiCallback?.(makeState(1080, []));
    expect(getRoshanState()).toBe('respawn_variable');
  });

  it('resets state correctly', () => {
    gsiCallback?.(makeState(823, [{ game_time: 823, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
    _resetForTesting();
    expect(getRoshanState()).toBe('alive');
  });
});
