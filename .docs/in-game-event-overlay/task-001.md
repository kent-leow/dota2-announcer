# Task 001 — Overlay Window (Main Process)

## Goal
Create and manage a transparent, click-through, always-on-top overlay BrowserWindow that the main process shows/hides based on game phase. Verifiable by launching the app and confirming a borderless transparent window appears over other apps when a game starts.

## Prerequisites
- None

## Tasks

### Main Process

- [x] `src/main/overlayWindow.ts` — create module that exports `createOverlayWindow`, `showOverlay`, `hideOverlay`, `destroyOverlay`, `getOverlayWindow` (new)
  - BrowserWindow options: `transparent: true`, `frame: false`, `alwaysOnTop: true`, `skipTaskbar: true`, `resizable: false`, `focusable: false`, `fullscreenable: false`
  - Call `setIgnoreMouseEvents(true)` after creation for click-through
  - Position window at top-right of primary display using `screen.getPrimaryDisplay().workAreaSize`
  - Size: fixed width (~350px), height sufficient for stacking (~600px)
  - Load overlay-specific HTML entry point
  - [x] `src/main/overlayWindow.spec.ts` — test window creation options, show/hide toggle, destroy cleanup

- [x] `src/main/overlayPreload.ts` — minimal preload exposing `onNotification` channel listener via contextBridge (new)
  - [x] (no test needed — pure bridge config)

- [x] `src/main/main.ts` — import overlayWindow module; call `createOverlayWindow` in `app.whenReady`; wire `matchStateManager.onPhaseChange` to show overlay on `in-match` and hide on `idle`
  - [x] `src/main/main.spec.ts` — add tests for overlay lifecycle: created on ready, shown on `in-match` phase, hidden on `idle` phase

### Build Config

- [x] `vite.config.ts` — add overlayPreload entry to vite-plugin-electron array so it builds to `dist/main/overlayPreload.js`

### Overlay Renderer Entry

- [x] `src/overlay/index.html` — minimal HTML shell with transparent body, links overlay CSS and JS entry (new)
- [x] `src/overlay/index.tsx` — React root mount for overlay app (new)
- [x] `src/overlay/index.css` — base styles: `html,body` transparent background, no margin, overflow hidden (new)

## Done When
- [x] Overlay window appears on top of all windows when game phase is `in-match` <!-- verified 2026-06-13 -->
- [x] Overlay window is invisible/hidden when game phase is `idle` <!-- verified 2026-06-13 -->
- [x] Clicks pass through the overlay to applications beneath <!-- verified 2026-06-13 -->
- [x] Overlay does not appear in taskbar <!-- verified 2026-06-13 -->
- [x] All new and modified tests pass <!-- verified 2026-06-13 -->
- [x] No existing tests broken <!-- verified 2026-06-13 -->
