import { EventEmitter } from 'events';
import { ParsedGameState, GAME_STATES } from './gsiTypes';

let mockServer: any;

jest.mock('http', () => ({
  createServer: jest.fn((handler: any) => {
    mockServer = {
      handler,
      listen: jest.fn((_port: number, _host: string, cb: () => void) => cb()),
      close: jest.fn((cb: () => void) => cb()),
      on: jest.fn(),
    };
    return mockServer;
  }),
}));

import { start, stop, onStateChange, getLastState, _resetForTesting } from './gsiServer';

function simulatePost(body: string): Promise<number> {
  return new Promise((resolve) => {
    const req = new EventEmitter() as any;
    req.method = 'POST';
    const res = {
      statusCode: 0,
      writeHead: (code: number) => { res.statusCode = code; },
      end: () => resolve(res.statusCode),
    };
    mockServer.handler(req, res);
    req.emit('data', body);
    req.emit('end');
  });
}

describe('gsiServer', () => {
  beforeEach(() => {
    _resetForTesting();
  });

  afterEach(async () => {
    await stop();
  });

  it('starts and stops without error', async () => {
    await start(13001);
    await stop();
  });

  it('accepts POST and returns 200', async () => {
    await start(13001);
    const payload = JSON.stringify({
      map: {
        matchid: '123',
        game_time: 100,
        clock_time: 90,
        game_state: GAME_STATES.GAME_IN_PROGRESS,
        paused: false,
        daytime: true,
      },
    });
    const status = await simulatePost(payload);
    expect(status).toBe(200);
  });

  it('parses valid payload and emits state to listeners', async () => {
    await start(13001);
    const received: ParsedGameState[] = [];
    onStateChange((s) => received.push(s));

    const payload = JSON.stringify({
      map: {
        matchid: '456',
        game_time: 200,
        clock_time: 180,
        game_state: GAME_STATES.GAME_IN_PROGRESS,
        paused: false,
        daytime: true,
      },
    });
    await simulatePost(payload);

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({
      gameState: GAME_STATES.GAME_IN_PROGRESS,
      clockTime: 180,
      matchId: '456',
      paused: false,
      daytime: true,
      roshanState: 'alive',
      roshanStateEndSeconds: 0,
    });
  });

  it('ignores malformed JSON body without crashing', async () => {
    await start(13001);
    const received: ParsedGameState[] = [];
    onStateChange((s) => received.push(s));

    const status = await simulatePost('not json at all');
    expect(status).toBe(200);
    expect(received).toHaveLength(0);
  });

  it('ignores payload missing map field', async () => {
    await start(13001);
    const received: ParsedGameState[] = [];
    onStateChange((s) => received.push(s));

    const payload = JSON.stringify({ player: { steamid: '1', name: 'test', team_name: '' } });
    await simulatePost(payload);

    expect(received).toHaveLength(0);
  });

  it('emits state change on game phase transition', async () => {
    await start(13001);
    const received: ParsedGameState[] = [];
    onStateChange((s) => received.push(s));

    const makePayload = (state: string, clock: number) =>
      JSON.stringify({
        map: { matchid: '789', game_time: clock, clock_time: clock, game_state: state, paused: false, daytime: true },
      });

    await simulatePost(makePayload(GAME_STATES.HERO_SELECTION, 0));
    await simulatePost(makePayload(GAME_STATES.GAME_IN_PROGRESS, 0));

    expect(received).toHaveLength(2);
    expect(received[0].gameState).toBe(GAME_STATES.HERO_SELECTION);
    expect(received[1].gameState).toBe(GAME_STATES.GAME_IN_PROGRESS);
  });

  it('getLastState returns most recent parsed state', async () => {
    await start(13001);
    expect(getLastState()).toBeNull();

    const payload = JSON.stringify({
      map: { matchid: '111', game_time: 50, clock_time: 40, game_state: GAME_STATES.PRE_GAME, paused: false, daytime: true },
    });
    await simulatePost(payload);

    expect(getLastState()?.matchId).toBe('111');
  });

  it('unsubscribe removes listener', async () => {
    await start(13001);
    const received: ParsedGameState[] = [];
    const unsub = onStateChange((s) => received.push(s));
    unsub();

    const payload = JSON.stringify({
      map: { matchid: '222', game_time: 10, clock_time: 5, game_state: GAME_STATES.INIT, paused: false, daytime: true },
    });
    await simulatePost(payload);

    expect(received).toHaveLength(0);
  });

  it('emits DISCONNECT after heartbeat timeout when GSI stops sending', async () => {
    jest.useFakeTimers();
    await start(13001);
    const received: ParsedGameState[] = [];
    onStateChange((s) => received.push(s));

    const payload = JSON.stringify({
      map: { matchid: '333', game_time: 60, clock_time: 50, game_state: GAME_STATES.GAME_IN_PROGRESS, paused: false, daytime: true },
    });
    await simulatePost(payload);
    expect(received).toHaveLength(1);

    jest.advanceTimersByTime(35_000);

    expect(received).toHaveLength(2);
    expect(received[1].gameState).toBe(GAME_STATES.DISCONNECT);
    expect(received[1].matchId).toBe('333');
    jest.useRealTimers();
  });

  it('does not emit DISCONNECT if already in POST_GAME', async () => {
    jest.useFakeTimers();
    await start(13001);
    const received: ParsedGameState[] = [];
    onStateChange((s) => received.push(s));

    const payload = JSON.stringify({
      map: { matchid: '444', game_time: 60, clock_time: 50, game_state: GAME_STATES.POST_GAME, paused: false, daytime: true },
    });
    await simulatePost(payload);
    expect(received).toHaveLength(1);

    jest.advanceTimersByTime(35_000);

    expect(received).toHaveLength(1);
    jest.useRealTimers();
  });

  it('resets heartbeat on each new GSI message', async () => {
    jest.useFakeTimers();
    await start(13001);
    const received: ParsedGameState[] = [];
    onStateChange((s) => received.push(s));

    const makePayload = (clock: number) => JSON.stringify({
      map: { matchid: '555', game_time: clock, clock_time: clock, game_state: GAME_STATES.GAME_IN_PROGRESS, paused: false, daytime: true },
    });

    await simulatePost(makePayload(10));
    jest.advanceTimersByTime(10_000);
    await simulatePost(makePayload(20));
    jest.advanceTimersByTime(10_000);
    await simulatePost(makePayload(30));
    jest.advanceTimersByTime(10_000);

    // No disconnect because each message resets the 15s timer
    expect(received.every((s) => s.gameState === GAME_STATES.GAME_IN_PROGRESS)).toBe(true);
    jest.useRealTimers();
  });
});
