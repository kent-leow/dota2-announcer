import { exec } from 'child_process';

jest.mock('child_process');

const mockedExec = exec as unknown as jest.Mock;

import {
  startDetection,
  stopDetection,
  getState,
  onStateChange,
  _resetForTesting,
} from './processDetector';

describe('processDetector', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    _resetForTesting();
  });

  afterEach(() => {
    _resetForTesting();
    jest.useRealTimers();
  });

  it('detects running dota2.exe and sets state to in-match', async () => {
    mockedExec.mockImplementation((_cmd: string, cb: Function) => {
      cb(null, 'dota2.exe    1234 Console    1    100,000 K');
    });

    startDetection();
    await Promise.resolve();

    expect(getState()).toBe('in-match');
  });

  it('returns idle when dota2.exe is absent', async () => {
    mockedExec.mockImplementation((_cmd: string, cb: Function) => {
      cb(null, 'INFO: No tasks are running which match the specified criteria.');
    });

    startDetection();
    await Promise.resolve();

    expect(getState()).toBe('idle');
  });

  it('notifies listeners on state change', async () => {
    const listener = jest.fn();
    onStateChange(listener);

    mockedExec.mockImplementation((_cmd: string, cb: Function) => {
      cb(null, 'dota2.exe    1234 Console    1    100,000 K');
    });

    startDetection();
    await Promise.resolve();

    expect(listener).toHaveBeenCalledWith('in-match');
  });

  it('does not notify if state unchanged', async () => {
    const listener = jest.fn();

    mockedExec.mockImplementation((_cmd: string, cb: Function) => {
      cb(null, 'INFO: No tasks are running which match the specified criteria.');
    });

    startDetection();
    await Promise.resolve();

    onStateChange(listener);

    jest.advanceTimersByTime(2000);
    await Promise.resolve();

    expect(listener).not.toHaveBeenCalled();
  });

  it('handles exec errors gracefully', async () => {
    mockedExec.mockImplementation((_cmd: string, cb: Function) => {
      cb(new Error('exec failed'), '');
    });

    startDetection();
    await Promise.resolve();

    expect(getState()).toBe('idle');
  });

  it('unsubscribe removes listener', async () => {
    const listener = jest.fn();
    const unsub = onStateChange(listener);
    unsub();

    mockedExec.mockImplementation((_cmd: string, cb: Function) => {
      cb(null, 'dota2.exe    1234 Console    1    100,000 K');
    });

    startDetection();
    await Promise.resolve();

    expect(listener).not.toHaveBeenCalled();
  });
});
