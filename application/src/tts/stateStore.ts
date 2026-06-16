import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_OVERLAY_SIZE, fontSizeToOverlaySize } from 'src/config/overlaySize';

export type OverlayPosition = 'left' | 'right';

export interface OverlayFontSize {
  name: number;
  offset: number;
}

export interface NotificationOverlayConfig {
  enabled: boolean;
  position: OverlayPosition;
  fontSize: OverlayFontSize;
}

export interface PersistentOverlayConfig {
  enabled: boolean;
  position: OverlayPosition;
  fontSize: OverlayFontSize;
  eventCount: number;
}

export interface AppState {
  volume: number;
  muted: boolean;
  includeTimeSuffix: boolean;
  rate: number;
  voiceUri: string;
  notification: NotificationOverlayConfig;
  persistent: PersistentOverlayConfig;
  overlaySize: number;
}

const DEFAULT_NOTIFICATION: NotificationOverlayConfig = {
  enabled: true,
  position: 'right',
  fontSize: { name: 16, offset: 13 },
};

const DEFAULT_PERSISTENT: PersistentOverlayConfig = {
  enabled: false,
  position: 'right',
  fontSize: { name: 16, offset: 13 },
  eventCount: 5,
};

function getStatePath(): string {
  try {
    const { app } = require('electron');
    return path.resolve(app.getPath('userData'), 'app-state.json');
  } catch {
    return path.resolve(process.cwd(), 'config', 'app-state.json');
  }
}

function parsePosition(val: unknown): OverlayPosition {
  if (val === 'left' || val === 'right') return val;
  if (val === 'left-center') return 'left';
  if (val === 'right-center') return 'right';
  return 'right';
}

function parseFontSize(val: unknown): OverlayFontSize {
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    return {
      name: typeof obj.name === 'number' ? obj.name : 16,
      offset: typeof obj.offset === 'number' ? obj.offset : 13,
    };
  }
  return { name: 16, offset: 13 };
}

function migrateFromLegacy(parsed: Record<string, unknown>): { notification: NotificationOverlayConfig; persistent: PersistentOverlayConfig } {
  const oldMode = parsed.overlayMode as string | undefined;
  const oldPosition = parsePosition(parsed.overlayPosition);
  const oldFontSize = parseFontSize(parsed.overlayFontSize);
  const oldEventCount = typeof parsed.overlayEventCount === 'number' ? Math.max(1, Math.min(10, parsed.overlayEventCount)) : 5;

  return {
    notification: {
      enabled: oldMode !== 'persistent',
      position: oldPosition,
      fontSize: oldFontSize,
    },
    persistent: {
      enabled: oldMode === 'persistent',
      position: oldPosition,
      fontSize: oldFontSize,
      eventCount: oldEventCount,
    },
  };
}

function parseOverlayConfig(parsed: Record<string, unknown>): { notification: NotificationOverlayConfig; persistent: PersistentOverlayConfig } {
  if (typeof parsed.notification === 'object' && parsed.notification !== null) {
    const n = parsed.notification as Record<string, unknown>;
    const p = (parsed.persistent ?? {}) as Record<string, unknown>;
    return {
      notification: {
        enabled: typeof n.enabled === 'boolean' ? n.enabled : DEFAULT_NOTIFICATION.enabled,
        position: parsePosition(n.position),
        fontSize: parseFontSize(n.fontSize),
      },
      persistent: {
        enabled: typeof p.enabled === 'boolean' ? p.enabled : DEFAULT_PERSISTENT.enabled,
        position: parsePosition(p.position),
        fontSize: parseFontSize(p.fontSize),
        eventCount: typeof p.eventCount === 'number' ? Math.max(1, Math.min(10, p.eventCount)) : DEFAULT_PERSISTENT.eventCount,
      },
    };
  }
  if ('overlayMode' in parsed || 'overlayPosition' in parsed) {
    return migrateFromLegacy(parsed);
  }
  return { notification: { ...DEFAULT_NOTIFICATION }, persistent: { ...DEFAULT_PERSISTENT } };
}

function parseOverlaySize(parsed: Record<string, unknown>, notification: NotificationOverlayConfig): number {
  if (typeof parsed.overlaySize === 'number') {
    return Math.max(1, Math.min(10, parsed.overlaySize));
  }
  return fontSizeToOverlaySize(notification.fontSize.name);
}

export function readAppState(): AppState {
  try {
    const raw = fs.readFileSync(getStatePath(), 'utf-8');
    const parsed = JSON.parse(raw);
    const overlays = parseOverlayConfig(parsed);
    return {
      volume: typeof parsed.volume === 'number' ? parsed.volume : 100,
      muted: typeof parsed.muted === 'boolean' ? parsed.muted : false,
      includeTimeSuffix: typeof parsed.includeTimeSuffix === 'boolean' ? parsed.includeTimeSuffix : true,
      rate: typeof parsed.rate === 'number' ? parsed.rate : 1.0,
      voiceUri: typeof parsed.voiceUri === 'string' ? parsed.voiceUri : '',
      notification: overlays.notification,
      persistent: overlays.persistent,
      overlaySize: parseOverlaySize(parsed, overlays.notification),
    };
  } catch {
    return {
      volume: 100,
      muted: false,
      includeTimeSuffix: true,
      rate: 1.0,
      voiceUri: '',
      notification: { ...DEFAULT_NOTIFICATION },
      persistent: { ...DEFAULT_PERSISTENT },
      overlaySize: DEFAULT_OVERLAY_SIZE,
    };
  }
}

export function writeAppState(state: AppState): void {
  const statePath = getStatePath();
  const dir = path.dirname(statePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf-8');
}
