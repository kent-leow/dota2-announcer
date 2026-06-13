import { GameEvent, EventsConfig } from 'src/config/events.schema';
import {
  ScheduledFire,
  UpcomingEvent,
  AnnouncementCallback,
} from './eventSchedulerTypes';

let firedIds: Set<string> = new Set();
let announcementCallback: AnnouncementCallback | null = null;
let currentEvents: GameEvent[] = [];

function buildFireId(eventId: string, fireAtMs: number, offsetSeconds: number): string {
  return `${eventId}:${fireAtMs}:${offsetSeconds}`;
}

function computeFiresForEvent(event: GameEvent, currentMs: number, windowMs: number): ScheduledFire[] {
  const fires: ScheduledFire[] = [];
  const warnings = event.warnings ?? [];
  if (warnings.length === 0) return fires;

  const spawnTimeMs = event.spawnTime * 1000;
  const maxOffset = Math.max(...warnings.map((w) => w.offsetSeconds)) * 1000;
  const lookAhead = currentMs + windowMs + maxOffset;

  const occurrences: number[] = [];

  if (event.repeatEvery) {
    const repeatMs = event.repeatEvery * 1000;
    const maxOcc = event.maxOccurrences ?? Infinity;
    let occurrence = spawnTimeMs;
    let count = 0;
    while (occurrence <= lookAhead && count < maxOcc) {
      occurrences.push(occurrence);
      occurrence += repeatMs;
      count++;
    }
  } else {
    occurrences.push(spawnTimeMs);
  }

  for (const occurrenceMs of occurrences) {
    for (const warning of warnings) {
      const fireAtMs = occurrenceMs - warning.offsetSeconds * 1000;
      if (fireAtMs >= 0) {
        fires.push({
          fireId: buildFireId(event.id, occurrenceMs, warning.offsetSeconds),
          eventId: event.id,
          eventName: event.name,
          offsetSeconds: warning.offsetSeconds,
          fireAtMs,
        });
      }
    }
  }

  return fires;
}


export function loadSchedule(config?: EventsConfig, currentElapsedMs?: number): void {
  if (config) {
    currentEvents = config.events;
  }
  firedIds = new Set();

  if (currentElapsedMs != null && currentElapsedMs > 0) {
    for (const event of currentEvents) {
      const fires = computeFiresForEvent(event, currentElapsedMs, 0);
      for (const fire of fires) {
        if (fire.fireAtMs <= currentElapsedMs) {
          firedIds.add(fire.fireId);
        }
      }
    }
  }
}

export function onAnnouncement(callback: AnnouncementCallback): void {
  announcementCallback = callback;
}

export function tick(elapsedMs: number): void {
  const pendingFires: ScheduledFire[] = [];

  for (const event of currentEvents) {
    const fires = computeFiresForEvent(event, elapsedMs, 0);
    for (const fire of fires) {
      if (fire.fireAtMs <= elapsedMs && !firedIds.has(fire.fireId)) {
        pendingFires.push(fire);
      }
    }
  }

  pendingFires.sort((a, b) => b.offsetSeconds - a.offsetSeconds);

  for (const fire of pendingFires) {
    firedIds.add(fire.fireId);
    announcementCallback?.(fire.eventName, fire.offsetSeconds, fire.eventId);
  }
}

export function getUpcoming(elapsedMs: number, limit: number = 10): UpcomingEvent[] {
  const upcoming: UpcomingEvent[] = [];
  const lookAheadMs = 120_000;

  for (const event of currentEvents) {
    const fires = computeFiresForEvent(event, elapsedMs, lookAheadMs);
    for (const fire of fires) {
      if (fire.fireAtMs > elapsedMs && !firedIds.has(fire.fireId)) {
        upcoming.push({
          eventId: fire.eventId,
          eventName: fire.eventName,
          fireAtMs: fire.fireAtMs,
          offsetSeconds: fire.offsetSeconds,
        });
      }
    }
  }

  upcoming.sort((a, b) => a.fireAtMs - b.fireAtMs);
  return upcoming.slice(0, limit);
}

export function resetScheduler(): void {
  firedIds = new Set();
}

export function _resetForTesting(): void {
  firedIds = new Set();
  announcementCallback = null;
  currentEvents = [];
}
