import { EventsConfig, DynamicEventsConfig } from './events.schema';
import {
  BOUNTY_RUNE_ICON,
  WATER_RUNE_ICON,
  POWER_RUNE_ICON,
  WISDOM_RUNE_ICON,
  LOTUS_RUNE_ICON,
  NEUTRAL_CAMP_ICON,
  TORMENTOR_ICON,
  AGHANIM_SHARD_ICON,
} from './defaultIcons';
import { MAP_AWARENESS_EVENT_ID, LEAD_SECONDS, ENGAGE_DISTANCE, MAX_FOG_SECONDS } from 'src/dota/mapAwareness/constants';

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
      id: MAP_AWARENESS_EVENT_ID,
      name: 'Map Awareness',
      enabled: true,
      notifications: {
        visible: true,
        fog: true,
      },
      settings: {
        leadSeconds: LEAD_SECONDS.default,
        engageDistance: ENGAGE_DISTANCE.default,
        maxFogSeconds: MAX_FOG_SECONDS.default,
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
  'neutral-camp',
  'tormentor',
  'aghanim-shard',
] as const;
