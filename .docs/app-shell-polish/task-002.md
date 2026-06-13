# Task 002 — Application Menu Bar

## Goal
Add a custom application menu bar with items relevant to the Dota 2 announcer (File, View, Settings, Help), replacing the default Electron menu.

## Prerequisites
- [ ] task-001.md completed

## Tasks

### Main Process

- [ ] `src/main/appMenu.ts` — Create module that exports `buildAppMenu()` returning a `Menu` instance with: File (Reload Config, Separator, Quit), View (Toggle Overlay, Toggle DevTools in dev only), Settings (Reset Close Behavior), Help (User Guide, Separator, About) (new)
  - [ ] `src/main/appMenu.spec.ts` — Test: menu template has correct structure and labels; Reload Config triggers config:reloadEvents; Quit sets isQuitting and calls app.quit; Toggle Overlay sends IPC; Reset Close Behavior clears preference; DevTools item only present when not packaged (new)

- [ ] `src/main/main.ts` — Import and call `Menu.setApplicationMenu(buildAppMenu(...))` in `app.whenReady()`. Pass necessary references (mainWindow getter, overlay toggle, preference reset callback).

### Renderer

- [ ] `src/main/preload.ts` — Expose IPC listener for `menu:openGuide` so Help > User Guide can trigger the guide modal from main process
  - [ ] Verify existing preload exposes needed channels (no new test if trivial bridge)

## Done When
- [ ] App shows File / View / Settings / Help menu bar (not Edit / Window)
- [ ] File > Reload Config reloads events and notifies renderer
- [ ] File > Quit exits the application
- [ ] View > Toggle Overlay shows/hides overlay window
- [ ] View > Toggle DevTools available in dev mode only
- [ ] Settings > Reset Close Behavior clears saved preference
- [ ] Help > User Guide opens the guide modal
- [ ] Help > About shows app version dialog
- [ ] All new and modified tests pass
- [ ] No existing tests broken
