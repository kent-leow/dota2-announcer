# Task 001 — State, IPC & Mode Switching Infrastructure

## Goal
Add overlay mode state (`notification` | `persistent`) and event count (N) to the app state, expose IPC channels to get/set them, and broadcast mode changes to the overlay window. Verified by toggling mode via IPC and confirming the overlay renderer receives the update.

## Prerequisites
- None

## Tasks

### State Layer

- [x] `src/tts/stateStore.ts` — Add `overlayMode: 'notification' | 'persistent'` (default `'notification'`) and `overlayEventCount: number` (default `5`) to AppState interface and defaults
  - [x] `src/tts/stateStore.spec.ts` — Test default values returned; test get/set round-trip for both new fields

### IPC Layer

- [x] `src/main/ipcHandlers.ts` — Add handlers: `overlay:getMode`, `overlay:setMode`, `overlay:getEventCount`, `overlay:setEventCount`; setters broadcast to overlay window
  - [x] `src/main/ipcHandlers.spec.ts` — Test each handler returns correct value; test setMode/setEventCount broadcasts IPC to overlay webContents

### Preload Layer

- [x] `src/main/overlayPreload.ts` — Expose `overlayAPI.getMode()`, `overlayAPI.onModeChange(cb)`, `overlayAPI.getEventCount()`, `overlayAPI.onEventCountChange(cb)` via context bridge
  - [x] `src/main/overlayPreload.spec.ts` — Test that exposed API methods invoke correct ipcRenderer channels

## Done When
- [x] `overlayMode` and `overlayEventCount` persist in app-state.json across restarts <!-- verified 2026-06-14 -->
- [x] Calling `overlay:setMode('persistent')` from main causes overlay renderer to receive mode change event <!-- verified 2026-06-14 -->
- [x] Calling `overlay:setEventCount(3)` from main causes overlay renderer to receive event count change event <!-- verified 2026-06-14 -->
- [x] All new and modified tests pass <!-- verified 2026-06-14 -->
- [x] No existing tests broken <!-- verified 2026-06-14 -->
