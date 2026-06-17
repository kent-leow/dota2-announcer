# Task 003 — Overlay Integration (Notification + Persistent Panel)

## Goal
Wire Roshan tracker events into the existing notification overlay and persistent panel so users see pop-ups for kill/countdown/respawn and a persistent countdown entry during the respawn window. Verified by: Roshan events appear in both overlays with correct display text and timing.

## Prerequisites
- [ ] task-002.md completed

## Tasks

### Overlay Notifier

- [x] `application/src/main/overlayNotifier.ts` — Import `roshanTracker`; subscribe to `onRoshanEvent`; on each event, send `overlay:notify` to overlay window with appropriate `eventName` (e.g. "Roshan Killed", "Roshan — may respawn in 3m", "Roshan Alive"), `offsetSeconds: 0`, and a roshan-specific `eventId`
  - [x] `application/src/main/overlayNotifier.spec.ts` — Validates: kill event sends notification with "Roshan Killed"; countdown events send with correct remaining time text; respawn event sends "Roshan Alive"; no notification sent when overlay window null/destroyed; respects dynamic event enabled/notification flags from config

### Persistent Panel Feed

- [x] `application/src/ui/main/MainDock.tsx` — Track roshan GSI state via ref; inject roshan upcoming entry into persistent panel occurrences when roshan is dead (respawn_base/respawn_variable)
  - [x] `application/src/ui/main/MainDock.spec.tsx` — Existing tests pass with onGsiStatusUpdate mock added

### Overlay Preload

- [x] `application/src/main/overlayPreload.ts` — No changes needed; existing channels handle roshan data shape

## Done When
- [x] "Roshan Killed" notification pops up when kill detected <!-- verified 2026-06-17 -->
- [x] Minute-by-minute countdown notifications appear during respawn window <!-- verified 2026-06-17 -->
- [x] "Roshan Alive" notification pops up on confirmed respawn <!-- verified 2026-06-17 -->
- [x] Persistent panel shows Roshan countdown entry while dead, removes on respawn <!-- verified 2026-06-17 -->
- [x] Notifications respect enabled/disabled config per notification type <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
