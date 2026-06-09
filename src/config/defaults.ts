import { EventsConfig } from './events.schema';

export const DEFAULT_EVENTS: EventsConfig = {
  events: [
    // Bounty Runes — spawn at 0:00, repeat every 3 minutes
    {
      id: 'bounty-rune',
      name: 'Bounty Rune',
      spawnTime: 0,
      repeatEvery: 180,
      warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
    },
    // Water Runes — spawn at 2:00 and 4:00 (one-time events)
    {
      id: 'water-rune-first',
      name: 'Water Rune',
      spawnTime: 120,
      warnings: [{ offsetSeconds: 30 }],
    },
    {
      id: 'water-rune-second',
      name: 'Water Rune',
      spawnTime: 240,
      warnings: [{ offsetSeconds: 30 }],
    },
    // Power Runes — spawn at 6:00, repeat every 2 minutes
    {
      id: 'power-rune',
      name: 'Power Rune',
      spawnTime: 360,
      repeatEvery: 120,
      warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
    },
    // Wisdom Runes — spawn at 7:00, repeat every 7 minutes
    {
      id: 'wisdom-rune',
      name: 'Wisdom Rune',
      spawnTime: 420,
      repeatEvery: 420,
      warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
    },
    // Lotus Pool — activates at 3:00, repeats every 3 minutes
    {
      id: 'lotus-pool',
      name: 'Lotus Pool',
      spawnTime: 180,
      repeatEvery: 180,
      warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
    },
    // Day/Night Cycle — first night at 5:00 (300s), then every 5 minutes
    {
      id: 'first-night',
      name: 'First Night',
      spawnTime: 300,
      warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
    },
    {
      id: 'day-night-cycle',
      name: 'Day/Night Transition',
      spawnTime: 600,
      repeatEvery: 300,
      warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
    },
    // Neutral Camps Phase I — spawn at 1:00, repeat every minute
    {
      id: 'neutral-camps-phase1',
      name: 'Neutral Camps Phase I',
      spawnTime: 60,
      repeatEvery: 60,
      warnings: [{ offsetSeconds: 15 }],
    },
    // Neutral Camps Phase II (Ancient camps) — spawn at 7:00, repeat every minute
    {
      id: 'neutral-camps-phase2',
      name: 'Neutral Camps Phase II',
      spawnTime: 420,
      repeatEvery: 60,
      warnings: [{ offsetSeconds: 15 }],
    },
    // Tormentor — spawns at minute 20 (Night 3 per wiki)
    {
      id: 'tormentor',
      name: 'Tormentor',
      spawnTime: 1200,
      warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
    },
    // Roshan Reminder — 8-11 min respawn range, remind at standard intervals
    {
      id: 'roshan-reminder',
      name: 'Roshan Reminder',
      spawnTime: 480,
      repeatEvery: 480,
      warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
    },
  ],
};

export const EVENT_GROUP_IDS = [
  'bounty-rune',
  'water-rune-first',
  'water-rune-second',
  'power-rune',
  'wisdom-rune',
  'lotus-pool',
  'first-night',
  'day-night-cycle',
  'neutral-camps-phase1',
  'neutral-camps-phase2',
  'tormentor',
  'roshan-reminder',
] as const;
