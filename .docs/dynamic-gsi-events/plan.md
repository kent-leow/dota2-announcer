# Dynamic GSI-Driven Event Timings

## Summary
Introduce a new "dynamic" event type alongside the existing fixed/repeating event timings. Dynamic events derive their trigger times from live GSI data rather than predetermined spawn schedules. The first dynamic event is Roshan — showing notifications when killed, countdowns during the potential-respawn window (minute-by-minute), and a confirmed-alive notification. Dynamic events are system-provided (not user-creatable) but individually configurable (enable/disable, warning preferences). They coexist in the same events JSON under a `type` discriminator so settings persist in one file.

## Scope
**In scope**
- Add a `type` field to the event schema (`"fixed"` for existing behaviour, `"dynamic"` for GSI-driven)
- Implement Roshan dynamic event: killed notification, potential-respawn countdown (each minute of the 8–11 min window), confirmed-respawn notification
- Consume `roshan_state` and `roshan_state_end_seconds` from GSI payload to calculate timing
- Provide a separate "Dynamic Events" section in the settings UI for toggling/configuring system-provided dynamic events
- Show dynamic event notifications in the existing notification overlay and persistent panel
- Persist dynamic event config in the same `events.json` / app-state alongside fixed events

**Out of scope**
- User-created dynamic events (only system-provided for now)
- Enemy item notifications or other future dynamic event types beyond Roshan
- Changes to the fixed event scheduler logic (backward compatible — `type: "fixed"` is default)
- Audio/TTS announcements for dynamic events (can reuse existing TTS pipeline without changes)

## Acceptance Criteria

| **AC1** | Schema supports dynamic event type |
|---------|---|
| Given | The events configuration is loaded |
| When | An event has `type: "dynamic"` |
| Then | It is validated separately from fixed events and excluded from the fixed scheduler loop |

| **AC2** | Roshan kill triggers notification |
|---------|---|
| Given | A match is in progress and GSI reports `roshan_state` changes to `"dead"` |
| When | The state transition is detected |
| Then | A "Roshan Killed" notification appears in both the notification overlay and persistent panel |

| **AC3** | Potential respawn countdown shown each minute |
|---------|---|
| Given | Roshan is dead and GSI reports `respawn_base` or `respawn_variable` state with `roshan_state_end_seconds` counting down |
| When | Each minute boundary is reached within the respawn window |
| Then | A notification appears in both notification overlay and persistent panel showing remaining time (e.g., "Roshan may respawn in 3 min") |

| **AC4** | Confirmed respawn notification |
|---------|---|
| Given | GSI reports `roshan_state` changes back to `"alive"` |
| When | The state transition is detected |
| Then | A "Roshan Alive" notification appears and the persistent panel removes the Roshan countdown entry |

| **AC5** | Dynamic events configurable in settings UI |
|---------|---|
| Given | The user opens the Timing Config settings |
| When | They scroll to the "Dynamic Events" section |
| Then | They can enable/disable Roshan tracking and configure which notifications to show (kill, countdown, respawn) |

| **AC6** | Dynamic events persist alongside fixed events |
|---------|---|
| Given | The user modifies dynamic event settings |
| When | The app restarts |
| Then | Dynamic event preferences are restored from the same persisted config file |

| **AC7** | Backward compatibility with existing fixed events |
|---------|---|
| Given | An existing events config without a `type` field |
| When | Loaded by the updated schema |
| Then | Events default to `type: "fixed"` and behave identically to before |

## Open Questions
> None — all resolved.

## Estimate
**Story Points**: 13 SP (~26 days)
> raw SP = (7 AC × 2) + 0 OQ = 14, rounded to nearest Fibonacci = 13. 1 SP = 2 days.

## Notes
- GSI already provides `roshan_state` and `roshan_state_end_seconds` in `GsiMap` — no additional GSI config needed
- Verified GSI semantics: `roshan_state` = `alive` | `respawn_base` | `respawn_variable`; `roshan_state_end_seconds` = relative countdown (seconds until current state ends). Spectator-only data.
- `respawn_base` = first 8 min window (guaranteed dead); `respawn_variable` = 8–11 min window (can respawn any tick). We use `roshan_state_end_seconds` directly — no manual timer math.
- The `type` discriminator approach keeps one JSON file but allows filtering in the scheduler: fixed events use `computeFiresForEvent`, dynamic events use a new `DynamicEventProcessor` that reacts to GSI state changes
- Dynamic event notifications appear in both notification overlay (pop-up) and persistent panel (countdown entry) — same behaviour as fixed events, no exceptions
- Future dynamic events (enemy items, Aegis expiry, glyph cooldown) follow the same pattern — implement a processor class per dynamic event type
- The "not user-addable" constraint means the UI section shows a fixed list of available dynamic events with toggle switches, not an "Add" button

## Changelog
- 2026-06-17: Resolved OQ1 — confirmed GSI roshan_state values (alive/respawn_base/respawn_variable) and roshan_state_end_seconds is relative countdown. Resolved OQ2 — dynamic events use same overlay+persistent behaviour as fixed events. Updated AC3 and Notes.
