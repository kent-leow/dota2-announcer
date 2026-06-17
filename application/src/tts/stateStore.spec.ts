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
    it('returns default notification config', () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => { throw new Error('no file'); });
      const state = readAppState();
      expect(state.notification).toEqual({ enabled: true, position: 'right', fontSize: { name: 16, offset: 13 } });
    });

    it('returns default persistent config', () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => { throw new Error('no file'); });
      const state = readAppState();
      expect(state.persistent).toEqual({ enabled: false, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5, lookaheadSeconds: 30 });
    });
  });

  describe('migration from legacy state', () => {
    it('migrates overlayMode persistent to persistent.enabled', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ overlayMode: 'persistent', overlayPosition: 'right-center' }));
      const state = readAppState();
      expect(state.persistent.enabled).toBe(true);
      expect(state.notification.enabled).toBe(false);
    });

    it('migrates overlayMode notification to notification.enabled', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ overlayMode: 'notification', overlayPosition: 'left-center' }));
      const state = readAppState();
      expect(state.notification.enabled).toBe(true);
      expect(state.persistent.enabled).toBe(false);
      expect(state.notification.position).toBe('left');
      expect(state.persistent.position).toBe('left');
    });

    it('migrates overlayEventCount to persistent.eventCount', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ overlayMode: 'persistent', overlayEventCount: 8 }));
      const state = readAppState();
      expect(state.persistent.eventCount).toBe(8);
    });

    it('clamps migrated eventCount to 1-10', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ overlayMode: 'persistent', overlayEventCount: 20 }));
      const state = readAppState();
      expect(state.persistent.eventCount).toBe(10);
    });
  });

  describe('readAppState new format', () => {
    it('reads per-overlay config from new format', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
        notification: { enabled: false, position: 'left', fontSize: { name: 20, offset: 14 } },
        persistent: { enabled: true, position: 'right', fontSize: { name: 18, offset: 12 }, eventCount: 7 },
      }));
      const state = readAppState();
      expect(state.notification.enabled).toBe(false);
      expect(state.notification.position).toBe('left');
      expect(state.notification.fontSize.name).toBe(20);
      expect(state.persistent.enabled).toBe(true);
      expect(state.persistent.eventCount).toBe(7);
    });
  });

  describe('writeAppState round-trip', () => {
    it('persists per-overlay config', () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => { throw new Error('no file'); });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      const state = readAppState();
      state.persistent.enabled = true;
      state.persistent.eventCount = 3;
      writeAppState(state);

      const written = JSON.parse((fs.writeFileSync as jest.Mock).mock.calls[0][1]);
      expect(written.persistent.enabled).toBe(true);
      expect(written.persistent.eventCount).toBe(3);
      expect(written.notification.enabled).toBe(true);
    });
  });

  describe('dynamicEvents', () => {
    it('returns default dynamic events when state file missing', () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => { throw new Error('no file'); });
      const state = readAppState();
      expect(state.dynamicEvents).toHaveLength(2);
      expect(state.dynamicEvents[0].id).toBe('roshan');
      expect(state.dynamicEvents[0].enabled).toBe(true);
      expect(state.dynamicEvents[1].id).toBe('hero-items');
      expect(state.dynamicEvents[1].enabled).toBe(true);
    });

    it('returns default dynamic events when field not present in state', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
        notification: { enabled: true, position: 'right', fontSize: { name: 16, offset: 13 } },
        persistent: { enabled: false, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5, lookaheadSeconds: 30 },
      }));
      const state = readAppState();
      expect(state.dynamicEvents).toHaveLength(2);
      expect(state.dynamicEvents[0].id).toBe('roshan');
      expect(state.dynamicEvents[1].id).toBe('hero-items');
    });

    it('reads persisted dynamic events and merges missing defaults', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
        notification: { enabled: true, position: 'right', fontSize: { name: 16, offset: 13 } },
        persistent: { enabled: false, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5, lookaheadSeconds: 30 },
        dynamicEvents: [{ id: 'roshan', name: 'Roshan', enabled: false, notifications: { kill: true, countdown: false, respawn: true } }],
      }));
      const state = readAppState();
      expect(state.dynamicEvents[0].enabled).toBe(false);
      expect(state.dynamicEvents[0].notifications.countdown).toBe(false);
      expect(state.dynamicEvents).toHaveLength(2);
      expect(state.dynamicEvents[1].id).toBe('hero-items');
      expect(state.dynamicEvents[1].enabled).toBe(true);
    });

    it('persists dynamic events through writeAppState', () => {
      (fs.readFileSync as jest.Mock).mockImplementation(() => { throw new Error('no file'); });
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      const state = readAppState();
      state.dynamicEvents[0].enabled = false;
      writeAppState(state);

      const written = JSON.parse((fs.writeFileSync as jest.Mock).mock.calls[0][1]);
      expect(written.dynamicEvents[0].enabled).toBe(false);
    });
  });
});
