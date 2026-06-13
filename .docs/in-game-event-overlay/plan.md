# In-Game Event Overlay

## Summary
Add a transparent, click-through overlay window that displays event notifications in the top-right corner of the screen while Dota 2 is running. Notifications fade in, remain visible for 5 seconds, then fade out. The overlay is purely visual — it does not intercept mouse input, steal focus, or cause the Dota 2 client to lose foreground status.

## Scope
**In scope**
- A separate overlay window that renders on top of the Dota 2 client
- Overlay is always-on-top, frameless, transparent, and fully click-through
- Event notifications appear in the top-right corner of the primary display
- Each notification fades in, stays for 5 seconds, then fades out
- Multiple concurrent notifications stack vertically
- Overlay activates only when a game is in progress
- Overlay hides when no game is running or app is closed

**Out of scope**
- User interaction with the overlay (by design — unclickable)
- Overlay positioning configuration (fixed top-right only)
- Custom styling/theming of notifications beyond matching current app aesthetic
- Notification history or persistence
- Overlay on secondary monitors

## Acceptance Criteria

| **AC1** | Overlay window properties |
|---------|--------------------------|
| Given | The announcer app is running and a Dota 2 game is in progress |
| When  | The overlay window is created |
| Then  | It is always-on-top, frameless, transparent, and positioned at the top-right of the primary display |

| **AC2** | Click-through behavior |
|---------|------------------------|
| Given | The overlay is visible on screen |
| When  | The user clicks anywhere on the overlay area |
| Then  | The click passes through to the application beneath (Dota 2 remains in foreground) |

| **AC3** | Notification display on event fire |
|---------|-------------------------------------|
| Given | A game event fires (announcement callback triggers) |
| When  | The notification is sent to the overlay |
| Then  | A notification card appears in the top-right showing the event name and countdown context |

| **AC4** | Fade-in and fade-out animation |
|---------|-------------------------------|
| Given | A notification is triggered |
| When  | It appears |
| Then  | It fades in over a short duration, remains fully visible for 5 seconds, then fades out and is removed |

| **AC5** | Multiple notifications stack |
|---------|------------------------------|
| Given | Multiple events fire within a short window |
| When  | Notifications are displayed simultaneously |
| Then  | They stack vertically without overlapping, each with its own independent 5-second timer |

| **AC6** | Overlay lifecycle |
|---------|-------------------|
| Given | A game ends or the app is quit |
| When  | The game phase transitions to idle or the app closes |
| Then  | The overlay window is hidden or destroyed gracefully |

## Open Questions

| # | Question | Impact if unresolved |
|---|----------|----------------------|
| 1 | Should the overlay show all event types (warnings + spawns) or only the same events that trigger TTS? | Determines which events route to the overlay — can default to same events that trigger TTS |
| 2 | On macOS, does the app need accessibility permissions for always-on-top + click-through to work over fullscreen games? | May require documentation or a setup step for macOS users |

## Estimate
**Story Points**: 8 SP (~16 days)
> raw SP = (6 AC × 2) + 2 OQ = 14 → rounded to Fibonacci 13, but reduced to 8 given limited novelty (Electron overlay is well-documented pattern).

## Notes
- Electron supports `setIgnoreMouseEvents(true)` for full click-through on all platforms
- The overlay should be a second `BrowserWindow` with `transparent: true`, `frame: false`, `alwaysOnTop: true`, `skipTaskbar: true`
- On Windows fullscreen exclusive mode, overlays may not render — Dota 2 typically uses borderless windowed which is compatible
- The existing `announcementCallback` in the event scheduler is the natural hook point for triggering overlay notifications
