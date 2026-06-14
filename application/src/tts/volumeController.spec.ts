jest.mock('./stateStore', () => {
  let state = { volume: 100, muted: false };
  return {
    readAppState: jest.fn(() => ({ ...state })),
    writeAppState: jest.fn((s: any) => { state = { ...s }; }),
    __reset: () => { state = { volume: 100, muted: false }; },
  };
});

import { writeAppState } from './stateStore';
import { setVolume, getVolume, loadVolume } from './volumeController';

describe('volumeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require('./stateStore') as any).__reset();
    loadVolume();
  });

  it('setVolume(75) is reflected on next getVolume() call', () => {
    setVolume(75);
    expect(getVolume()).toBe(75);
    expect(writeAppState).toHaveBeenCalledWith(expect.objectContaining({ volume: 75 }));
  });

  it('volume persists across save/load round-trip', () => {
    setVolume(42);
    const loaded = loadVolume();
    expect(loaded).toBe(42);
  });

  it('clamps volume to 0-100 range', () => {
    setVolume(150);
    expect(getVolume()).toBe(100);

    setVolume(-10);
    expect(getVolume()).toBe(0);
  });
});
