jest.mock('fs');
jest.mock('electron', () => ({
  app: { getPath: jest.fn(() => '/tmp/test-app') },
}));

import * as fs from 'fs';
import { readAppState, writeAppState } from './stateStore';

describe('stateStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readAppState defaults', () => {
    it('returns default overlayMode as notification', () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => { throw new Error('no file'); });
      const state = readAppState();
      expect(state.overlayMode).toBe('notification');
    });

    it('returns default overlayEventCount as 5', () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => { throw new Error('no file'); });
      const state = readAppState();
      expect(state.overlayEventCount).toBe(5);
    });
  });

  describe('readAppState parsing', () => {
    it('reads overlayMode from persisted state', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ overlayMode: 'persistent' }));
      const state = readAppState();
      expect(state.overlayMode).toBe('persistent');
    });

    it('falls back to notification for invalid overlayMode', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ overlayMode: 'invalid' }));
      const state = readAppState();
      expect(state.overlayMode).toBe('notification');
    });

    it('reads overlayEventCount from persisted state', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ overlayEventCount: 8 }));
      const state = readAppState();
      expect(state.overlayEventCount).toBe(8);
    });

    it('clamps overlayEventCount to 1-10 range', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ overlayEventCount: 20 }));
      const state = readAppState();
      expect(state.overlayEventCount).toBe(10);
    });

    it('clamps overlayEventCount minimum to 1', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ overlayEventCount: 0 }));
      const state = readAppState();
      expect(state.overlayEventCount).toBe(1);
    });
  });

  describe('writeAppState round-trip', () => {
    it('persists overlayMode and overlayEventCount', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      const state = readAppState();
      state.overlayMode = 'persistent';
      state.overlayEventCount = 3;
      writeAppState(state);

      const written = JSON.parse((fs.writeFileSync as jest.Mock).mock.calls[0][1]);
      expect(written.overlayMode).toBe('persistent');
      expect(written.overlayEventCount).toBe(3);
    });
  });
});
