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
  setVolume: jest.fn(),
  getVolume: jest.fn(() => 100),
}));

import * as fs from 'fs';
import * as announcer from './announcer';
import { setVolume, getVolume, loadVolume } from './volumeController';

describe('volumeController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs as any).__resetStore();
  });

  it('setVolume(75) is reflected on next getVolume() call', () => {
    (announcer.getVolume as jest.Mock).mockReturnValue(75);
    setVolume(75);

    expect(announcer.setVolume).toHaveBeenCalledWith(75);
    expect(getVolume()).toBe(75);
  });

  it('volume persists across save/load round-trip', () => {
    setVolume(42);

    (announcer.getVolume as jest.Mock).mockReturnValue(100);
    const loaded = loadVolume();

    expect(loaded).toBe(42);
    expect(announcer.setVolume).toHaveBeenCalledWith(42);
  });

  it('clamps volume to 0-100 range', () => {
    setVolume(150);
    expect(announcer.setVolume).toHaveBeenCalledWith(100);

    setVolume(-10);
    expect(announcer.setVolume).toHaveBeenCalledWith(0);
  });
});
