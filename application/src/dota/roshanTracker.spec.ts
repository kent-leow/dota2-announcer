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
  _resetForTesting,
  RoshanEvent,
} from './roshanTracker';
import { getDynamicEvents } from 'src/config/eventsLoader';

function makeState(roshanState: string, roshanStateEndSeconds: number = 0, clockTime: number = 600, events: Array<{ game_time: number; event_type: string; [key: string]: unknown }> = []): ParsedGameState {
  return {
    gameState: 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS',
    clockTime,
    matchId: 'test-match',
    paused: false,
    daytime: true,
    roshanState,
    roshanStateEndSeconds,
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

  it('detects kill on alive→respawn_base transition', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'killed' });
  });

  it('does not fire duplicate kill on repeated respawn_base', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    gsiCallback?.(makeState('respawn_base', 470));
    const kills = events.filter((e) => e.type === 'killed');
    expect(kills).toHaveLength(1);
  });

  it('fires may_respawn on respawn_base→respawn_variable transition', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    events = [];

    gsiCallback?.(makeState('respawn_variable', 180));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'may_respawn' });
  });

  it('does not fire may_respawn on repeated respawn_variable', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    gsiCallback?.(makeState('respawn_variable', 180));
    events = [];

    gsiCallback?.(makeState('respawn_variable', 170));
    expect(events).toHaveLength(0);
  });

  it('detects confirmed respawn on respawn_variable→alive', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    gsiCallback?.(makeState('respawn_variable', 180));
    events = [];

    gsiCallback?.(makeState('alive', 0));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'respawn' });
  });

  it('detects confirmed respawn on respawn_base→alive', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    events = [];

    gsiCallback?.(makeState('alive', 0));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'respawn' });
  });

  it('fires no events when disabled', () => {
    (getDynamicEvents as jest.Mock).mockReturnValue({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: false, notifications: { kill: true, countdown: true, respawn: true } },
      ],
    });
    gsiCallback?.(makeState('respawn_base', 480));
    expect(events).toHaveLength(0);
  });

  it('respects individual notification toggles', () => {
    (getDynamicEvents as jest.Mock).mockReturnValue({
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: false, countdown: false, respawn: true } },
      ],
    });
    gsiCallback?.(makeState('respawn_base', 480));
    expect(events).toHaveLength(0);

    gsiCallback?.(makeState('respawn_variable', 180));
    expect(events).toHaveLength(0);

    gsiCallback?.(makeState('alive', 0));
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('respawn');
  });

  it('resets state correctly', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    _resetForTesting();
    expect(getRoshanState()).toBe('alive');
  });

  describe('events-based detection (player mode)', () => {
    it('detects kill from events array when roshanState stays alive', () => {
      gsiCallback?.(makeState('alive', 0, 823, [{ game_time: 823, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('killed');
    });

    it('does not fire duplicate kill for same game_time', () => {
      const evts = [{ game_time: 823, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }];
      gsiCallback?.(makeState('alive', 0, 823, evts));
      gsiCallback?.(makeState('alive', 0, 824, evts));
      const kills = events.filter((e) => e.type === 'killed');
      expect(kills).toHaveLength(1);
    });

    it('fires may_respawn after 8 minutes elapsed from kill', () => {
      gsiCallback?.(makeState('alive', 0, 100, [{ game_time: 100, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
      events = [];

      gsiCallback?.(makeState('alive', 0, 580, []));
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('may_respawn');
    });

    it('fires respawn after 11 minutes elapsed from kill', () => {
      gsiCallback?.(makeState('alive', 0, 100, [{ game_time: 100, event_type: 'roshan_killed', killed_by_team: 'radiant', killer_player_id: 0 }]));
      events = [];

      gsiCallback?.(makeState('alive', 0, 580, []));
      events = [];

      gsiCallback?.(makeState('alive', 0, 760, []));
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('respawn');
    });
  });
});
