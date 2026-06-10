jest.mock('./stateStore', () => {
  let state = { volume: 100, muted: false };
  return {
    readAppState: jest.fn(() => ({ ...state })),
    writeAppState: jest.fn((s: any) => { state = { ...s }; }),
    __reset: () => { state = { volume: 100, muted: false }; },
  };
});

import { readAppState, writeAppState } from './stateStore';
import { toggleMute, isMuted, loadMuteState, setMuted } from './muteManager';

describe('muteManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (require('./stateStore') as any).__reset();
    loadMuteState();
  });

  it('muting silences all future speech', () => {
    const result = toggleMute();
    expect(result).toBe(true);
    expect(isMuted()).toBe(true);
    expect(writeAppState).toHaveBeenCalledWith(expect.objectContaining({ muted: true }));
  });

  it('unmuting restores sound immediately', () => {
    setMuted(true);
    const result = toggleMute();
    expect(result).toBe(false);
    expect(isMuted()).toBe(false);
  });

  it('mute state persists across save/load round-trip', () => {
    setMuted(true);
    const loaded = loadMuteState();
    expect(loaded).toBe(true);
  });

  it('isMuted reflects current state', () => {
    expect(isMuted()).toBe(false);
    setMuted(true);
    expect(isMuted()).toBe(true);
  });
});
