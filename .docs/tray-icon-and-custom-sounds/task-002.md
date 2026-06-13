# Task 002 — Sound Store & IPC Layer

## Goal
Backend infrastructure for per-event sound assignments: persistent storage, file copy on upload, and IPC handlers callable from renderer — verifiable by invoking IPC handlers in tests.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Data Model

- [x] `src/tts/soundStore.ts` — Create sound assignment store: read/write `sounds.json` in userData with schema `{ [eventId]: { type: 'bundled' | 'custom', filename: string } }` (new)
  - [x] `src/tts/soundStore.spec.ts` — Test read/write/delete sound assignments, default state, file-not-found resilience (new)

### File Management

- [x] `src/tts/soundFileManager.ts` — Create helper: copy uploaded file to `userData/sounds/`, validate extension (mp3/wav/ogg), enforce 2MB size limit, delete sound file on remove (new)
  - [x] `src/tts/soundFileManager.spec.ts` — Test copy, size rejection, invalid extension rejection, delete, path resolution (new)

### IPC Handlers

- [x] `src/main/ipcHandlers.ts` — Add `sound:getAssignments` handler returning all event→sound mappings
- [x] `src/main/ipcHandlers.ts` — Add `sound:assign` handler: accept eventId + filePath, copy via soundFileManager, persist via soundStore
- [x] `src/main/ipcHandlers.ts` — Add `sound:remove` handler: accept eventId, delete file, remove from store
- [x] `src/main/ipcHandlers.ts` — Add `sound:getFilePath` handler: resolve full path for a given eventId's sound (bundled or custom)
- [x] `src/main/ipcHandlers.ts` — Add `sound:openFileDialog` handler: open native file dialog filtered to audio files, return selected path
  - [x] `src/tts/soundStore.spec.ts` + `src/tts/soundFileManager.spec.ts` — Cover IPC handler logic via unit tests on store/fileManager

### Preload & Types

- [x] `src/main/preload.ts` — Expose new sound IPC methods to renderer
- [x] `src/renderer/electron.d.ts` — Add TypeScript declarations for new sound API methods

## Done When
- [x] `sound:getAssignments` returns empty object on fresh install <!-- verified 2026-06-13 -->
- [x] `sound:assign` copies file to userData/sounds/ and persists mapping <!-- verified 2026-06-13 -->
- [x] `sound:remove` deletes file and clears mapping <!-- verified 2026-06-13 -->
- [x] Files > 2MB rejected with error <!-- verified 2026-06-13 -->
- [x] Non-audio extensions rejected <!-- verified 2026-06-13 -->
- [x] All new and modified tests pass <!-- verified 2026-06-13 -->
- [x] No existing tests broken <!-- verified 2026-06-13 -->
