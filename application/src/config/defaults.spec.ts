import { DEFAULT_EVENTS, DEFAULT_DYNAMIC_EVENTS, EVENT_GROUP_IDS } from './defaults';
import { eventsConfigSchema, dynamicEventsConfigSchema } from './events.schema';
import { LEAD_SECONDS, ENGAGE_DISTANCE, MAX_FOG_SECONDS } from 'src/dota/mapAwareness/constants';

describe('defaults', () => {
  it('contains all eight event groups', () => {
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

  it('includes an enabled map-awareness entry with default settings', () => {
    const ma = DEFAULT_DYNAMIC_EVENTS.dynamicEvents.find((e) => e.id === 'map-awareness')!;
    expect(ma.enabled).toBe(true);
    expect(ma.notifications).toEqual({ visible: true, fog: true });
    expect(ma.settings).toEqual({
      leadSeconds: LEAD_SECONDS.default,
      engageDistance: ENGAGE_DISTANCE.default,
      maxFogSeconds: MAX_FOG_SECONDS.default,
    });
  });
});
