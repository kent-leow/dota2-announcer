import { updateFromGsi, clearAll, getStatus, _resetForTesting } from './gameStatusTracker';

describe('gameStatusTracker', () => {
  beforeEach(() => {
    _resetForTesting();
  });

  it('returns default state initially', () => {
    const status = getStatus();
    expect(status.daytime).toBe(true);
    expect(status.roshan.state).toBe('alive');
    expect(status.roshan.endSeconds).toBe(0);
  });

  describe('updateFromGsi', () => {
    it('updates daytime from GSI', () => {
      updateFromGsi(false, 'alive', 0);
      expect(getStatus().daytime).toBe(false);

      updateFromGsi(true, 'alive', 0);
      expect(getStatus().daytime).toBe(true);
    });

    it('updates roshan state from GSI', () => {
      updateFromGsi(true, 'respawn_base', 540);
      const status = getStatus();
      expect(status.roshan.state).toBe('respawn_base');
      expect(status.roshan.endSeconds).toBe(540);
    });

    it('maps unknown roshan states to alive', () => {
      updateFromGsi(true, 'some_unknown', 0);
      expect(getStatus().roshan.state).toBe('alive');
    });

    it('handles respawn_extra state', () => {
      updateFromGsi(true, 'respawn_extra', 660);
      const status = getStatus();
      expect(status.roshan.state).toBe('respawn_extra');
      expect(status.roshan.endSeconds).toBe(660);
    });
  });

  describe('clearAll', () => {
    it('resets to default state', () => {
      updateFromGsi(false, 'respawn_base', 500);
      clearAll();

      const status = getStatus();
      expect(status.daytime).toBe(true);
      expect(status.roshan.state).toBe('alive');
    });
  });
});
