import { GAME_STATES, ParsedGameState } from './gsiTypes';

let gsiCallback: ((state: ParsedGameState) => void) | null = null;

jest.mock('./gsiServer', () => ({
  onStateChange: jest.fn((cb: (state: ParsedGameState) => void) => {
    gsiCallback = cb;
    return () => { gsiCallback = null; };
  }),
}));

jest.mock('src/tts/stateStore', () => ({
  readAppState: jest.fn(() => ({ dynamicEvents: [] })),
}));

import * as tracker from './mapAwarenessTracker';
import * as configHolder from './mapAwareness/configHolder';
import * as matchRecorder from './matchRecorder';

function state(t: number, enemyX: number | null): ParsedGameState {
  return {
    gameState: GAME_STATES.GAME_IN_PROGRESS,
    clockTime: t,
    matchId: '1',
    paused: false,
    daytime: true,
    heroName: 'ursa',
    events: [],
    player: { team: 'radiant', x: 0, y: 0, alive: true },
    enemyHeroes: enemyX === null ? [] : [{ name: 'tidehunter', x: enemyX, y: 0 }],
    killScores: { radiant: 0, dire: 0 },
  };
}

function walkIn(fromT = 0, toT = 12): void {
  for (let t = fromT; t <= toT; t++) gsiCallback?.(state(t, 4000 - 300 * t));
}

const ENABLED = {
  id: 'map-awareness', name: 'Map Awareness', enabled: true,
  notifications: { visible: true, fog: true },
  settings: { leadSeconds: 5, engageDistance: 800, maxFogSeconds: 20 },
};

describe('mapAwarenessTracker', () => {
  beforeEach(() => {
    tracker._resetForTesting();
    configHolder._resetForTesting();
    configHolder.setConfig(ENABLED);
    jest.spyOn(console, 'info').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('emits one warning for a walking enemy', () => {
    const cb = jest.fn();
    tracker.onWarning(cb);
    tracker.startListening();
    walkIn();
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0][0].heroes[0].name).toBe('tidehunter');
  });

  it('emits nothing when disabled', () => {
    configHolder.setConfig({ ...ENABLED, enabled: false });
    const cb = jest.fn();
    tracker.onWarning(cb);
    tracker.startListening();
    walkIn();
    expect(cb).not.toHaveBeenCalled();
  });

  it('applies config changes on the next second', () => {
    const cb = jest.fn();
    tracker.onWarning(cb);
    tracker.startListening();
    configHolder.setConfig({ ...ENABLED, notifications: { visible: false, fog: true } });
    walkIn(0, 6);
    expect(cb).not.toHaveBeenCalled();
    configHolder.setConfig(ENABLED);
    walkIn(7, 8);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('logs engine failures once and keeps processing', () => {
    const step = jest.fn()
      .mockImplementationOnce(() => { throw new Error('boom'); })
      .mockImplementationOnce(() => { throw new Error('boom again'); })
      .mockImplementation(() => []);
    jest.isolateModules(() => {
      jest.doMock('./mapAwareness/engine', () => ({
        createEngine: () => ({ step, reset: jest.fn(), getTracks: () => [], getEtas: () => new Map() }),
      }));
      const isolated = require('./mapAwarenessTracker');
      const isolatedHolder = require('./mapAwareness/configHolder');
      isolatedHolder.setConfig(ENABLED);
      isolated.startListening();
      expect(() => gsiCallback?.(state(1, 4000))).not.toThrow();
      expect(() => gsiCallback?.(state(2, 4000))).not.toThrow();
      gsiCallback?.(state(3, 4000));
      isolated._resetForTesting();
    });
    expect(step).toHaveBeenCalledTimes(3);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('stops receiving states after stopListening', () => {
    const cb = jest.fn();
    tracker.onWarning(cb);
    tracker.startListening();
    tracker.stopListening();
    walkIn();
    expect(cb).not.toHaveBeenCalled();
  });

  it('reset clears warning episodes', () => {
    const cb = jest.fn();
    tracker.onWarning(cb);
    tracker.startListening();
    walkIn();
    gsiCallback?.(state(13, 400));
    expect(cb).toHaveBeenCalledTimes(1);
    tracker.reset();
    gsiCallback?.(state(14, 400));
    expect(cb).toHaveBeenCalledTimes(2);
  });

  describe('recording', () => {
    it('records settings at start, again after a change, and every warning', () => {
      jest.spyOn(matchRecorder, 'getActiveFilePath').mockReturnValue('/tmp/rec.jsonl.gz');
      const appendSettings = jest.spyOn(matchRecorder, 'appendSettings').mockImplementation(() => undefined);
      const appendWarning = jest.spyOn(matchRecorder, 'appendWarning').mockImplementation(() => undefined);
      tracker.startListening();

      walkIn(0, 3);
      expect(appendSettings).toHaveBeenCalledTimes(1);
      expect(appendSettings.mock.calls[0][0]).toMatchObject({ leadSeconds: 5, engageDistance: 800 });

      configHolder.setConfig({ ...ENABLED, settings: { leadSeconds: 7, engageDistance: 800, maxFogSeconds: 20 } });
      walkIn(4, 12);
      expect(appendSettings).toHaveBeenCalledTimes(2);
      expect(appendSettings.mock.calls[1][0]).toMatchObject({ leadSeconds: 7 });
      expect(appendWarning).toHaveBeenCalledTimes(1);
    });

    it('records nothing when no recording is active', () => {
      jest.spyOn(matchRecorder, 'getActiveFilePath').mockReturnValue(null);
      const appendSettings = jest.spyOn(matchRecorder, 'appendSettings');
      tracker.startListening();
      walkIn(0, 3);
      expect(appendSettings).not.toHaveBeenCalled();
    });
  });
});
