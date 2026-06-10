# Task 003 — Wire TTS Announcements to Event Scheduler

## Goal
Connect the event scheduler's announcement callback to the TTS speaker so users hear voice announcements when scheduled events fire during a match.

## Prerequisites
- None (can be done in parallel with task-001/002; wiring works with manual timer start too)

## Tasks

### Announcement Wiring

- [x] `src/ui/main/MainDock.tsx` — register `eventScheduler.onAnnouncement()` with a callback that calls `announcer.speak(announcer.formatMessage(name, offset))`; register on mount, ensure scheduler `tick()` is called on each `gameTimer.onTick`
  - [x] `src/ui/main/MainDock.spec.tsx` — verify onAnnouncement is registered; verify tick calls scheduler; verify speak is called when scheduler fires an event

### Scheduler-Timer Integration

- [x] `src/scheduler/eventScheduler.ts` — ensure `tick()` is idempotent when called with same elapsed value; verify announcements only fire once per fireId (already has dedup, just verify wiring path)
  - [x] `src/scheduler/eventScheduler.spec.ts` — add test: tick triggers announcementCallback with correct name+offset; duplicate tick same ms does not re-fire

### TTS Verification

- [x] `src/tts/announcer.ts` — verify `getSynthesis()` returns a valid `SpeechSynthesis` instance in Electron renderer; add console warning if null so debugging is easier
  - [x] `src/tts/announcer.spec.ts` — speak calls speechSynthesis.speak with formatted utterance; speak no-ops when muted; speak no-ops when getSynthesis returns null

## Done When
- [x] When game timer ticks past a scheduled event warning time, `announcer.speak()` is called <!-- verified 2026-06-10 -->
- [x] User hears spoken announcement (e.g., "Bounty Rune in 30 seconds") during active match <!-- verified 2026-06-10 -->
- [x] No duplicate announcements for the same event+offset in one cycle <!-- verified 2026-06-10 -->
- [x] Muting prevents speech; unmuting resumes future announcements <!-- verified 2026-06-10 -->
- [x] All new and modified tests pass <!-- verified 2026-06-10 -->
- [x] No existing tests broken <!-- verified 2026-06-10 -->
