# GSI Match Detection, TTS Fix & Scrollbar Theming

## Summary

Fix three critical issues preventing the app from functioning correctly: (1) replace the naive process-detection approach with Dota 2 Game State Integration (GSI) so the timer only starts at actual game clock 0:00, (2) wire the event scheduler's announcements to the TTS engine so users actually hear voice announcements, and (3) style the scrollbar to match the Dota 2 dark theme.

## Scope

**In scope**
- Dota 2 GSI HTTP server that receives game state payloads from the Dota 2 client
- GSI configuration file installer/guide for the user's Dota 2 directory
- Match lifecycle detection: distinguish between client running, hero selection, and game clock active
- Timer sync: start the game timer at 0:00 based on GSI clock data (not process detection)
- Wire `eventScheduler.onAnnouncement()` callback to `announcer.speak()` so TTS fires
- Verify the full announcement pipeline: scheduler tick → announcement callback → speech synthesis
- Custom scrollbar CSS that matches the Dota 2 dark theme (dark track, gold/amber thumb)

**Out of scope**
- Removing process detection entirely (can keep as fallback)
- Overlay mode or in-game HUD integration
- Custom voice packs or audio file playback (still uses Web Speech API)
- Mac/Linux support for GSI paths

## Acceptance Criteria

| **AC1** | Timer starts only when the actual Dota 2 game clock begins |
|---------|----|
| Given | Dota 2 is running and the user is in hero selection or menus |
| When | the game transitions to the active game phase (clock starts at 0:00) |
| Then | the app's game timer starts; it does NOT start when the Dota 2 process launches or during draft |

| **AC2** | GSI server receives and parses game state from Dota 2 client |
|---------|----|
| Given | a valid GSI config file is installed in the Dota 2 game directory |
| When | Dota 2 sends a game state payload via HTTP POST |
| Then | the app parses the clock time, match state, and game phase correctly |

| **AC3** | Timer resets on match end |
|---------|----|
| Given | the game timer is running during an active match |
| When | the match ends (ancient destroyed, disconnect, or player abandons) |
| Then | the timer stops and resets to 00:00, scheduler clears fired state |

| **AC4** | TTS announcements are audible during a running match |
|---------|----|
| Given | the app is running, not muted, volume > 0, and a match is in progress |
| When | the game clock reaches a scheduled event warning time |
| Then | the user hears a spoken announcement via the system speech synthesis |

| **AC5** | Announcement wiring is complete from scheduler to speaker |
|---------|----|
| Given | `eventScheduler.onAnnouncement` callback is registered |
| When | `eventScheduler.tick()` fires a pending announcement |
| Then | `announcer.speak()` is called with the formatted message |

| **AC6** | Scrollbar matches the Dota 2 dark theme |
|---------|----|
| Given | the upcoming events list or any scrollable area overflows |
| When | the user views the scrollbar |
| Then | the scrollbar track is dark (matching app background), the thumb is gold/amber, and it blends with the overall UI aesthetic |

## Resolved Decisions
- **GSI port**: Default to 3001 (no UI config needed for now)
- **GSI config install**: Manual setup — app provides instructions/guide, user places the config file themselves
- **TTS approach**: Fix the existing Web Speech API wiring first; if it still produces no audio, switch to a native TTS module in the main process

## Estimate
**Story Points**: 13 SP (~26 days)
> raw SP = (AC rows 6 × 2) + 0 = 12, rounded to nearest Fibonacci = 13. 1 SP = 2 days.

## Notes
- Dota 2 Game State Integration works by placing a `.cfg` file in `steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration/`. Dota 2 then POSTs JSON to the configured HTTP endpoint whenever game state changes.
- Key GSI fields: `map.clock_time` (game clock in seconds), `map.game_state` (e.g., `DOTA_GAMERULES_STATE_GAME_IN_PROGRESS`), `map.matchid`
- The current `processDetector.ts` only checks if `dota2.exe` is running — it cannot distinguish menus from active gameplay
- The TTS bug is a wiring issue: `eventScheduler.onAnnouncement()` is never called with a callback that invokes `announcer.speak()`, so all scheduled events fire silently
- Scrollbar styling uses `::-webkit-scrollbar` pseudo-elements which work in Electron's Chromium renderer

## Changelog
- 2026-06-10: Resolved all 3 open questions — GSI port defaults to 3001, manual config setup, fix Web Speech API wiring first then fallback to native TTS if needed
