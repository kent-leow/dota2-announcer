import { DEFAULT_EVENTS, EVENT_GROUP_IDS } from './defaults';
import { eventsConfigSchema } from './events.schema';

describe('defaults', () => {
  it('contains all nine event groups', () => {
    const ids = DEFAULT_EVENTS.events.map((e) => e.id);

    const expectedGroups = [
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
    ];

    for (const group of expectedGroups) {
      expect(ids).toContain(group);
    }
  });

  it('all events have correct IDs matching EVENT_GROUP_IDS', () => {
    const ids = DEFAULT_EVENTS.events.map((e) => e.id);
    for (const id of EVENT_GROUP_IDS) {
      expect(ids).toContain(id);
    }
  });

  it('all events have non-empty names', () => {
    for (const event of DEFAULT_EVENTS.events) {
      expect(event.name.length).toBeGreaterThan(0);
    }
  });

  it('passes schema validation', () => {
    const result = eventsConfigSchema.safeParse(DEFAULT_EVENTS);
    expect(result.success).toBe(true);
  });
});
