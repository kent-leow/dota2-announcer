# Tray Icon Fix & Custom Event Sounds

## Summary
Fix the system tray icon not displaying correctly after build/install, and add the ability to assign custom audio files to each game event announcement (replacing or supplementing the TTS voice). Ship with a default set of bundled sounds downloaded from free sources for common events (bounty rune coin sound, lotus rune chime, etc.).

## Scope
**In scope**
- Fix tray icon path resolution so it works in packaged/installed builds
- Ensure the `assets/` folder (with PNG icons) is included in the electron-builder output
- Add per-event custom sound file support (upload from local filesystem)
- Provide default bundled sounds for key events (bounty rune, lotus rune, power rune, neutral camp, night/day)
- Sound management UI: preview, upload, remove per event
- Persist sound assignments in app state (userData)
- Play custom sound instead of (or alongside) TTS when assigned

**Out of scope**
- Creating original audio assets (use freely licensed sounds from the internet)
- Sound editor / waveform trimming
- Cloud sync of sounds
- Multiple sound variants per event (rotation/randomization)

## Acceptance Criteria

| **AC1** | Tray icon displays correctly in packaged build |
|---------|------------------------------------------------|
| Given   | The app is built with `npm run build` and installed |
| When    | The user launches the application |
| Then    | The system tray shows the app icon (not blank/default) on Windows and macOS |

| **AC2** | Assets folder included in build output |
|---------|----------------------------------------|
| Given   | The electron-builder config references the assets folder |
| When    | `npm run build` completes |
| Then    | The `assets/` directory with icon files is present in the packaged app |

| **AC3** | Per-event custom sound assignment |
|---------|-----------------------------------|
| Given   | The user is on the event settings panel |
| When    | They click an upload/browse button for a specific event |
| Then    | They can select an audio file which is copied to app data and assigned to that event |

| **AC4** | Default bundled sounds provided |
|---------|--------------------------------|
| Given   | The app is freshly installed with no user customization |
| When    | The user opens the sound settings |
| Then    | Key events (bounty rune, lotus rune, neutral camp, power rune) have pre-assigned default sounds |

| **AC5** | Custom sound playback on event trigger |
|---------|----------------------------------------|
| Given   | An event has a custom sound assigned |
| When    | That event's warning fires during a game |
| Then    | The custom audio file plays at the configured volume instead of TTS |

| **AC6** | Sound preview in settings |
|---------|--------------------------|
| Given   | An event has a sound assigned (default or custom) |
| When    | The user clicks a preview/play button in settings |
| Then    | The sound plays immediately at current volume |

| **AC7** | Remove custom sound |
|---------|---------------------|
| Given   | An event has a user-uploaded custom sound |
| When    | The user clicks remove/reset |
| Then    | The sound assignment reverts to default (or TTS-only if no default exists) |

## Open Questions

| # | Question | Impact if unresolved |
|---|----------|----------------------|
| 1 | Should custom sound play INSTEAD of TTS or WITH TTS (layered)? | Affects audio architecture — defaulting to "instead of" with an optional toggle |
| 2 | Preferred free sound sources (freesound.org, mixkit, pixabay)? | Affects which default sounds ship — will use any CC0/royalty-free source |
| 3 | Max file size limit for uploaded sounds? | Could bloat userData — will default to 2MB cap |

## Estimate
**Story Points**: 21 SP (~42 days)
> raw SP = (7 AC × 2) + 3 OQ = 17, rounded to nearest Fibonacci = 21. 1 SP = 2 days.

## Notes
- The tray icon issue is likely caused by `assets/` not being included in electron-builder `files` array — currently only `dist/**/*` is listed.
- The PNG (1254×1254) is too large for a tray icon; a properly sized PNG (16×16 or 22×22 for macOS template, 16/32/48 for Windows) should be generated at build time or pre-created.
- The app currently uses Web Speech API (`SpeechSynthesisUtterance`) for announcements. Custom sounds will use the HTML5 `Audio` API in the renderer process.
- Sound files should be stored in `app.getPath('userData')/sounds/` for user uploads. Bundled defaults ship in `assets/sounds/`.
- The `AppState` interface in `stateStore.ts` will need extension to track per-event sound assignments.
