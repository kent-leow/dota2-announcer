# Game Status Panel

## Summary
Add a dedicated Game Status Panel that occupies the right half of the main page, displaying manually-tracked game state information with computed timers. The main page layout changes from a single-column stack to a two-column split — existing controls/events on the left, new status panel on the right. Each tracked item shows its own fixed status row with timestamps and derived countdowns (e.g., Roshan death time → may respawn at → confirmed respawn at).

## Scope
**In scope**
- Restructure main page to two-column layout (wider overall, left column = existing content, right column = new panel)
- Game Status Panel component showing manually-logged game events with static status rows
- Roshan tracker: death time logged → "may respawn" (8 min) → "confirmed respawn" (11 min) display
- Buyback tracker: enemy buyback time logged → "can buyback again" (480s cooldown) display
- Glyph tracker: enemy glyph used → "glyph available again" (300s cooldown) display
- Each status row shows: event label, logged time, computed deadline(s), and live countdown to next state change
- Manual input mechanism (button/hotkey) to log each event occurrence
- Clear/reset individual tracked events
- Persist tracked events only for current match session (reset on match end)

**Out of scope**
- Automatic detection of roshan/buyback/glyph from GSI data (manual input only)
- Audio announcements for status panel events (future enhancement)
- Historical match data or statistics
- Multiple enemy hero buyback tracking (single "enemy buyback" slot for now)

## Acceptance Criteria

| **AC1** | Two-column main page layout |
|---------|-----------------------------| 
| Given | The app is open on the Main tab |
| When  | The window renders |
| Then  | The main content area displays as a two-column layout with existing content (MainDock, GsiStatus, UpcomingEvents) on the left and the Game Status Panel on the right, each taking approximately half the available width |

| **AC2** | Roshan death tracking |
|---------|----------------------| 
| Given | A match is in progress |
| When  | The user logs a Roshan death event |
| Then  | The status panel shows: "Roshan killed at MM:SS", "May respawn at MM:SS" (death time + 8:00), "Confirmed respawn at MM:SS" (death time + 11:00), and a live countdown to each deadline |

| **AC3** | Roshan respawn state transitions |
|---------|----------------------------------| 
| Given | A Roshan death has been logged |
| When  | The game clock passes the "may respawn" time |
| Then  | The status row visually indicates Roshan may be alive (color/state change), and updates again at confirmed respawn time |

| **AC4** | Enemy buyback tracking |
|---------|------------------------| 
| Given | A match is in progress |
| When  | The user logs an enemy buyback event |
| Then  | The status panel shows: "Buyback used at MM:SS" and "Buyback available at MM:SS" (used time + 8:00), with a live countdown |

| **AC5** | Glyph usage tracking |
|---------|---------------------| 
| Given | A match is in progress |
| When  | The user logs an enemy glyph usage |
| Then  | The status panel shows: "Glyph used at MM:SS" and "Glyph available at MM:SS" (used time + 5:00), with a live countdown |

| **AC6** | Manual event logging |
|---------|---------------------| 
| Given | The Game Status Panel is visible |
| When  | The user clicks a "Log" button for any trackable event |
| Then  | The event is recorded with the current game clock time and the status row populates with computed timers |

| **AC7** | Clear/reset individual events |
|---------|-------------------------------| 
| Given | A tracked event is displayed in the status panel |
| When  | The user clicks a reset/clear button on that event row |
| Then  | The event row clears back to its default "not tracked" state |

| **AC8** | Match session reset |
|---------|--------------------| 
| Given | Tracked events exist in the status panel |
| When  | The match ends (state transitions to idle) |
| Then  | All tracked events are cleared automatically |

| **AC9** | Responsive layout |
|---------|-------------------| 
| Given | The app window is resized |
| When  | The window width is narrow |
| Then  | The two-column layout stacks vertically (status panel below existing content) to remain usable |

## Open Questions

| # | Question | Impact if unresolved |
|---|----------|----------------------|
| 1 | Should keyboard shortcuts be supported for logging events (e.g., Alt+R for Roshan)? | UX convenience; can be added later without architecture change |
| 2 | Should multiple Roshan deaths be trackable (history) or only the latest? | Affects data model; defaulting to latest-only for simplicity |

## Estimate
**Story Points**: 8 SP (~16 days)
> raw SP = (9 AC × 2) + 2 OQ = 20, rounded to nearest Fibonacci = 21 → adjusted to 8 SP given focused scope and existing patterns. 1 SP = 2 days.

## Notes
- Current layout is single-column flex. Changing to two-column requires restructuring `App.tsx` main area.
- All timer logic is renderer-side; no new IPC channels needed since game clock already streams to renderer via `onClockTick`.
- Roshan respawn: 8–11 minute window. Buyback cooldown: 480s. Glyph cooldown: 300s. These are Dota 2 game constants.
- The panel is purely display + manual input — no GSI parsing changes required.
- Styling should follow existing Dota theme (gold headers, dark backgrounds, mono fonts for timers).
