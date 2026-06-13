# Task 005 — Sound Management UI

## Goal
Settings panel allows users to see, preview, upload, and remove sounds per event — verifiable by opening settings, previewing a default sound, uploading a custom one, and removing it.

## Prerequisites
- [x] task-004.md completed

## Tasks

### Sound Settings Component

- [x] `src/ui/settings/SoundConfig.tsx` — Create sound management panel: list events with current sound assignment, upload button, preview button, remove button per event (new)
  - [x] `src/ui/settings/SoundConfig.spec.tsx` — Test render with defaults, upload click triggers file dialog, preview plays sound, remove clears assignment (new)

### App Integration

- [x] `src/renderer/App.tsx` — Add "Sounds" tab to header nav, render `SoundConfig` when active

### Preview Playback

- [x] `src/ui/settings/SoundConfig.tsx` — Preview button calls `playSound()` with the resolved file path at current volume

### Upload Flow

- [x] `src/ui/settings/SoundConfig.tsx` — Upload button calls `sound:openFileDialog` IPC, then `sound:assign`, refreshes assignment list on success, shows error on failure (size/format)

### Remove Flow

- [x] `src/ui/settings/SoundConfig.tsx` — Remove/reset button calls `sound:remove` IPC, reverts display to default (or "No sound")

## Done When
- [x] "Sounds" tab visible in app settings <!-- verified 2026-06-13 -->
- [x] Each event shows its current sound (default or custom filename) <!-- verified 2026-06-13 -->
- [x] Preview button plays the assigned sound <!-- verified 2026-06-13 -->
- [x] Upload button opens native file picker, copies file, updates display <!-- verified 2026-06-13 -->
- [x] Files > 2MB or non-audio extensions show error message <!-- verified 2026-06-13 -->
- [x] Remove button clears custom sound, reverts to default <!-- verified 2026-06-13 -->
- [x] All new and modified tests pass <!-- verified 2026-06-13 -->
- [x] No existing tests broken <!-- verified 2026-06-13 -->
