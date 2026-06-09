jest.mock('fs', () => {
  let store: string | null = null;
  return {
    readFileSync: jest.fn(() => {
      if (store === null) throw new Error('ENOENT');
      return store;
    }),
    writeFileSync: jest.fn((_path: string, data: string) => {
      store = data;
    }),
    existsSync: jest.fn(() => true),
    mkdirSync: jest.fn(),
    __resetStore: () => { store = null; },
  };
});

jest.mock('./announcer', () => ({
  setMuted: jest.fn(),
  getMuted: jest.fn(() => false),
}));

import * as fs from 'fs';
import * as announcer from './announcer';
import { toggleMute, isMuted, loadMuteState, setMuted } from './muteManager';

describe('muteManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs as any).__resetStore();
    (announcer.getMuted as jest.Mock).mockReturnValue(false);
  });

  it('muting silences all future speech', () => {
    (announcer.getMuted as jest.Mock).mockReturnValue(false);
    const result = toggleMute();

    expect(result).toBe(true);
    expect(announcer.setMuted).toHaveBeenCalledWith(true);
  });

  it('unmuting restores sound immediately', () => {
    (announcer.getMuted as jest.Mock).mockReturnValue(true);
    const result = toggleMute();

    expect(result).toBe(false);
    expect(announcer.setMuted).toHaveBeenCalledWith(false);
  });

  it('mute state persists across app restart (load round-trip)', () => {
    (announcer.getMuted as jest.Mock).mockReturnValue(false);
    setMuted(true);

    const loaded = loadMuteState();
    expect(loaded).toBe(true);
    expect(announcer.setMuted).toHaveBeenCalledWith(true);
  });

  it('reloading config preserves muted flag', () => {
    setMuted(true);

    const loaded = loadMuteState();
    expect(loaded).toBe(true);
  });

  it('isMuted reflects current announcer state', () => {
    (announcer.getMuted as jest.Mock).mockReturnValue(true);
    expect(isMuted()).toBe(true);

    (announcer.getMuted as jest.Mock).mockReturnValue(false);
    expect(isMuted()).toBe(false);
  });
});
