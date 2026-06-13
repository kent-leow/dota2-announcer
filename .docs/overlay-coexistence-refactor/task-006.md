# Task 006 — MainDock Integration & Auto-Reload

## Goal
Update MainDock to drive both overlays simultaneously — send notifications and upcoming events based on each overlay's enabled state. Ensure config changes auto-apply to the running scheduler. Verify end-to-end overlay behaviour during a match.

## Prerequisites
- [ ] task-004.md completed
- [ ] task-005.md completed

## Tasks

### MainDock Overlay Dispatch

- [ ] `src/ui/main/MainDock.tsx` — on each game tick: if notification overlay enabled, send announcements via `overlay:announcement`; if persistent overlay enabled, send upcoming events via `overlay:sendUpcoming`. Both can fire simultaneously. Read per-overlay enabled state from IPC on mount and on config change events.
  - [ ] `src/ui/main/MainDock.spec.tsx` — test: both IPC sends fire when both enabled; only notification IPC when persistent disabled; only upcoming IPC when notification disabled; neither when both disabled

### Auto-Reload Scheduler

- [ ] `src/ui/main/MainDock.tsx` — listen for `config:changed` event (or equivalent); when received, re-fetch events and reinitialise scheduler without manual reload
  - [ ] `src/ui/main/MainDock.spec.tsx` — test: scheduler reinitialises when config change event fires

### Overlay Show/Hide Lifecycle

- [ ] `src/main/overlayWindow.ts` — show overlay window when at least one overlay is enabled and match is active; hide when both disabled or match ends
  - [ ] `src/main/overlayWindow.spec.ts` — test: window shown when either overlay enabled during match; hidden when both disabled; hidden on match end

## Done When
- [ ] Both overlays receive data simultaneously when both enabled
- [ ] Disabling one overlay stops its data feed without affecting the other
- [ ] Config changes in settings auto-apply to running scheduler
- [ ] Overlay window lifecycle matches overlay enabled states
- [ ] All new and modified tests pass
- [ ] No existing tests broken
