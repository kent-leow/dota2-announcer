import { DEFAULT_EVENTS, DEFAULT_DYNAMIC_EVENTS, EVENT_GROUP_IDS } from './defaults';
import { eventsConfigSchema, dynamicEventsConfigSchema } from './events.schema';

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

describe('DEFAULT_DYNAMIC_EVENTS', () => {
  it('contains roshan entry', () => {
    const ids = DEFAULT_DYNAMIC_EVENTS.dynamicEvents.map((e) => e.id);
    expect(ids).toContain('roshan');
  });

  it('roshan config passes dynamic schema validation', () => {
    const result = dynamicEventsConfigSchema.safeParse(DEFAULT_DYNAMIC_EVENTS);
    expect(result.success).toBe(true);
  });

  it('roshan has all notification flags defaulting to true', () => {
    const roshan = DEFAULT_DYNAMIC_EVENTS.dynamicEvents.find((e) => e.id === 'roshan')!;
    expect(roshan.notifications.kill).toBe(true);
    expect(roshan.notifications.countdown).toBe(true);
    expect(roshan.notifications.respawn).toBe(true);
  });

  it('roshan is enabled by default', () => {
    const roshan = DEFAULT_DYNAMIC_EVENTS.dynamicEvents.find((e) => e.id === 'roshan')!;
    expect(roshan.enabled).toBe(true);
  });

  it('contains hero-items entry', () => {
    const ids = DEFAULT_DYNAMIC_EVENTS.dynamicEvents.map((e) => e.id);
    expect(ids).toContain('hero-items');
  });

  it('hero-items has acquired and sold notification flags defaulting to true', () => {
    const heroItems = DEFAULT_DYNAMIC_EVENTS.dynamicEvents.find((e) => e.id === 'hero-items')!;
    expect(heroItems.notifications.acquired).toBe(true);
    expect(heroItems.notifications.sold).toBe(true);
  });

  it('hero-items is enabled by default', () => {
    const heroItems = DEFAULT_DYNAMIC_EVENTS.dynamicEvents.find((e) => e.id === 'hero-items')!;
    expect(heroItems.enabled).toBe(true);
  });
});
