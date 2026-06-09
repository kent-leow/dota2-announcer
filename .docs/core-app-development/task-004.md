# Task 004 — TTS Engine, Mute System & Hotkeys (AC7, AC9, AC10)

## Goal
Synthesize Dota-specific announcements via Windows Speech API with clean text formatting; integrate mute toggle and volume control into main UI controls; wire global hotkeys for mute + reload config. Verified by observing muted/sound audio output, volume slider values reflected back immediately, and hotkey presses producing exactly one action per keypress regardless of window focus — confirmed by reading observable flags in UI state without examining source code.

## Prerequisites
- [x] task-001.md completed (events loaded → scheduler feeds TTS engine via config/events interface) <!-- verified 2026-06-10 -->
- [ ] task-003.md completed (scheduler fires callback tokens consumed here)
- [ ] task-002.md completed (main UI layout from MainDock.tsx available to wire buttons into data layers)

## Tasks

### TTS announcer

- `src/tts/announcer.ts` — new; uses win32 SpeechSynthesis API / Node bindings to speak formatted messages ("Roshan in 60 seconds" → clean Windows TTS text). Exposes `speak(text, priority?)`, `stop()`, `isSpeaking()`.
  - [ ] `src/tts/announcer.spec.ts` — test blocks:
    - Speaks correctly formatted message for a given event name + offset pair (e.g., "Lotus Pool in 60 seconds")
    - stop() halts mid-speech immediately without error or dangling state

### Volume controller

- `src/tts/volumeController.ts` — new; wraps TTS volume adjustment 0–100%; applies live without restart. Tracks persisted value using the same config/state store pattern from task-001 (saved to local JSON on every change, loaded on startup).
  - [ ] `src/tts/volumeController.spec.ts` — test blocks:
    - setVolume(75) is reflected on next getVolume() call with no delay
    - Volume persists across app restart (config save/load round-trip verified in storage file)

### Mute manager

- `src/tts/muteManager.ts` — new; toggles mute state; broadcasts to TTS engine + hotkey layer. Tracks whether app was muted before reload so re-unmute applies correctly after config changes. Persists to same state store as volume controller on every change.
  - [ ] `src/tts/muteManager.spec.ts` — test blocks:
    - Muting silences all future speech (verified by zero speak invocations between mute-on → full game event window)
    - Unmuting restores sound immediately on next scheduler callback tick without requiring reload or restart
    - Reloading config / restarting app preserves the muted flag (no accidental un-mute via any lifecycle change)

### UI controls wireup

- `src/ui/main/MainDock.tsx` — modify; add/reconnect five controls to their data layers: mute toggle button, volume slider (0–100%), Start/Stop announcer, Reload config. Reuses hooks/store initialized in task-002's MainDock foundation for window lifecycle + timer display.
  - [ ] `src/ui/main/MainDock.spec.tsx` — add to existing test file from task-002:
    - Mute toggle button present; clicking toggles the UI state icon/text and sets muted/unmuted flag verified via muteManager's getter (no code inspection needed)
    - Volume slider drag events update value live, showing correct percentage text during interaction (simulated drag delta assertions in spec)
    - Reloading config leaves current game clock + timer display intact; no crash or state loss on reload mid-match

### Hotkey system

- `src/hotkeys/globalHotkeys.ts` — new; registers Ctrl+Shift+M (toggle mute) + Ctrl+Shift+R (reload config) globally via Electron `BrowserWindow.addGlobalShortcut()` and IPC bridge for renderer-side actions. Each keypress produces exactly one action using a debouncer guard (~200ms per hotkey internally) with edge-case handling for combined presses within the debounce window. Unregisters all shortcuts on app quit or process exit handler.
  - [ ] `src/hotkeys/globalHotkeys.spec.ts` — test blocks:
    - Pressing both keys ~50ms apart produces exactly one mute toggle callback + one reload config callback only (no double-fire confirmed by tracking call counts, each equal to 1)
    - Rapid repeated presses within the 200 ms debounce window produce exactly one action per distinct physical press pair
    - When app is background/hidden, keypresses still register and execute their actions verified via muteManager state + scheduler reload flag after each simulated global shortcut input

## Done When
- UI shows working mute toggle (mutes all TTS / unmutes to restore), volume slider updates live showing correct percentage during drag without restart (AC9 satisfied)
- Global hotkeys fire exactly once per keypress regardless of window focus — verified by reading observable flags in UI state + speaker output/mute flag without examining source code (AC10 satisfied)
- All new and modified tests pass
- No existing tests broken
