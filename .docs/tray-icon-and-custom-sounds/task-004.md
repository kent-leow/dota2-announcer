# Task 004 — Sound Playback Integration

## Goal
When an event fires and has a sound assigned, play the audio file instead of TTS — verifiable by assigning a sound to an event and hearing it play on trigger during a game.

## Prerequisites
- [x] task-003.md completed

## Tasks

### Audio Player

- [x] `src/tts/soundPlayer.ts` — Create renderer-side audio player: `playSound(filePath, volume)` using HTML5 Audio API, respects mute state, stops previous sound if overlapping (new)
  - [x] `src/tts/soundPlayer.spec.ts` — Test play, stop, volume application, mute respect, file-not-found handling (new)

### Announcement Hook

- [x] `src/ui/main/MainDock.tsx` — Modify announcement callback: before calling TTS `speak()`, check if event has a sound assigned; if yes, call `playSound()` instead
  - [x] `src/ui/main/MainDock.spec.tsx` — Test that announcement with sound skips TTS and plays audio; announcement without sound still uses TTS

### Event ID Propagation

- [x] `src/scheduler/eventSchedulerTypes.ts` — `AnnouncementCallback` signature now passes `eventId` as third parameter
- [x] `src/scheduler/eventScheduler.ts` — Pass `eventId` to announcement callback
  - [x] `src/scheduler/eventScheduler.spec.ts` — Test callback receives eventId

## Done When
- [x] Events with assigned sounds play audio file on trigger <!-- verified 2026-06-13 -->
- [x] Events without assigned sounds still use TTS as before <!-- verified 2026-06-13 -->
- [x] Sound respects volume and mute settings <!-- verified 2026-06-13 -->
- [x] No overlapping sounds (previous stops when new fires) <!-- verified 2026-06-13 -->
- [x] All new and modified tests pass <!-- verified 2026-06-13 -->
- [x] No existing tests broken <!-- verified 2026-06-13 -->
