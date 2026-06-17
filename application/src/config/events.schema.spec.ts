import { eventsConfigSchema, dynamicEventConfigSchema, dynamicEventsConfigSchema } from './events.schema';

describe('events.schema', () => {
  it('parses a valid config', () => {
    const valid = {
      events: [
        {
          id: 'bounty-rune',
          name: 'Bounty Rune',
          spawnTime: 180,
          repeatEvery: 180,
          warnings: [{ offsetSeconds: 60 }, { offsetSeconds: 30 }],
        },
      ],
    };
    const result = eventsConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects missing id', () => {
    const invalid = {
      events: [{ name: 'Bounty Rune', spawnTime: 180 }],
    };
    const result = eventsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects missing spawnTime', () => {
    const invalid = {
      events: [{ id: 'bounty-rune', name: 'Bounty Rune' }],
    };
    const result = eventsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric spawnTime', () => {
    const invalid = {
      events: [{ id: 'bounty-rune', name: 'Bounty Rune', spawnTime: 'abc' }],
    };
    const result = eventsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects negative spawnTime', () => {
    const invalid = {
      events: [{ id: 'bounty-rune', name: 'Bounty Rune', spawnTime: -10 }],
    };
    const result = eventsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts zero spawnTime', () => {
    const valid = {
      events: [{ id: 'bounty-rune', name: 'Bounty Rune', spawnTime: 0 }],
    };
    const result = eventsConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('allows optional repeatEvery and warnings', () => {
    const minimal = {
      events: [{ id: 'test', name: 'Test Event', spawnTime: 60 }],
    };
    const result = eventsConfigSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('accepts event with optional icon field', () => {
    const withIcon = {
      events: [{ id: 'test', name: 'Test', spawnTime: 0, icon: 'data:image/png;base64,abc123' }],
    };
    const result = eventsConfigSchema.safeParse(withIcon);
    expect(result.success).toBe(true);
  });

  it('accepts event without icon field', () => {
    const withoutIcon = {
      events: [{ id: 'test', name: 'Test', spawnTime: 0 }],
    };
    const result = eventsConfigSchema.safeParse(withoutIcon);
    expect(result.success).toBe(true);
  });

  it('rejects non-string icon value', () => {
    const invalid = {
      events: [{ id: 'test', name: 'Test', spawnTime: 0, icon: 123 }],
    };
    const result = eventsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts event without type field (defaults to fixed)', () => {
    const valid = {
      events: [{ id: 'test', name: 'Test', spawnTime: 0 }],
    };
    const result = eventsConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.events[0].type).toBeUndefined();
    }
  });

  it('accepts event with type "fixed"', () => {
    const valid = {
      events: [{ id: 'test', name: 'Test', spawnTime: 0, type: 'fixed' }],
    };
    const result = eventsConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts event with type "dynamic"', () => {
    const valid = {
      events: [{ id: 'test', name: 'Test', spawnTime: 0, type: 'dynamic' }],
    };
    const result = eventsConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects event with invalid type value', () => {
    const invalid = {
      events: [{ id: 'test', name: 'Test', spawnTime: 0, type: 'unknown' }],
    };
    const result = eventsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('dynamicEventConfigSchema', () => {
  it('validates a complete dynamic event config', () => {
    const valid = {
      id: 'roshan',
      name: 'Roshan',
      enabled: true,
      notifications: { kill: true, countdown: true, respawn: true },
    };
    const result = dynamicEventConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects missing notifications field', () => {
    const invalid = { id: 'roshan', name: 'Roshan', enabled: true };
    const result = dynamicEventConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects missing enabled field', () => {
    const invalid = {
      id: 'roshan',
      name: 'Roshan',
      notifications: { kill: true, countdown: true, respawn: true },
    };
    const result = dynamicEventConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('accepts partial notification fields (flexible record)', () => {
    const valid = {
      id: 'roshan',
      name: 'Roshan',
      enabled: true,
      notifications: { kill: true },
    };
    const result = dynamicEventConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects non-boolean notification values', () => {
    const invalid = {
      id: 'roshan',
      name: 'Roshan',
      enabled: true,
      notifications: { kill: 'yes' },
    };
    const result = dynamicEventConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('dynamicEventsConfigSchema', () => {
  it('validates a config with dynamic events array', () => {
    const valid = {
      dynamicEvents: [
        { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: true, respawn: true } },
      ],
    };
    const result = dynamicEventsConfigSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects empty id in dynamic event', () => {
    const invalid = {
      dynamicEvents: [
        { id: '', name: 'Roshan', enabled: true, notifications: { kill: true, countdown: true, respawn: true } },
      ],
    };
    const result = dynamicEventsConfigSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
