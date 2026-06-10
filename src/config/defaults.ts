import { EventsConfig } from './events.schema';

export const DEFAULT_EVENTS: EventsConfig = {
  events: [
    {
      id: 'bounty-rune',
      name: 'Bounty Rune',
      spawnTime: 0,
      repeatEvery: 180,
      warnings: [{ offsetSeconds: 15 }],
    },
    {
      id: 'water-rune',
      name: 'Water Rune',
      spawnTime: 120,
      repeatEvery: 120,
      maxOccurrences: 2,
      warnings: [{ offsetSeconds: 15 }],
    },
    {
      id: 'power-rune',
      name: 'Power Rune',
      spawnTime: 360,
      repeatEvery: 120,
      warnings: [{ offsetSeconds: 15 }],
    },
    {
      id: 'wisdom-rune',
      name: 'Wisdom Rune',
      spawnTime: 420,
      repeatEvery: 420,
      warnings: [{ offsetSeconds: 20 }],
    },
    {
      id: 'lotus-rune',
      name: 'Lotus Rune',
      spawnTime: 180,
      repeatEvery: 180,
      warnings: [{ offsetSeconds: 15 }],
    },
    {
      id: 'night',
      name: 'Night',
      spawnTime: 360,
      repeatEvery: 720,
      warnings: [{ offsetSeconds: 30 }],
    },
    {
      id: 'day',
      name: 'Day',
      spawnTime: 0,
      repeatEvery: 720,
      warnings: [{ offsetSeconds: 30 }],
    },
    {
      id: 'neutral-camp',
      name: 'Neutral Camp',
      spawnTime: 60,
      repeatEvery: 60,
      warnings: [{ offsetSeconds: 15 }],
    },
    {
      id: 'tormentor',
      name: 'Tormentor',
      spawnTime: 1200,
      warnings: [{ offsetSeconds: 15 }],
    },
    {
      id: 'aghanim-shard',
      name: 'Aghanim Shard',
      spawnTime: 900,
      warnings: [{ offsetSeconds: 30 }],
    },
  ],
};

export const EVENT_GROUP_IDS = [
  'bounty-rune',
  'water-rune',
  'power-rune',
  'wisdom-rune',
  'lotus-rune',
  'night',
  'day',
  'neutral-camp',
  'tormentor',
  'aghanim-shard',
] as const;
