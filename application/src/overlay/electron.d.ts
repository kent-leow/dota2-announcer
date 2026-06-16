interface OverlayNotification {
  eventName: string;
  offsetSeconds: number;
  eventId: string;
  timestamp: number;
  happenTimeMs?: number;
  icon?: string;
}

interface OverlayFontSize {
  name: number;
  offset: number;
}

interface UpcomingOccurrence {
  eventId: string;
  eventName: string;
  happenTimeMs: number;
  icon?: string;
}

interface NotificationOverlayConfig {
  enabled: boolean;
  position: 'left' | 'right';
  fontSize: OverlayFontSize;
}

interface PersistentOverlayConfig {
  enabled: boolean;
  position: 'left' | 'right';
  fontSize: OverlayFontSize;
  eventCount: number;
}

interface OverlayConfigPayload {
  notification: NotificationOverlayConfig;
  persistent: PersistentOverlayConfig;
  overlaySize: number;
}

interface OverlayAPI {
  onNotification: (callback: (payload: OverlayNotification) => void) => () => void;
  getNotificationConfig: () => Promise<NotificationOverlayConfig>;
  getPersistentConfig: () => Promise<PersistentOverlayConfig>;
  getOverlaySize: () => Promise<number>;
  onConfigChange: (callback: (config: OverlayConfigPayload) => void) => () => void;
  onTick: (callback: (elapsedMs: number) => void) => () => void;
  onUpcoming: (callback: (occurrences: UpcomingOccurrence[]) => void) => () => void;
}

declare global {
  interface Window {
    overlayAPI: OverlayAPI;
  }
}

export {};
