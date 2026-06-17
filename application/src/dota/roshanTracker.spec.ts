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

function makeState(roshanState: string, roshanStateEndSeconds: number = 0): ParsedGameState {
  return {
    gameState: 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS',
    clockTime: 600,
    matchId: 'test-match',
    paused: false,
    daytime: true,
    roshanState,
    roshanStateEndSeconds,
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
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ type: 'killed' });
  });

  it('does not fire duplicate kill on repeated respawn_base', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    gsiCallback?.(makeState('respawn_base', 470));
    const kills = events.filter((e) => e.type === 'killed');
    expect(kills).toHaveLength(1);
  });

  it('fires countdown at minute boundaries', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    events = [];

    gsiCallback?.(makeState('respawn_base', 420));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'countdown', remainingSeconds: 420 });
  });

  it('does not fire countdown for same minute', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    events = [];

    gsiCallback?.(makeState('respawn_base', 475));
    expect(events).toHaveLength(0);
  });

  it('detects transition from respawn_base to respawn_variable', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    events = [];

    gsiCallback?.(makeState('respawn_variable', 180));
    const countdowns = events.filter((e) => e.type === 'countdown');
    expect(countdowns.length).toBeGreaterThan(0);
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

    gsiCallback?.(makeState('alive', 0));
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('respawn');
  });

  it('resets state correctly', () => {
    gsiCallback?.(makeState('respawn_base', 480));
    _resetForTesting();
    expect(getRoshanState()).toBe('alive');
  });
});
