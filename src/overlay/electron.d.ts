interface OverlayNotification {
  eventName: string;
  offsetSeconds: number;
  eventId: string;
  timestamp: number;
}

interface OverlayAPI {
  onNotification: (callback: (payload: OverlayNotification) => void) => () => void;
  onPositionChange: (callback: (position: string) => void) => () => void;
  getPosition: () => Promise<string>;
}

declare global {
  interface Window {
    overlayAPI: OverlayAPI;
  }
}

export {};
