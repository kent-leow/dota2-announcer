interface OverlayNotification {
  eventName: string;
  offsetSeconds: number;
  eventId: string;
  timestamp: number;
}

interface OverlayAPI {
  onNotification: (callback: (payload: OverlayNotification) => void) => () => void;
}

declare global {
  interface Window {
    overlayAPI: OverlayAPI;
  }
}

export {};
