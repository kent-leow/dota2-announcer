interface OverlayNotification {
  eventName: string;
  offsetSeconds: number;
  eventId: string;
  timestamp: number;
  happenTimeMs?: number;
}

interface OverlayFontSize {
  name: number;
  offset: number;
}

interface UpcomingOccurrence {
  eventId: string;
  eventName: string;
  happenTimeMs: number;
}

interface OverlayAPI {
  onNotification: (callback: (payload: OverlayNotification) => void) => () => void;
  onPositionChange: (callback: (position: string) => void) => () => void;
  getPosition: () => Promise<string>;
  getFontSize: () => Promise<OverlayFontSize>;
  onFontSizeChange: (callback: (fontSize: OverlayFontSize) => void) => () => void;
  getMode: () => Promise<string>;
  onModeChange: (callback: (mode: string) => void) => () => void;
  getEventCount: () => Promise<number>;
  onEventCountChange: (callback: (count: number) => void) => () => void;
  onTick: (callback: (elapsedMs: number) => void) => () => void;
  onUpcoming: (callback: (occurrences: UpcomingOccurrence[]) => void) => () => void;
}

declare global {
  interface Window {
    overlayAPI: OverlayAPI;
  }
}

export {};
