# Task 005 — Settings UI for Overlay Mode & Event Count

## Goal
Add UI controls to the settings panel for selecting overlay mode and configuring the number of events shown in persistent mode. Verified by toggling mode in settings and seeing the overlay switch behavior, and adjusting N to see the persistent panel update.

## Prerequisites
- [x] task-001.md completed
- [x] task-004.md completed

## Tasks

### Settings UI

- [x] `src/ui/settings/TimingConfig.tsx` — Add radio buttons for overlay mode selection (notification / persistent); add number input or slider for event count (1–10, default 5, only enabled when persistent mode selected); wire to IPC `overlay:setMode` and `overlay:setEventCount`
  - [x] `src/ui/settings/TimingConfig.spec.tsx` — Test mode radio buttons render and call setMode on change; test event count control renders and calls setEventCount; test event count control disabled in notification mode; test initial values loaded from IPC (new)

### Main Renderer Preload

- [x] `src/renderer/preload.ts` — Expose `api.getOverlayMode()`, `api.setOverlayMode()`, `api.getOverlayEventCount()`, `api.setOverlayEventCount()` if not already available via existing pattern
  - [x] `src/renderer/preload.spec.ts` — Test exposed methods invoke correct IPC channels

## Done When
- [x] User can select "Notification" or "Persistent" mode in settings <!-- verified 2026-06-14 -->
- [x] User can set event count (1–10) for persistent mode <!-- verified 2026-06-14 -->
- [x] Event count control disabled/hidden when notification mode is selected <!-- verified 2026-06-14 -->
- [x] Settings persist across app restarts <!-- verified 2026-06-14 -->
- [x] Changing mode immediately switches overlay behavior <!-- verified 2026-06-14 -->
- [x] All new and modified tests pass <!-- verified 2026-06-14 -->
- [x] No existing tests broken <!-- verified 2026-06-14 -->
