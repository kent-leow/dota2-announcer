# Task 004 — Persistent Overlay Renderer

## Goal
Build the persistent overlay React component that displays N upcoming events with live countdowns to their happen time, auto-removing events when countdown reaches 0. Verified by seeing a permanent panel with live-updating countdowns during a match.

## Prerequisites
- [x] task-001.md completed
- [x] task-002.md completed (reuses onTick infrastructure)
- [x] task-003.md completed

## Tasks

### Main Process — Upcoming Events Broadcast

- [x] `src/main/overlayNotifier.ts` — On each tick (when mode is `persistent`), call `getUpcomingOccurrences(elapsedMs, eventCount)` and send `overlay:upcoming` IPC with the occurrences array to overlay window
  - [x] `src/main/overlayNotifier.spec.ts` — Test `overlay:upcoming` sent on tick in persistent mode; test NOT sent in notification mode; test payload matches scheduler output

### Preload Layer

- [x] `src/main/overlayPreload.ts` — Expose `overlayAPI.onUpcoming(cb)` to receive upcoming occurrences array
  - [x] `src/main/overlayPreload.spec.ts` — Test onUpcoming listener registration and callback invocation

### Overlay Renderer — Persistent Panel

- [x] `src/overlay/PersistentPanel.tsx` — New component; subscribes to `overlayAPI.onUpcoming()` and `overlayAPI.onTick()`; renders a list of upcoming events with live countdown (`happenTimeMs - currentGameTimeMs`); removes entries at countdown ≤ 0; respects configured event count (N); no fade animations (always visible) (new)
  - [x] `src/overlay/PersistentPanel.spec.tsx` — Test renders N events; test countdown updates on tick; test event removed when countdown ≤ 0; test list sorted by nearest time; test empty state when no events (new)

### Overlay Root — Mode Switching

- [x] `src/overlay/index.tsx` — Subscribe to `overlayAPI.getMode()` and `overlayAPI.onModeChange()`; conditionally render `NotificationStack` (notification mode) or `PersistentPanel` (persistent mode)
  - [x] `src/overlay/index.spec.tsx` — Test renders NotificationStack for notification mode; test renders PersistentPanel for persistent mode; test switches on mode change event (new)

### Styling

- [x] `src/overlay/overlay.css` — Add styles for persistent panel: semi-transparent dark background, gold event names, live countdown text, no fade animations, consistent with existing card aesthetic
  - [x] (no separate test — CSS-only)

## Done When
- [x] Persistent overlay shows up to N upcoming events with live countdowns <!-- verified 2026-06-14 -->
- [x] Countdown targets event happen time (not warning time) <!-- verified 2026-06-14 -->
- [x] Events disappear from list when countdown reaches 0 <!-- verified 2026-06-14 -->
- [x] Panel stays visible continuously during match (no popup/fade behavior) <!-- verified 2026-06-14 -->
- [x] Switching to notification mode hides persistent panel and shows popup notifications <!-- verified 2026-06-14 -->
- [x] All new and modified tests pass <!-- verified 2026-06-14 -->
- [x] No existing tests broken <!-- verified 2026-06-14 -->
