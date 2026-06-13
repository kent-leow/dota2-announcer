# Task 001 — Remove Sound/Music Playback

## Goal
Remove all music and sound effect playback infrastructure — files, state, IPC handlers, and UI — leaving only TTS (announcer) as audio output. Verify no sound-related code remains active.

## Prerequisites
- None

## Tasks

### Audio Layer

- [ ] `src/tts/soundPlayer.ts` — delete entire file (sound effect playback module)
- [ ] `src/tts/soundFileManager.ts` — delete entire file (sound file copy/validate/path logic)
- [ ] `src/tts/stateStore.ts` — remove `soundDisabled: Record<string, boolean>` from AppState interface and defaults
  - [ ] `src/tts/stateStore.spec.ts` — verify state shape no longer includes soundDisabled

### IPC Layer

- [ ] `src/main/ipcHandlers.ts` — remove all `sound:*` IPC handlers (`sound:getAssignments`, `sound:assign`, `sound:remove`, `sound:getFilePath`, `sound:openFileDialog`, `sound:getDisabled`, `sound:setDisabled`)
  - [ ] `src/main/ipcHandlers.spec.ts` — remove tests for deleted sound handlers; verify remaining handlers still pass

### Preload Layer

- [ ] `src/main/preload.ts` — remove sound-related methods from electronAPI bridge (sound assignments, sound file dialog, sound disabled getters/setters)
  - [ ] `src/main/preload.spec.ts` — verify preload no longer exposes sound methods

### Main Page

- [ ] `src/ui/main/MainDock.tsx` — remove sound playback from `onAnnouncement` callback; keep only TTS `speak()` call. Remove soundPlayer imports/references.
  - [ ] `src/ui/main/MainDock.spec.tsx` — verify announcement triggers TTS only; no sound file playback tested

### Settings UI

- [ ] `src/ui/settings/TimingConfig.tsx` — remove sound assignment UI controls (per-event sound file picker, sound toggle per event)
  - [ ] `src/ui/settings/TimingConfig.spec.tsx` — verify no sound-related controls rendered

## Done When
- [ ] App builds with no references to soundPlayer or soundFileManager
- [ ] Event announcements produce only TTS speech, no audio file playback
- [ ] Settings UI has no sound/music configuration controls
- [ ] All new and modified tests pass
- [ ] No existing tests broken
