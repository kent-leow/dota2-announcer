# Task 002 — Application Menu Bar

## Goal
Add a custom application menu bar with items relevant to the Dota 2 announcer (File, View, Settings, Help), replacing the default Electron menu.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Main Process

- [x] `src/main/appMenu.ts` — Create module that exports `buildAppMenu()` returning a `Menu` instance with: File (Reload Config, Separator, Quit), View (Toggle Overlay, Toggle DevTools in dev only), Settings (Reset Close Behavior), Help (User Guide, Separator, About) (new)
  - [x] `src/main/appMenu.spec.ts` — Test: menu template has correct structure and labels; Reload Config triggers config:reloadEvents; Quit sets isQuitting and calls app.quit; Toggle Overlay sends IPC; Reset Close Behavior clears preference; DevTools item only present when not packaged (new)

- [x] `src/main/main.ts` — Import and call `Menu.setApplicationMenu(buildAppMenu(...))` in `app.whenReady()`. Pass necessary references (mainWindow getter, overlay toggle, preference reset callback).

### Renderer

- [x] `src/main/preload.ts` — Expose IPC listener for `menu:openGuide` so Help > User Guide can trigger the guide modal from main process
  - [x] Verify existing preload exposes needed channels (no new test if trivial bridge)

## Done When
- [x] App shows File / View / Settings / Help menu bar (not Edit / Window) <!-- verified 2026-06-14 -->
- [x] File > Reload Config reloads events and notifies renderer <!-- verified 2026-06-14 -->
- [x] File > Quit exits the application <!-- verified 2026-06-14 -->
- [x] View > Toggle Overlay shows/hides overlay window <!-- verified 2026-06-14 -->
- [x] View > Toggle DevTools available in dev mode only <!-- verified 2026-06-14 -->
- [x] Settings > Reset Close Behavior clears saved preference <!-- verified 2026-06-14 -->
- [x] Help > User Guide opens the guide modal <!-- verified 2026-06-14 -->
- [x] Help > About shows app version dialog <!-- verified 2026-06-14 -->
- [x] All new and modified tests pass <!-- verified 2026-06-14 -->
- [x] No existing tests broken <!-- verified 2026-06-14 -->
