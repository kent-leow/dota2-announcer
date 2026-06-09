# Core Dota 2 Voice Timer App

## Summary

Build a lightweight Windows desktop app that auto-detects when Dota 2 is running, tracks in-game elapsed time, and uses TTS to announce configurable game events (runes, lotus pools, Roshan, day/night cycle, etc.) with timed warnings. Events are fully defined via JSON config so future Dota patches only need config changes — no code updates required.

## Scope

**In scope**
- Window detection and auto-start/timer reset on match end
- In-game elapsed time tracking (GameTimer)
- Event scheduler that fires TTS at configured warning offsets
- Config system: read/write events.json with one-time + repeating events, multiple warnings per event
- Windows Speech API integration (TTS) for announcements
- Deduplication guard so each warning fires exactly once
- Main UI: game timer display, upcoming events list, controls (mute/volume/start-stop/reload config)
- Configurable global hotkeys (mute + reload config defaults)
- Build instructions and Windows executable

**Out of scope**
- Unit / integration tests
- CI/CD pipelines
- Online patch-syncing for event configs
- Overlay mode or transparent window
- Mac/Linux support
- Cloud services, authentication, telemetry

## Acceptance Criteria

| **AC1** | Game process auto-detection and lifecycle control |
|---------|----|
| Given | Dota 2 is not running (no dota2.exe) |
| When | a match starts / ends |
| Then | the app detects it without user action and starts / stops/restarts its game timer accordingly |

| **AC2** | Game time display updates correctly every second |
|---------|----|
| Given | Dota 2 is running and detected in a match phase |
| When | at least 1 second has elapsed since the last update |
| Then | the displayed game clock increments by exactly one second (00:00 → 00:01 → …) and matches actual elapsed time |

| **AC3** | Events are loaded from JSON on startup and after reload |
|---------|----|
| Given | config/events.json exists with a valid events array |
| When | the app starts, or the user triggers Reload Config |
| Then | all configured one-time and repeating events become part of the active schedule |

| **AC4** | One-time event fires at its spawn time (±1 s tolerance) |
|---------|----|
| Given | an event with no `repeatEvery` field in config/events.json |
| When | the game clock reaches that event's `spawnTime` |
| Then | exactly one TTS warning is spoken once it has been announced and no additional announcements fire for this spawn phase |

| **AC5** | Repeating events fire repeatedly at correct intervals with multiple warnings each |
|---------|----|
| Given | an event that appears every `repeatEvery` seconds starting after `firstOccurrence` in config/events.json. The event defines `[60, 30]`. |
| When | the game clock reaches first occurrence (= `firstOccurrence`, then at every multiple of `repeatEvery`) and each warning offset from that spawn time |
| Then | TTS announces once per offset (in descending order); if `warnings: [60,30]` it speaks "… 60 seconds" then "… 30 seconds". No second announcement for the same event+offset during one cycle before speaking each warning. If an event defines a single warning `[15]`, exactly that fires once per occurrence |

| **AC6** | All required Dota 2 objects are included as defaults |
|---------|----|
| Given | the application is using built-in default events.json |
| When | it loads config on startup |
| Then | all of these are present (with standard timings unless stated otherwise by Dota 2 wiki patches): Bounty Rune, Water Rune, Power Rune, Wisdom Rune; Lotus Pool; First Night & Subsequent Day/Night Transitions; Neutral Camps Phase I , Neutral Camps Phase II; Tormentor Spawn; Roshan Reminder Timings |

| **AC7** | TTS announcements are clean and deduplicated |
|---------|----|
| Given | an event is scheduled at game time `X` with warning offsets `[60, 30]` |
| When | the scheduler triggers both offsets as the clock passes them. No other component speaks during this window. |
| Then | exactly one message per offset (e.g., "Roshan in 60 seconds," then later "Roshan in 30 seconds"); a duplicate at the same millisecond is suppressed by dedup guard |

| **AC8** | Main UI shows real-time game status and upcoming events |
|---------|----|
| Given | the app is running with Dota 2 detected (or idle) |
| When | the main screen renders / refreshes |
| Then | it displays: Dota 2 match state, current game clock formatted as `MM:SS`, and a list of upcoming events ordered by nearest spawn time. No stale or missing fields appear when both states change rapidly between "In Match" ↔ "Idle". |

| **AC9** | UI controls operate correctly per user preference |
|---------|----|
| Given | the main screen is displayed with active events scheduled |
| When | User clicks mute (toggles on/off), adjusts the volume slider, toggles Start/Stop announcer or Reload config button. They are all accessible as buttons and/or sliders in the UI. Once set, should they persist across app restarts? |
| Then | Muting silences all TTS; unmuting restores sound Volume changes (0-100%) are reflected immediately without requiring a reload Start/Stop announcer pauses/resumes scheduled TTS at once Reload config reads and applies the latest from disk without crashing. No duplicate announcements should fire during reloading. If user sets volume to 0% or clicks Mute button, all future events will be silenced unless unmuted later after clicking unmuting |

| **AC10** | Global hotkeys execute their actions reliably regardless of window focus |
|---------|----|
| Given | the app is running (whether it's in foreground or background) |
| When | User presses Ctrl+Shift+M and then releases those buttons together, immediately after which user types `Ctrl+Shift+R` on release. |
| Then | Mute toggles exactly once per press pair, Reload config executes reloading configuration; neither action fires twice from the same keypress event sequence (no double-firing happens when both are pressed close enough in time). It does no affect events already queued but not yet fired until after loading its own next scheduled update by that way |

## Open Questions
- Default configs need community review for accuracy of timings. I'll assume standard values from official Dota 2 wiki but should verify them before shipping defaults. 
- Outpost event timing varies drastically depending on whether or if any patches introduce new mechanics about where outposts are located around map edges, so I'm skipping those since they depend heavily patch-specific state anyway

## Estimate
**Story Points**: 5 SP (~10 days)
> raw SP = (AC rows × 2) + Open Question rows (min 1), rounded to nearest Fibonacci. 1 SP = 2 days.

## Notes
- The electron/Tauri tradeoff is noted but not decided at this point in the plan stage — that choice will be made before actual coding begins as an open question.
- Heavy emphasis on JSON config so future patches just need updates without touching codebase directly except possibly adding new types of event objects dynamically which may require extending parsing logic down below; nothing too complicated here since json structure is straightforward per itself already

## Changelog

