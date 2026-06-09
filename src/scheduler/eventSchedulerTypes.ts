export interface ScheduledFire {
  fireId: string;
  eventId: string;
  eventName: string;
  offsetSeconds: number;
  fireAtMs: number;
}

export interface UpcomingEvent {
  eventId: string;
  eventName: string;
  fireAtMs: number;
  offsetSeconds: number;
}

export type AnnouncementCallback = (eventName: string, offsetSeconds: number) => void;
