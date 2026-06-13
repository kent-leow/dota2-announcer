# Task 003 — Scheduler: Upcoming Events Feed for Persistent Mode

## Goal
Extend the event scheduler to provide a feed of upcoming event occurrences (with absolute happen times) suitable for the persistent overlay. Verified by calling the new method and receiving correctly sorted upcoming events with their spawn times.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Scheduler Layer

- [x] `src/scheduler/eventScheduler.ts` — Add `getUpcomingOccurrences(elapsedMs: number, limit: number): UpcomingOccurrence[]` that returns the next N event occurrences (not warning fires) sorted by `happenTimeMs` ascending; each entry: `{ eventId, eventName, happenTimeMs }`. Deduplicate by occurrence (same event + same happenTime = one entry regardless of warning count)
  - [x] `src/scheduler/eventScheduler.spec.ts` — Test returns correct upcoming occurrences sorted by time; test deduplication (one entry per occurrence); test respects limit; test excludes past occurrences; test handles repeating events

### Types

- [x] `src/scheduler/eventSchedulerTypes.ts` — Add `UpcomingOccurrence` type: `{ eventId: string; eventName: string; happenTimeMs: number }`
  - [x] (no separate test — type-only file)

## Done When
- [x] `getUpcomingOccurrences(currentMs, 5)` returns up to 5 future event occurrences sorted by happen time <!-- verified 2026-06-14 -->
- [x] Repeating events produce multiple future entries <!-- verified 2026-06-14 -->
- [x] Past occurrences (happenTimeMs <= elapsedMs) are excluded <!-- verified 2026-06-14 -->
- [x] All new and modified tests pass <!-- verified 2026-06-14 -->
- [x] No existing tests broken <!-- verified 2026-06-14 -->
