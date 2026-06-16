import {
  PLACEHOLDER_ICON,
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
  DEFAULT_EVENT_ICONS,
} from './defaultIcons';

describe('defaultIcons', () => {
  const allIcons = [
    PLACEHOLDER_ICON,
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
  ];

  it('all icon constants are valid data URI strings', () => {
    for (const icon of allIcons) {
      expect(icon).toMatch(/^data:image\//);
    }
  });

  it('DEFAULT_EVENT_ICONS maps all 12 event IDs', () => {
    const expectedIds = [
      'bounty-rune', 'water-rune', 'power-rune', 'wisdom-rune',
      'lotus-rune', 'night', 'day', 'neutral-camp',
      'tormentor', 'aghanim-shard', 'siege-creep', 'flagbearer-creep',
    ];
    for (const id of expectedIds) {
      expect(DEFAULT_EVENT_ICONS[id]).toMatch(/^data:image\//);
    }
  });

  it('PLACEHOLDER_ICON is distinct from event icons', () => {
    for (const [, icon] of Object.entries(DEFAULT_EVENT_ICONS)) {
      expect(icon).not.toBe(PLACEHOLDER_ICON);
    }
  });
});
