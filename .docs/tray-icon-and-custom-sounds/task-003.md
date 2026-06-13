# Task 003 — Bundle Default Sounds

## Goal
Ship default notification sounds for key events so the app works out-of-the-box without user uploads — verifiable by checking bundled sound files exist and are pre-assigned on fresh install.

## Prerequisites
- [x] task-002.md completed

## Tasks

### Sound Assets

- [x] `assets/sounds/bounty-rune.wav` — Generated coin/gold notification tone (new)
- [x] `assets/sounds/lotus-rune.wav` — Generated bell/chime harmonic (new)
- [x] `assets/sounds/power-rune.wav` — Generated power-up chord (new)
- [x] `assets/sounds/neutral-camp.wav` — Generated low drum-like notification (new)
- [x] `assets/sounds/night.wav` — Generated ominous low tone (new)
- [x] `assets/sounds/water-rune.wav` — Generated water drop high-freq tone (new)
- [x] `assets/sounds/wisdom-rune.wav` — Generated mystical chord (new)

### Default Mappings

- [x] `src/tts/soundStore.ts` — Add `getDefaultSoundMap()` function returning bundled event→filename mappings for events that have sounds in `assets/sounds/`
  - [x] `src/tts/soundStore.spec.ts` — Test defaults returned for known events, absent for events without bundled sounds

### Path Resolution

- [x] `src/tts/soundFileManager.ts` — Add `getBundledSoundPath(filename)` resolving to correct path in both dev and packaged mode
  - [x] `src/tts/soundFileManager.spec.ts` — Test bundled path resolution dev vs packaged

## Done When
- [x] `assets/sounds/` contains audio files for bounty-rune, lotus-rune, power-rune, neutral-camp, night, water-rune, wisdom-rune <!-- verified 2026-06-13 -->
- [x] Each file is < 2MB and plays correctly as audio <!-- verified 2026-06-13 - all under 52KB -->
- [x] `getDefaultSoundMap()` returns mappings for all bundled sounds <!-- verified 2026-06-13 -->
- [x] Bundled sound path resolves correctly in packaged build <!-- verified 2026-06-13 -->
- [x] All new and modified tests pass <!-- verified 2026-06-13 -->
- [x] No existing tests broken <!-- verified 2026-06-13 -->
