import {
  PLACEHOLDER_ICON,
  BOUNTY_RUNE_ICON,
  WATER_RUNE_ICON,
  POWER_RUNE_ICON,
  WISDOM_RUNE_ICON,
  LOTUS_RUNE_ICON,
  NEUTRAL_CAMP_ICON,
  TORMENTOR_ICON,
  AGHANIM_SHARD_ICON,
  MAP_AWARENESS_ICON,
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
    NEUTRAL_CAMP_ICON,
    TORMENTOR_ICON,
    AGHANIM_SHARD_ICON,
    MAP_AWARENESS_ICON,
  ];

  it('all icon constants are valid data URI strings', () => {
    for (const icon of allIcons) {
      expect(icon).toMatch(/^data:image\//);
    }
  });

  it('DEFAULT_EVENT_ICONS maps all 8 event IDs', () => {
    const expectedIds = [
      'bounty-rune', 'water-rune', 'power-rune', 'wisdom-rune',
      'lotus-rune', 'neutral-camp', 'tormentor', 'aghanim-shard',
    ];
    for (const id of expectedIds) {
      expect(DEFAULT_EVENT_ICONS[id]).toMatch(/^data:image\//);
    }
  });

  it('MAP_AWARENESS_ICON is distinct from the placeholder', () => {
    expect(MAP_AWARENESS_ICON).not.toBe(PLACEHOLDER_ICON);
  });

  it('PLACEHOLDER_ICON is distinct from event icons', () => {
    for (const [, icon] of Object.entries(DEFAULT_EVENT_ICONS)) {
      expect(icon).not.toBe(PLACEHOLDER_ICON);
    }
  });
});
