import {
  loadSchedule,
  onAnnouncement,
  tick,
  resetScheduler,
  getUpcoming,
  getUpcomingOccurrences,
  _resetForTesting,
} from './eventScheduler';
import { EventsConfig } from 'src/config/events.schema';

describe('eventScheduler', () => {
  beforeEach(() => {
    _resetForTesting();
    jest.clearAllMocks();
  });

  describe('one-time event', () => {
    it('fires exactly once at spawn time', () => {
      const config: EventsConfig = {
        events: [
          {
            id: 'first-night',
            name: 'First Night',
            spawnTime: 300,
            warnings: [{ offsetSeconds: 60 }],
          },
        ],
      };

      const callback = jest.fn();
      onAnnouncement(callback);
      loadSchedule(config);

      tick(239_000);
      expect(callback).not.toHaveBeenCalled();

      tick(240_000);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('First Night', 60, 'first-night');

      tick(240_000);
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('repeating event with multiple warnings', () => {
    it('fires warnings in descending offset order per occurrence', () => {
      const config: EventsConfig = {
        events: [
          {
            id: 'bounty-rune',
            name: 'Bounty Rune',
            spawnTime: 180,
            repeatEvery: 180,
            warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
          },
        ],
      };

      const callback = jest.fn();
      onAnnouncement(callback);
      loadSchedule(config);

      tick(120_000);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('Bounty Rune', 60, 'bounty-rune');

      tick(150_000);
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenCalledWith('Bounty Rune', 30, 'bounty-rune');

      tick(300_000);
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenCalledWith('Bounty Rune', 60, 'bounty-rune');

      tick(330_000);
      expect(callback).toHaveBeenCalledTimes(4);
      expect(callback).toHaveBeenCalledWith('Bounty Rune', 30, 'bounty-rune');
    });

    it('fires both warnings at once if tick jumps past both', () => {
      const config: EventsConfig = {
        events: [
          {
            id: 'test',
            name: 'Test',
            spawnTime: 120,
            warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
          },
        ],
      };

      const calls: [string, number][] = [];
      onAnnouncement((name, offset) => calls.push([name, offset]));
      loadSchedule(config);

      tick(95_000);

      expect(calls).toHaveLength(2);
      expect(calls[0]).toEqual(['Test', 60]);
      expect(calls[1]).toEqual(['Test', 30]);
    });
  });

  describe('dedup guard', () => {
    it('suppresses double-fire when tick called at same offset', () => {
      const config: EventsConfig = {
        events: [
          {
            id: 'test',
            name: 'Test',
            spawnTime: 60,
            warnings: [{ offsetSeconds: 15 }],
          },
        ],
      };

      const callback = jest.fn();
      onAnnouncement(callback);
      loadSchedule(config);

      tick(45_000);
      tick(45_000);
      tick(45_100);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('reload config', () => {
    it('clears fired state so events re-announce in new cycle', () => {
      const config: EventsConfig = {
        events: [
          {
            id: 'test',
            name: 'Test',
            spawnTime: 60,
            warnings: [{ offsetSeconds: 15 }],
          },
        ],
      };

      const callback = jest.fn();
      onAnnouncement(callback);
      loadSchedule(config);

      tick(45_000);
      expect(callback).toHaveBeenCalledTimes(1);

      loadSchedule(config);
      tick(45_000);
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('game reset', () => {
    it('clears all pending and fired fire history', () => {
      const config: EventsConfig = {
        events: [
          {
            id: 'test',
            name: 'Test',
            spawnTime: 60,
            warnings: [{ offsetSeconds: 15 }],
          },
        ],
      };

      const callback = jest.fn();
      onAnnouncement(callback);
      loadSchedule(config);

      tick(45_000);
      expect(callback).toHaveBeenCalledTimes(1);

      resetScheduler();
      tick(45_000);
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('tick idempotency', () => {
    it('tick triggers announcementCallback with correct name+offset', () => {
      const config: EventsConfig = {
        events: [
          {
            id: 'rune',
            name: 'Power Rune',
            spawnTime: 120,
            warnings: [{ offsetSeconds: 30 }],
          },
        ],
      };

      const callback = jest.fn();
      onAnnouncement(callback);
      loadSchedule(config);

      tick(90_000);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('Power Rune', 30, 'rune');
    });

    it('duplicate tick at same ms does not re-fire', () => {
      const config: EventsConfig = {
        events: [
          {
            id: 'rune',
            name: 'Power Rune',
            spawnTime: 120,
            warnings: [{ offsetSeconds: 30 }],
          },
        ],
      };

      const callback = jest.fn();
      onAnnouncement(callback);
      loadSchedule(config);

      tick(90_000);
      tick(90_000);
      tick(90_000);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUpcoming', () => {
    it('returns upcoming events sorted by nearest fire time', () => {
      const config: EventsConfig = {
        events: [
          {
            id: 'far',
            name: 'Far Event',
            spawnTime: 300,
            warnings: [{ offsetSeconds: 60 }],
          },
          {
            id: 'near',
            name: 'Near Event',
            spawnTime: 120,
            warnings: [{ offsetSeconds: 30 }],
          },
        ],
      };

      loadSchedule(config);
      const upcoming = getUpcoming(0);

      expect(upcoming.length).toBeGreaterThanOrEqual(2);
      expect(upcoming[0].eventName).toBe('Near Event');
      expect(upcoming[1].eventName).toBe('Far Event');
    });
  });

  describe('getUpcomingOccurrences', () => {
    it('returns occurrences sorted by happen time', () => {
      const config: EventsConfig = {
        events: [
          { id: 'far', name: 'Far', spawnTime: 600, warnings: [{ offsetSeconds: 30 }] },
          { id: 'near', name: 'Near', spawnTime: 120, warnings: [{ offsetSeconds: 60 }] },
        ],
      };
      loadSchedule(config);
      const occ = getUpcomingOccurrences(0, 5);
      expect(occ[0].eventName).toBe('Near');
      expect(occ[0].happenTimeMs).toBe(120000);
      expect(occ[1].eventName).toBe('Far');
      expect(occ[1].happenTimeMs).toBe(600000);
    });

    it('deduplicates by occurrence (same event+time = one entry)', () => {
      const config: EventsConfig = {
        events: [
          { id: 'rune', name: 'Rune', spawnTime: 120, warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }] },
        ],
      };
      loadSchedule(config);
      const occ = getUpcomingOccurrences(0, 10);
      expect(occ.length).toBe(1);
      expect(occ[0].happenTimeMs).toBe(120000);
    });

    it('respects limit parameter', () => {
      const config: EventsConfig = {
        events: [
          { id: 'a', name: 'A', spawnTime: 60, repeatEvery: 60, warnings: [{ offsetSeconds: 10 }] },
        ],
      };
      loadSchedule(config);
      const occ = getUpcomingOccurrences(0, 3);
      expect(occ.length).toBe(3);
    });

    it('excludes past occurrences', () => {
      const config: EventsConfig = {
        events: [
          { id: 'past', name: 'Past', spawnTime: 60, warnings: [{ offsetSeconds: 10 }] },
          { id: 'future', name: 'Future', spawnTime: 120, warnings: [{ offsetSeconds: 10 }] },
        ],
      };
      loadSchedule(config);
      const occ = getUpcomingOccurrences(90000, 5);
      expect(occ.every((o) => o.happenTimeMs > 90000)).toBe(true);
      expect(occ[0].eventName).toBe('Future');
    });

    it('handles repeating events producing multiple future entries', () => {
      const config: EventsConfig = {
        events: [
          { id: 'bounty', name: 'Bounty', spawnTime: 180, repeatEvery: 180, warnings: [{ offsetSeconds: 30 }] },
        ],
      };
      loadSchedule(config);
      const occ = getUpcomingOccurrences(0, 5);
      expect(occ.length).toBe(5);
      expect(occ[0].happenTimeMs).toBe(180000);
      expect(occ[1].happenTimeMs).toBe(360000);
      expect(occ[2].happenTimeMs).toBe(540000);
    });
  });
});
