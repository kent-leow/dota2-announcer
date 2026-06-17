import { EventsConfig, DynamicEventsConfig } from './events.schema';
import {
  BOUNTY_RUNE_ICON,
  WATER_RUNE_ICON,
  POWER_RUNE_ICON,
  WISDOM_RUNE_ICON,
  LOTUS_RUNE_ICON,
  NIGHT_ICON,
  DAY_ICON,
  NEUTRAL_CAMP_ICON,
  TORMENTOR_ICON,
  AGHANIM_SHARD_ICON,
  SIEGE_CREEP_ICON,
  FLAGBEARER_CREEP_ICON,
} from './defaultIcons';

export const DEFAULT_EVENTS: EventsConfig = {
  events: [
    {
      id: 'bounty-rune',
      name: 'Bounty Rune',
      spawnTime: 0,
      repeatEvery: 180,
      warnings: [{ offsetSeconds: 0 }],
      icon: BOUNTY_RUNE_ICON,
    },
    {
      id: 'water-rune',
      name: 'Water Rune',
      spawnTime: 120,
      repeatEvery: 120,
      maxOccurrences: 2,
      warnings: [{ offsetSeconds: 0 }],
      icon: WATER_RUNE_ICON,
    },
    {
      id: 'power-rune',
      name: 'Power Rune',
      spawnTime: 360,
      repeatEvery: 120,
      warnings: [{ offsetSeconds: 0 }],
      icon: POWER_RUNE_ICON,
    },
    {
      id: 'wisdom-rune',
      name: 'Wisdom Rune',
      spawnTime: 420,
      repeatEvery: 420,
      warnings: [{ offsetSeconds: 0 }],
      icon: WISDOM_RUNE_ICON,
    },
    {
      id: 'lotus-rune',
      name: 'Lotus Rune',
      spawnTime: 180,
      repeatEvery: 180,
      warnings: [{ offsetSeconds: 0 }],
      icon: LOTUS_RUNE_ICON,
    },
    {
      id: 'night',
      name: 'Night',
      spawnTime: 300,
      repeatEvery: 600,
      warnings: [{ offsetSeconds: 0 }],
      icon: NIGHT_ICON,
    },
    {
      id: 'day',
      name: 'Day',
      spawnTime: 0,
      repeatEvery: 600,
      warnings: [{ offsetSeconds: 0 }],
      icon: DAY_ICON,
    },
    {
      id: 'neutral-camp',
      name: 'Neutral Camp',
      spawnTime: 60,
      repeatEvery: 60,
      warnings: [{ offsetSeconds: 0 }],
      icon: NEUTRAL_CAMP_ICON,
    },
    {
      id: 'tormentor',
      name: 'Tormentor',
      spawnTime: 1200,
      warnings: [{ offsetSeconds: 0 }],
      icon: TORMENTOR_ICON,
    },
    {
      id: 'aghanim-shard',
      name: 'Aghanim Shard',
      spawnTime: 900,
      warnings: [{ offsetSeconds: 0 }],
      icon: AGHANIM_SHARD_ICON,
    },
    {
      id: 'siege-creep',
      name: 'Siege Creep',
      spawnTime: 300,
      repeatEvery: 300,
      warnings: [{ offsetSeconds: 0 }],
      icon: SIEGE_CREEP_ICON,
    },
    {
      id: 'flagbearer-creep',
      name: 'Flagbearer Creep',
      spawnTime: 120,
      repeatEvery: 60,
      warnings: [{ offsetSeconds: 0 }],
      icon: FLAGBEARER_CREEP_ICON,
    },
  ],
};

export const DEFAULT_DYNAMIC_EVENTS: DynamicEventsConfig = {
  dynamicEvents: [
    {
      id: 'roshan',
      name: 'Roshan',
      enabled: true,
      notifications: {
        kill: true,
        countdown: true,
        respawn: true,
      },
    },
    {
      id: 'hero-items',
      name: 'Hero Items',
      enabled: true,
      notifications: {
        acquired: true,
        sold: true,
      },
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
  'siege-creep',
  'flagbearer-creep',
] as const;
