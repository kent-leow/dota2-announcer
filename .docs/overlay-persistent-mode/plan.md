# Persistent Overlay Mode & Dynamic Countdown

## Summary
Add a new "persistent" overlay mode that keeps a permanent panel on screen showing the N most recent upcoming events with live countdowns to their happen time. This complements the existing "notification" mode (popup-and-fade). Additionally, improve the existing notification mode so the "in Xs" text counts down live instead of showing a static number. Warning sounds remain unchanged in both modes.

## Scope
**In scope**
- A new overlay display mode: "persistent" — always visible during a match
- Persistent mode shows the N most recent/upcoming events with a live countdown to each event's happen time (not the warning offset time)
- User can configure the number of events shown (N), default 5
- User can switch between "notification" (current popup behavior) and "persistent" mode via settings
- Existing notification mode enhanced: the "in Xs" text dynamically counts down every second until the event fires
- Warning sounds continue to play as before regardless of overlay mode
- Overlay window reused — mode determines rendering behavior

**Out of scope**
- Changing warning sound behavior or timing
- Adding new event types or modifying event scheduling logic
- Persistent overlay on secondary monitors
- Notification mode and persistent mode shown simultaneously (mutually exclusive)

## Acceptance Criteria

| **AC1** | Mode selection setting |
|---------|-----------------------|
| Given | The user opens overlay settings |
| When  | They select an overlay mode |
| Then  | They can choose between "notification" (popup) and "persistent" (always-on) mode, and the choice persists across sessions |

| **AC2** | Persistent overlay displays upcoming events |
|---------|---------------------------------------------|
| Given | Overlay mode is "persistent" and a match is in progress |
| When  | Events are scheduled |
| Then  | The overlay shows up to N upcoming events sorted by nearest happen time |

| **AC3** | Persistent overlay live countdown to happen time |
|---------|--------------------------------------------------|
| Given | Overlay mode is "persistent" and events are displayed |
| When  | Game time advances |
| Then  | Each event's countdown updates live (every second or sub-second) showing time remaining until the event's happen time (not the warning offset) |

| **AC4** | Persistent overlay removes fired events |
|---------|------------------------------------------|
| Given | An event's happen time is reached (countdown hits 0) |
| When  | The event fires |
| Then  | It is immediately removed from the persistent list, and the next upcoming event takes its slot |

| **AC5** | Persistent overlay visible throughout match |
|---------|---------------------------------------------|
| Given | Overlay mode is "persistent" and a match is in progress |
| When  | The overlay is rendered |
| Then  | It remains visible continuously (no fade in/out per event) until the match ends |

| **AC6** | Notification mode dynamic countdown |
|---------|--------------------------------------|
| Given | Overlay mode is "notification" and a notification card is visible |
| When  | Game time advances while the card is on screen |
| Then  | The "in Xs" text counts down live (e.g., "in 60s" → "in 59s" → … → "now") rather than staying static |

| **AC7** | Warning sounds unaffected by mode |
|---------|-----------------------------------|
| Given | Either overlay mode is active |
| When  | A warning offset time is reached |
| Then  | The warning sound plays as before — overlay mode has no effect on audio behavior |

| **AC8** | Configurable event count (N) |
|---------|-------------------------------|
| Given | The user opens overlay settings |
| When  | They adjust the "number of events" setting for persistent mode |
| Then  | The persistent overlay updates to show the configured number of upcoming events |

## Estimate
**Story Points**: 13 SP (~26 days)
> raw SP = (8 AC × 2) = 16 → rounded to Fibonacci 13.

## Changelog
- 2026-06-14: Resolved open questions — N defaults to 5 (configurable); fired events (countdown=0) are immediately removed from persistent list, upcoming-only

## Notes
- Persistent mode needs access to the full upcoming event schedule (not just fired warnings), so the renderer will need a feed of upcoming occurrences with their absolute happen times
- The game timer tick (250ms) is already available — can be used to drive both the persistent countdown and the notification countdown
- The overlay window itself can be reused; only the React component tree changes based on mode
- Countdown in notification mode: pass current game time to the overlay on each tick (or a relevant subset), let the renderer compute remaining seconds from `happenTime - currentGameTime`
- Persistent mode countdown targets the event's `spawnTime` (the actual occurrence), NOT the `spawnTime - offsetSeconds` (the warning time)
