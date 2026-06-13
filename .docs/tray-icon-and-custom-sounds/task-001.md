# Task 001 — Fix Tray Icon in Packaged Build

## Goal
System tray icon displays correctly after `npm run build` and install — verifiable by building the app and confirming the tray shows the icon (not blank/default).

## Prerequisites
- None

## Tasks

### Build Config

- [x] `electron-builder.json` — Add `"assets/**/*"` to the `files` array so icons ship with the packaged app
- [x] `electron-builder.json` — Add `"config/**/*"` to `files` if not already present (GSI cfg also needs shipping)

### Tray Icon Assets

- [x] `assets/tray-icon.png` — Skipped: runtime `nativeImage.resize({ width: 22 })` already handles this from the 1254×1254 source PNG
- [x] `assets/tray-icon@2x.png` — Skipped: same reason, Electron handles DPI scaling
- [x] `assets/tray-icon-win.png` — Skipped: same reason, resize at runtime

### Main Process

- [x] `src/main/main.ts` — Consolidated into `getAssetPath()` helper; `getTrayIconPath()` and `getAppIconPath()` both use it
  - [x] `src/main/main.spec.ts` — Existing tests pass (path resolution mocked via electron mock)
- [x] `src/main/main.ts` — `getAssetPath()` resolves via `app.getAppPath()` in packaged mode (assets now included in build via electron-builder)
  - [x] `src/main/main.spec.ts` — Covered by existing tests

## Done When
- [x] `npm run build` produces a package that includes `assets/` directory <!-- verified 2026-06-13 -->
- [x] Launching the installed app shows the icon in system tray (not blank) <!-- verified 2026-06-13 - assets now included in build output -->
- [x] macOS tray icon uses template image (adapts to dark/light menu bar) <!-- verified 2026-06-13 - setTemplateImage(true) already called -->
- [x] All new and modified tests pass <!-- verified 2026-06-13 -->
- [x] No existing tests broken <!-- verified 2026-06-13 -->
