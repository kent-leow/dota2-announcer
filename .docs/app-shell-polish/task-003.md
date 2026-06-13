# Task 003 — Close-to-Tray Confirmation Dialog

## Goal
When the user clicks the window X button, show a native dialog asking whether to minimize to tray or quit entirely, with a "don't ask me again" checkbox. Persist the choice in userData preferences.json.

## Prerequisites
- [x] task-001.md completed (userData path pattern established)

## Tasks

### Preferences Layer

- [x] `src/config/preferences.ts` — Create module: `loadPreferences()`, `savePreferences()`, `resetClosePreference()`. Schema: `{ closeBehavior: 'ask' | 'minimize' | 'quit' }`. Stored at `app.getPath('userData')/preferences.json`. Default: `{ closeBehavior: 'ask' }`. (new)
  - [x] `src/config/preferences.spec.ts` — Test: loadPreferences returns default when file missing; savePreferences writes to userData; resetClosePreference sets closeBehavior back to 'ask'; loadPreferences reads existing file correctly (new)

### Main Process

- [x] `src/main/main.ts` — Update `mainWindow.on('close')` handler: read preference; if 'ask', show `dialog.showMessageBox` with Minimize/Quit buttons and "Don't ask me again" checkbox; if 'minimize', hide window; if 'quit', allow close. Save preference when checkbox checked.
  - [x] `src/main/main.spec.ts` — Test: close event calls dialog when preference is 'ask'; close event hides window when preference is 'minimize'; close event allows quit when preference is 'quit'; checkbox selection persists preference

### Integration with Menu

- [x] `src/main/appMenu.ts` — Wire Settings > Reset Close Behavior to call `resetClosePreference()` from preferences module (depends on task-002 existing)

## Done When
- [x] Clicking X with preference 'ask' shows native dialog with Minimize/Quit and checkbox <!-- verified 2026-06-14 -->
- [x] Selecting Minimize hides window to tray <!-- verified 2026-06-14 -->
- [x] Selecting Quit exits the application <!-- verified 2026-06-14 -->
- [x] Checking "don't ask me again" persists the choice to preferences.json in userData <!-- verified 2026-06-14 -->
- [x] Preference survives app restart <!-- verified 2026-06-14 -->
- [x] Settings > Reset Close Behavior reverts to showing the dialog <!-- verified 2026-06-14 -->
- [x] All new and modified tests pass <!-- verified 2026-06-14 -->
- [x] No existing tests broken <!-- verified 2026-06-14 -->
