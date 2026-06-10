import { logEvent, clearEvent, clearAll, getStatus, _resetForTesting } from './gameStatusTracker';
import {
  ROSHAN_MIN_RESPAWN_MS,
  ROSHAN_MAX_RESPAWN_MS,
  BUYBACK_COOLDOWN_MS,
  GLYPH_COOLDOWN_MS,
} from './gameConstants';

describe('gameStatusTracker', () => {
  beforeEach(() => {
    _resetForTesting();
  });

  it('returns null for all events initially', () => {
    const status = getStatus();
    expect(status.roshan).toBeNull();
    expect(status.buyback).toBeNull();
    expect(status.glyph).toBeNull();
  });

  describe('logEvent - roshan', () => {
    it('computes may-respawn and confirmed-respawn deadlines', () => {
      logEvent('roshan', 60000);
      const status = getStatus();
      expect(status.roshan).not.toBeNull();
      expect(status.roshan!.loggedAtMs).toBe(60000);
      expect(status.roshan!.deadlines).toEqual([
        { label: 'May respawn', timeMs: 60000 + ROSHAN_MIN_RESPAWN_MS },
        { label: 'Confirmed respawn', timeMs: 60000 + ROSHAN_MAX_RESPAWN_MS },
      ]);
    });
  });

  describe('logEvent - buyback', () => {
    it('computes buyback cooldown deadline', () => {
      logEvent('buyback', 120000);
      const status = getStatus();
      expect(status.buyback).not.toBeNull();
      expect(status.buyback!.loggedAtMs).toBe(120000);
      expect(status.buyback!.deadlines).toEqual([
        { label: 'Buyback available', timeMs: 120000 + BUYBACK_COOLDOWN_MS },
      ]);
    });
  });

  describe('logEvent - glyph', () => {
    it('computes glyph cooldown deadline', () => {
      logEvent('glyph', 90000);
      const status = getStatus();
      expect(status.glyph).not.toBeNull();
      expect(status.glyph!.loggedAtMs).toBe(90000);
      expect(status.glyph!.deadlines).toEqual([
        { label: 'Glyph available', timeMs: 90000 + GLYPH_COOLDOWN_MS },
      ]);
    });
  });

  describe('clearEvent', () => {
    it('resets a single event', () => {
      logEvent('roshan', 60000);
      logEvent('buyback', 120000);
      clearEvent('roshan');

      const status = getStatus();
      expect(status.roshan).toBeNull();
      expect(status.buyback).not.toBeNull();
    });
  });

  describe('clearAll', () => {
    it('resets all events', () => {
      logEvent('roshan', 60000);
      logEvent('buyback', 120000);
      logEvent('glyph', 90000);
      clearAll();

      const status = getStatus();
      expect(status.roshan).toBeNull();
      expect(status.buyback).toBeNull();
      expect(status.glyph).toBeNull();
    });
  });

  describe('re-logging', () => {
    it('overwrites previous event data', () => {
      logEvent('roshan', 60000);
      logEvent('roshan', 300000);

      const status = getStatus();
      expect(status.roshan!.loggedAtMs).toBe(300000);
      expect(status.roshan!.deadlines[0].timeMs).toBe(300000 + ROSHAN_MIN_RESPAWN_MS);
    });
  });
});
