import {
  start,
  stop,
  reset,
  getElapsedMillis,
  isRunning,
  onTick,
  _resetForTesting,
} from './gameTimer';

describe('gameTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    _resetForTesting();
  });

  afterEach(() => {
    _resetForTesting();
    jest.useRealTimers();
  });

  it('starts from zero', () => {
    start();
    expect(getElapsedMillis()).toBe(0);
  });

  it('tracks elapsed time accurately', () => {
    start();
    jest.advanceTimersByTime(5000);
    const elapsed = getElapsedMillis();
    expect(elapsed).toBeGreaterThanOrEqual(5000);
    expect(elapsed).toBeLessThanOrEqual(6000);
  });

  it('fires tick callbacks every second', () => {
    const tickFn = jest.fn();
    onTick(tickFn);
    start();

    jest.advanceTimersByTime(3000);

    expect(tickFn).toHaveBeenCalledTimes(3);
    expect(tickFn.mock.calls[0][0]).toBeGreaterThanOrEqual(1000);
    expect(tickFn.mock.calls[2][0]).toBeGreaterThanOrEqual(3000);
  });

  it('stop halts time tracking', () => {
    start();
    jest.advanceTimersByTime(2000);
    stop();

    const elapsed = getElapsedMillis();
    jest.advanceTimersByTime(3000);
    expect(getElapsedMillis()).toBe(elapsed);
  });

  it('reset zeroes elapsed time', () => {
    start();
    jest.advanceTimersByTime(5000);
    reset();

    expect(getElapsedMillis()).toBe(0);
    expect(isRunning()).toBe(false);
  });

  it('reset notifies listeners with zero', () => {
    const tickFn = jest.fn();
    onTick(tickFn);
    start();
    jest.advanceTimersByTime(2000);

    tickFn.mockClear();
    reset();

    expect(tickFn).toHaveBeenCalledWith(0);
  });

  it('does not start twice', () => {
    start();
    jest.advanceTimersByTime(1000);
    start();
    jest.advanceTimersByTime(1000);

    const elapsed = getElapsedMillis();
    expect(elapsed).toBeGreaterThanOrEqual(2000);
    expect(elapsed).toBeLessThanOrEqual(3000);
  });

  it('unsubscribe removes tick listener', () => {
    const tickFn = jest.fn();
    const unsub = onTick(tickFn);
    unsub();
    start();
    jest.advanceTimersByTime(2000);
    expect(tickFn).not.toHaveBeenCalled();
  });

  it('maintains accuracy over sustained run (>3 min simulated)', () => {
    start();
    jest.advanceTimersByTime(200_000);

    const elapsed = getElapsedMillis();
    expect(elapsed).toBeGreaterThanOrEqual(200_000);
    expect(elapsed).toBeLessThanOrEqual(201_000);
  });
});
