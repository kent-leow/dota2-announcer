import { eventsConfigSchema } from './events.schema';

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
});
