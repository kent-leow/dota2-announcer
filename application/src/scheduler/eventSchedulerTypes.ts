export interface ScheduledFire {
  fireId: string;
  eventId: string;
  eventName: string;
  offsetSeconds: number;
  fireAtMs: number;
  icon?: string;
}

export interface UpcomingEvent {
  eventId: string;
  eventName: string;
  fireAtMs: number;
  offsetSeconds: number;
  icon?: string;
}

export interface UpcomingOccurrence {
  eventId: string;
  eventName: string;
  happenTimeMs: number;
  icon?: string;
}

export type AnnouncementCallback = (eventName: string, offsetSeconds: number, eventId: string, icon?: string) => void;
