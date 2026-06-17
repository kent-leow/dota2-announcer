import { GAME_STATES, ParsedGameState } from './gsiTypes';

let gsiCallback: ((state: ParsedGameState) => void) | null = null;

jest.mock('./gsiServer', () => ({
  onStateChange: jest.fn((cb: (state: ParsedGameState) => void) => {
    gsiCallback = cb;
    return () => { gsiCallback = null; };
  }),
}));

jest.mock('src/timer/gameTimer', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  reset: jest.fn(),
  syncTo: jest.fn(),
}));

jest.mock('src/scheduler/eventScheduler', () => ({
  resetScheduler: jest.fn(),
}));

jest.mock('./roshanTracker', () => ({
  startListening: jest.fn(),
  stopListening: jest.fn(),
  reset: jest.fn(),
  _resetForTesting: jest.fn(),
}));

import {
  startListening,
  getPhase,
  onPhaseChange,
  _resetForTesting,
} from './matchStateManager';
import * as gameTimer from 'src/timer/gameTimer';
import * as eventScheduler from 'src/scheduler/eventScheduler';
import * as roshanTracker from './roshanTracker';

function makeState(gameState: string, clockTime: number = 0): ParsedGameState {
  return { gameState, clockTime, matchId: 'test-match', paused: false, daytime: true, roshanState: 'alive', roshanStateEndSeconds: 0, heroName: 'ursa', events: [] };
}

describe('matchStateManager', () => {
  beforeEach(() => {
    _resetForTesting();
    gsiCallback = null;
    jest.clearAllMocks();
  });

  it('starts in idle phase', () => {
    expect(getPhase()).toBe('idle');
  });

  it('transitions idle→in-match on GAME_IN_PROGRESS', () => {
    startListening();
    const phaseCb = jest.fn();
    onPhaseChange(phaseCb);

    gsiCallback?.(makeState(GAME_STATES.GAME_IN_PROGRESS, 0));

    expect(getPhase()).toBe('in-match');
    expect(phaseCb).toHaveBeenCalledWith('in-match');
    expect(gameTimer.reset).toHaveBeenCalled();
    expect(gameTimer.start).toHaveBeenCalled();
  });

  it('transitions in-match→idle on POST_GAME', () => {
    startListening();
    gsiCallback?.(makeState(GAME_STATES.GAME_IN_PROGRESS, 0));

    const phaseCb = jest.fn();
    onPhaseChange(phaseCb);

    gsiCallback?.(makeState(GAME_STATES.POST_GAME, 2400));

    expect(getPhase()).toBe('idle');
    expect(phaseCb).toHaveBeenCalledWith('idle');
    expect(gameTimer.reset).toHaveBeenCalledTimes(2);
    expect(eventScheduler.resetScheduler).toHaveBeenCalled();
  });

  it('transitions to hero-pick on HERO_SELECTION', () => {
    startListening();
    const phaseCb = jest.fn();
    onPhaseChange(phaseCb);

    gsiCallback?.(makeState(GAME_STATES.HERO_SELECTION, 0));

    expect(getPhase()).toBe('hero-pick');
    expect(phaseCb).toHaveBeenCalledWith('hero-pick');
  });

  it('transitions to hero-pick on STRATEGY_TIME', () => {
    startListening();
    const phaseCb = jest.fn();
    onPhaseChange(phaseCb);

    gsiCallback?.(makeState(GAME_STATES.STRATEGY_TIME, 0));

    expect(getPhase()).toBe('hero-pick');
    expect(phaseCb).toHaveBeenCalledWith('hero-pick');
  });

  it('transitions to pre-game on PRE_GAME', () => {
    startListening();
    const phaseCb = jest.fn();
    onPhaseChange(phaseCb);

    gsiCallback?.(makeState(GAME_STATES.PRE_GAME, 0));

    expect(getPhase()).toBe('pre-game');
    expect(phaseCb).toHaveBeenCalledWith('pre-game');
  });

  it('syncs timer on each GAME_IN_PROGRESS tick', () => {
    startListening();
    gsiCallback?.(makeState(GAME_STATES.GAME_IN_PROGRESS, 10));
    gsiCallback?.(makeState(GAME_STATES.GAME_IN_PROGRESS, 15));

    expect(gameTimer.syncTo).toHaveBeenCalledWith(10000);
    expect(gameTimer.syncTo).toHaveBeenCalledWith(15000);
  });

  it('resets timer on match end via DISCONNECT', () => {
    startListening();
    gsiCallback?.(makeState(GAME_STATES.GAME_IN_PROGRESS, 100));
    gsiCallback?.(makeState(GAME_STATES.DISCONNECT, 0));

    expect(getPhase()).toBe('idle');
    expect(gameTimer.reset).toHaveBeenCalledTimes(2);
  });

  it('handles rapid state changes without crashing', () => {
    startListening();
    gsiCallback?.(makeState(GAME_STATES.GAME_IN_PROGRESS, 0));
    gsiCallback?.(makeState(GAME_STATES.POST_GAME, 0));
    gsiCallback?.(makeState(GAME_STATES.GAME_IN_PROGRESS, 0));
    gsiCallback?.(makeState(GAME_STATES.POST_GAME, 0));

    expect(getPhase()).toBe('idle');
  });

  it('starts roshanTracker when listening starts', () => {
    startListening();
    expect(roshanTracker.startListening).toHaveBeenCalled();
  });

  it('resets roshanTracker on match end', () => {
    startListening();
    gsiCallback?.(makeState(GAME_STATES.GAME_IN_PROGRESS, 0));
    gsiCallback?.(makeState(GAME_STATES.POST_GAME, 0));
    expect(roshanTracker.reset).toHaveBeenCalled();
  });

});
