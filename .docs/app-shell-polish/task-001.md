# Task 001 — Fix Events Config Persistence to userData

## Goal
Move events.json storage from app resources to `app.getPath('userData')` so user customizations survive app updates and asar packaging. On first run, copy bundled defaults to userData.

## Prerequisites
- None

## Tasks

### Config Layer

- [x] `src/config/eventsLoader.ts` — Change `getConfigPath()` to return `path.resolve(app.getPath('userData'), 'config', 'events.json')` when packaged. Add a `getBundledConfigPath()` that points to `app.getAppPath()/config/events.json` for reading defaults.
  - [x] `src/config/eventsLoader.spec.ts` — Test: getConfigPath returns userData-based path when app.isPackaged; loadEvents copies bundled defaults on first run; loadEvents reads existing userData file; saveEvents writes to userData path

- [x] `src/config/eventsLoader.ts` — Add first-run migration in `loadEvents()`: if userData config doesn't exist, copy from bundled path, then load from userData.

### Main Process

- [x] `src/main/ipcHandlers.ts` — Verify `gsi:install` still reads the bundled `.cfg` file from `app.getAppPath()` (no change needed, but confirm path is independent of eventsLoader change)

## Done When
- [x] Running packaged app writes events.json to `%APPDATA%/<app-name>/config/events.json` (not inside resources) <!-- verified 2026-06-14 -->
- [x] First launch with no existing userData config copies bundled defaults <!-- verified 2026-06-14 -->
- [x] Existing userData config is preserved across app reinstall <!-- verified 2026-06-14 -->
- [x] All new and modified tests pass <!-- verified 2026-06-14 -->
- [x] No existing tests broken <!-- verified 2026-06-14 -->
