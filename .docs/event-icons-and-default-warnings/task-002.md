# Task 002 — Icon Display in All Surfaces

## Goal
Render event icons (or placeholder) in the notification overlay, persistent panel, and main page upcoming events list. Verifiable by starting a game and seeing icons next to event names in all three surfaces.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Scheduler Types (icon propagation)

- [x] `application/src/scheduler/eventSchedulerTypes.ts` — Add optional `icon?: string` to `ScheduledFire`, `UpcomingEvent`, and `UpcomingOccurrence` interfaces
- [x] `application/src/scheduler/eventScheduler.ts` — Propagate `icon` from loaded event config when building scheduled fires and upcoming lists
  - [x] `application/src/scheduler/eventScheduler.spec.ts` — Scheduled fires include icon from event config; upcoming events include icon; events without icon field produce undefined

### Overlay Notification

- [x] `application/src/overlay/NotificationCard.tsx` — Add `icon?: string` prop; render 24x24 `<img>` with icon src (or placeholder data URI) to the left of event name
  - [x] `application/src/overlay/NotificationCard.spec.tsx` — Renders img with custom icon src; renders placeholder when icon is undefined; img has correct dimensions via style/class

### Persistent Panel

- [x] `application/src/overlay/PersistentPanel.tsx` — Add `icon` to `OccurrenceItem` interface; render 20x20 icon to the left of event name in each row
  - [x] `application/src/overlay/PersistentPanel.spec.tsx` — Renders icon for each occurrence; falls back to placeholder for missing icon

### Main Page Upcoming Events

- [x] `application/src/ui/main/UpcomingEvents.tsx` — Add `icon` to event display; render 16x16 icon before event name in each row
  - [x] `application/src/ui/main/UpcomingEvents.spec.tsx` — Renders icon img for events with icon; renders placeholder for events without icon

### IPC & Overlay Bridge

- [x] `application/src/main/overlayNotifier.ts` — Include `icon` field in `overlay:notify` payload
- [x] `application/src/main/ipcHandlers.ts` — Include `icon` in `overlay:sendUpcoming` occurrence payloads (pass-through, no logic change)
  - [x] `application/src/main/overlayNotifier.spec.ts` — Notification payload includes icon field from announcement callback

### Overlay CSS

- [x] `application/src/overlay/overlay.css` — Add styles for icon containers in notification card and persistent panel (sizing, border-radius, alignment)

## Done When
- [x] Notification overlay card shows event icon (24x24) to the left of event name <!-- verified 2026-06-17 -->
- [x] Persistent panel rows show event icon (20x20) to the left of event name <!-- verified 2026-06-17 -->
- [x] Main page upcoming events show event icon (16x16) to the left of event name <!-- verified 2026-06-17 -->
- [x] Missing/undefined icon falls back to placeholder in all three surfaces <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
