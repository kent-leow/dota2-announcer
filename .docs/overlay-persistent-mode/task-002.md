# Task 002 — Notification Mode Dynamic Countdown

## Goal
Enhance the existing notification mode so the "in Xs" text counts down live every second instead of displaying a static offset. Verified by observing a notification card's timer decrement in real-time while on screen.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Main Process — Game Time Broadcast

- [x] `src/main/overlayNotifier.ts` — On each game timer tick, send `overlay:tick` IPC with current elapsed game time (ms) to overlay window; also include `happenTimeMs` (spawnTime in ms) in the `overlay:notify` payload alongside existing `offsetSeconds`
  - [x] `src/main/overlayNotifier.spec.ts` — Test that `overlay:tick` is sent on each tick; test `overlay:notify` payload includes `happenTimeMs`

### Preload Layer

- [x] `src/main/overlayPreload.ts` — Expose `overlayAPI.onTick(cb)` to receive elapsed game time updates
  - [x] `src/main/overlayPreload.spec.ts` — Test onTick listener registration and callback invocation

### Overlay Renderer — Live Countdown

- [x] `src/overlay/NotificationStack.tsx` — Subscribe to `overlayAPI.onTick()`; pass current game time to each NotificationCard; store `happenTimeMs` from notification payload
  - [x] `src/overlay/NotificationStack.spec.tsx` — Test that tick updates propagate to children; test happenTimeMs stored from notification event

- [x] `src/overlay/NotificationCard.tsx` — Replace static `formatOffset(offsetSeconds)` with dynamic computation: `remainingSeconds = Math.max(0, Math.ceil((happenTimeMs - currentGameTimeMs) / 1000))`; display "now" when 0, else "in {remainingSeconds}s"
  - [x] `src/overlay/NotificationCard.spec.tsx` — Test countdown decrements as game time advances; test displays "now" at 0; test never shows negative

## Done When
- [x] Notification card timer text counts down from initial offset to "now" while card is visible <!-- verified 2026-06-14 -->
- [x] Countdown targets happen time, not warning time <!-- verified 2026-06-14 -->
- [x] Existing fade-in/visible/fade-out lifecycle unchanged <!-- verified 2026-06-14 -->
- [x] Warning sounds still fire at correct times (no regression) <!-- verified 2026-06-14 -->
- [x] All new and modified tests pass <!-- verified 2026-06-14 -->
- [x] No existing tests broken <!-- verified 2026-06-14 -->
