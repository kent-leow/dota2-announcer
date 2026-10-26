import { toEngineSettings, clampSetting } from './settings';
import { DynamicEventConfig } from 'src/config/events.schema';
import { LEAD_SECONDS, ENGAGE_DISTANCE, MAX_FOG_SECONDS } from './constants';

function config(overrides: Partial<DynamicEventConfig> = {}): DynamicEventConfig {
  return {
    id: 'map-awareness',
    name: 'Map Awareness',
    enabled: true,
    notifications: { visible: true, fog: true },
    settings: { leadSeconds: 5, engageDistance: 800, maxFogSeconds: 20 },
    ...overrides,
  };
}

describe('toEngineSettings', () => {
  it('returns null when disabled or missing', () => {
    expect(toEngineSettings(config({ enabled: false }))).toBeNull();
    expect(toEngineSettings(undefined)).toBeNull();
  });

  it('maps a valid config', () => {
    expect(toEngineSettings(config())).toEqual({
      leadSeconds: 5, engageDistance: 800, maxFogSeconds: 20, visibleEnabled: true, fogEnabled: true,
    });
  });

  it('clamps out-of-range values', () => {
    const low = toEngineSettings(config({ settings: { leadSeconds: 1, engageDistance: 299, maxFogSeconds: 4 } }))!;
    expect([low.leadSeconds, low.engageDistance, low.maxFogSeconds]).toEqual([2, 300, 5]);
    const high = toEngineSettings(config({ settings: { leadSeconds: 16, engageDistance: 1501, maxFogSeconds: 41 } }))!;
    expect([high.leadSeconds, high.engageDistance, high.maxFogSeconds]).toEqual([15, 1500, 40]);
  });

  it('uses defaults when settings are missing', () => {
    const s = toEngineSettings(config({ settings: undefined }))!;
    expect([s.leadSeconds, s.engageDistance, s.maxFogSeconds]).toEqual([LEAD_SECONDS.default, ENGAGE_DISTANCE.default, MAX_FOG_SECONDS.default]);
  });

  it('treats missing notification flags as enabled', () => {
    const s = toEngineSettings(config({ notifications: { visible: false } }))!;
    expect(s.visibleEnabled).toBe(false);
    expect(s.fogEnabled).toBe(true);
  });

  it('falls back to the default for non-numeric values', () => {
    expect(clampSetting('abc', LEAD_SECONDS)).toBe(LEAD_SECONDS.default);
    expect(clampSetting(NaN, LEAD_SECONDS)).toBe(LEAD_SECONDS.default);
  });
});
