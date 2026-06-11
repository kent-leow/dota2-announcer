import * as http from 'http';
import { start, stop, onStateChange, getLastState, _resetForTesting } from './gsiServer';
import { ParsedGameState, GAME_STATES } from './gsiTypes';

function postToServer(port: number, body: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port, method: 'POST', path: '/' },
      (res) => resolve(res.statusCode ?? 0)
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

describe('gsiServer', () => {
  const TEST_PORT = 13001;

  beforeEach(() => {
    _resetForTesting();
  });

  afterEach(async () => {
    await stop();
  });

  it('starts and stops without error', async () => {
    await start(TEST_PORT);
    await stop();
  });

  it('accepts POST and returns 200', async () => {
    await start(TEST_PORT);
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
    const status = await postToServer(TEST_PORT, payload);
    expect(status).toBe(200);
  });

  it('parses valid payload and emits state to listeners', async () => {
    await start(TEST_PORT);
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
    await postToServer(TEST_PORT, payload);

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
    await start(TEST_PORT);
    const received: ParsedGameState[] = [];
    onStateChange((s) => received.push(s));

    const status = await postToServer(TEST_PORT, 'not json at all');
    expect(status).toBe(200);
    expect(received).toHaveLength(0);
  });

  it('ignores payload missing map field', async () => {
    await start(TEST_PORT);
    const received: ParsedGameState[] = [];
    onStateChange((s) => received.push(s));

    const payload = JSON.stringify({ player: { steamid: '1', name: 'test', team_name: '' } });
    await postToServer(TEST_PORT, payload);

    expect(received).toHaveLength(0);
  });

  it('emits state change on game phase transition', async () => {
    await start(TEST_PORT);
    const received: ParsedGameState[] = [];
    onStateChange((s) => received.push(s));

    const makePayload = (state: string, clock: number) =>
      JSON.stringify({
        map: { matchid: '789', game_time: clock, clock_time: clock, game_state: state, paused: false, daytime: true },
      });

    await postToServer(TEST_PORT, makePayload(GAME_STATES.HERO_SELECTION, 0));
    await postToServer(TEST_PORT, makePayload(GAME_STATES.GAME_IN_PROGRESS, 0));

    expect(received).toHaveLength(2);
    expect(received[0].gameState).toBe(GAME_STATES.HERO_SELECTION);
    expect(received[1].gameState).toBe(GAME_STATES.GAME_IN_PROGRESS);
  });

  it('getLastState returns most recent parsed state', async () => {
    await start(TEST_PORT);
    expect(getLastState()).toBeNull();

    const payload = JSON.stringify({
      map: { matchid: '111', game_time: 50, clock_time: 40, game_state: GAME_STATES.PRE_GAME, paused: false, daytime: true },
    });
    await postToServer(TEST_PORT, payload);

    expect(getLastState()?.matchId).toBe('111');
  });

  it('unsubscribe removes listener', async () => {
    await start(TEST_PORT);
    const received: ParsedGameState[] = [];
    const unsub = onStateChange((s) => received.push(s));
    unsub();

    const payload = JSON.stringify({
      map: { matchid: '222', game_time: 10, clock_time: 5, game_state: GAME_STATES.INIT, paused: false, daytime: true },
    });
    await postToServer(TEST_PORT, payload);

    expect(received).toHaveLength(0);
  });
});
