interface OverlayNotification {
  eventName: string;
  offsetSeconds: number;
  eventId: string;
  timestamp: number;
}

interface OverlayFontSize {
  name: number;
  offset: number;
}

interface OverlayAPI {
  onNotification: (callback: (payload: OverlayNotification) => void) => () => void;
  onPositionChange: (callback: (position: string) => void) => () => void;
  getPosition: () => Promise<string>;
  getFontSize: () => Promise<OverlayFontSize>;
  onFontSizeChange: (callback: (fontSize: OverlayFontSize) => void) => () => void;
}

declare global {
  interface Window {
    overlayAPI: OverlayAPI;
  }
}

export {};
