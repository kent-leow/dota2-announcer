import { EventsConfig } from 'src/config/events.schema';

export interface GsiStatusUpdate {
  daytime: boolean;
  roshanState: string;
  roshanStateEndSeconds: number;
  clockTime: number;
}

export interface GsiInstallResult {
  success: boolean;
  path?: string;
  error?: string;
}

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
  lookaheadSeconds: number;
}

export interface OverlayConfig {
  notification: NotificationOverlayConfig;
  persistent: PersistentOverlayConfig;
  overlaySize: number;
}

export interface ElectronAPI {
  onMenuOpenGuide: (callback: () => void) => () => void;
  getState: () => Promise<string>;
  getElapsed: () => Promise<number>;
  isPaused: () => Promise<boolean>;
  onStateChange: (callback: (state: string) => void) => () => void;
  onClockTick: (callback: (elapsedMs: number) => void) => () => void;
  onPauseChange: (callback: (paused: boolean) => void) => () => void;
  toggleMute: () => Promise<boolean>;
  setMuted: (muted: boolean) => Promise<void>;
  isMuted: () => Promise<boolean>;
  setVolume: (value: number) => Promise<void>;
  getVolume: () => Promise<number>;
  getRate: () => Promise<number>;
  setRate: (value: number) => Promise<number>;
  getVoiceUri: () => Promise<string>;
  setVoiceUri: (uri: string) => Promise<string>;
  getEvents: () => Promise<EventsConfig>;
  reloadEvents: () => Promise<EventsConfig>;
  saveEvents: (config: EventsConfig) => Promise<{ success: boolean; error?: string; config?: EventsConfig }>;
  getIncludeTimeSuffix: () => Promise<boolean>;
  setIncludeTimeSuffix: (value: boolean) => Promise<boolean>;
  gsiInstall: () => Promise<GsiInstallResult>;
  gsiUninstall: () => Promise<GsiInstallResult>;
  gsiIsInstalled: () => Promise<boolean>;
  gsiIsConnected: () => Promise<boolean>;
  gsiGetInstallPath: () => Promise<string | null>;
  onGsiStatusUpdate: (callback: (status: GsiStatusUpdate) => void) => () => void;
  sendOverlayNotification: (payload: { eventName: string; offsetSeconds: number; eventId: string; happenTimeMs: number; icon?: string }) => void;
  sendOverlayUpcoming: (occurrences: Array<{ eventId: string; eventName: string; happenTimeMs: number; icon?: string }>) => void;
  onEventsChanged: (callback: (config: EventsConfig) => void) => () => void;
  getNotificationConfig: () => Promise<NotificationOverlayConfig>;
  setNotificationConfig: (config: Partial<NotificationOverlayConfig>) => Promise<NotificationOverlayConfig>;
  getPersistentConfig: () => Promise<PersistentOverlayConfig>;
  setPersistentConfig: (config: Partial<PersistentOverlayConfig>) => Promise<PersistentOverlayConfig>;
  getOverlaySize: () => Promise<number>;
  setOverlaySize: (size: number) => Promise<number>;
  onOverlayConfigChanged: (callback: (config: OverlayConfig) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
