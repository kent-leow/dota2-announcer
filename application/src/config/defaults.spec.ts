import { DEFAULT_EVENTS, EVENT_GROUP_IDS } from './defaults';
import { eventsConfigSchema } from './events.schema';

describe('defaults', () => {
  it('contains all twelve event groups', () => {
    const ids = DEFAULT_EVENTS.events.map((e) => e.id);

    for (const id of EVENT_GROUP_IDS) {
      expect(ids).toContain(id);
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

  it('all events have warnings set to offsetSeconds 0', () => {
    for (const event of DEFAULT_EVENTS.events) {
      expect(event.warnings).toEqual([{ offsetSeconds: 0 }]);
    }
  });

  it('all events have a truthy icon field', () => {
    for (const event of DEFAULT_EVENTS.events) {
      expect(event.icon).toBeTruthy();
      expect(event.icon).toMatch(/^data:image\//);
    }
  });
});
