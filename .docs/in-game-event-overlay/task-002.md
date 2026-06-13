# Task 002 — Notification IPC and Event Bridge

## Goal
Wire the event scheduler's announcement callback to send notification payloads to the overlay window via IPC. Verifiable by confirming the overlay renderer receives event data when an announcement fires.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Main Process

- [x] `src/main/overlayNotifier.ts` — module that subscribes to the announcement callback and sends `overlay:notify` event to the overlay window's webContents with payload `{ eventName, offsetSeconds, eventId, timestamp }` (new)
  - Only sends if overlay window exists and is not destroyed
  - [x] `src/main/overlayNotifier.spec.ts` — test: fires IPC message on announcement; does not throw if overlay destroyed; payload shape correct

- [x] `src/main/ipcHandlers.ts` — import and initialise `overlayNotifier` after overlay window is available (pass getter for overlay window)

### Overlay Preload

- [x] `src/main/overlayPreload.ts` — expose `onNotification(callback)` that listens to `overlay:notify` channel and returns unsubscribe function

### Overlay Renderer

- [x] `src/overlay/electron.d.ts` — type declaration for `window.overlayAPI.onNotification` (new)

## Done When
- [x] When an event fires during a match, the overlay renderer's `onNotification` callback is invoked with correct payload <!-- verified 2026-06-13 -->
- [x] No message sent when overlay is hidden/destroyed <!-- verified 2026-06-13 -->
- [x] All new and modified tests pass <!-- verified 2026-06-13 -->
- [x] No existing tests broken <!-- verified 2026-06-13 -->
