import { DynamicEventConfig } from 'src/config/events.schema';
import { EngineSettings } from './types';
import { LEAD_SECONDS, ENGAGE_DISTANCE, MAX_FOG_SECONDS } from './constants';

interface Range {
  default: number;
  min: number;
  max: number;
}

export function clampSetting(value: unknown, range: Range): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return range.default;
  return Math.min(range.max, Math.max(range.min, value));
}

export function toEngineSettings(config: DynamicEventConfig | undefined): EngineSettings | null {
  if (!config || !config.enabled) return null;
  const settings = config.settings ?? {};
  return {
    leadSeconds: clampSetting(settings.leadSeconds, LEAD_SECONDS),
    engageDistance: clampSetting(settings.engageDistance, ENGAGE_DISTANCE),
    maxFogSeconds: clampSetting(settings.maxFogSeconds, MAX_FOG_SECONDS),
    visibleEnabled: config.notifications.visible !== false,
    fogEnabled: config.notifications.fog !== false,
  };
}
