# Task 001 — Game Status Tracker Logic

## Goal
Implement the core state management module for tracking manual game events (Roshan, Buyback, Glyph) with computed timer deadlines. Verifiable by unit tests confirming correct state transitions and deadline calculations.

## Prerequisites
- None

## Tasks

### State Management

- [ ] `src/tracker/gameStatusTracker.ts` — Create tracker module with: `logEvent(type, currentTimeMs)`, `clearEvent(type)`, `clearAll()`, `getStatus()` returning all tracked event states; compute deadlines (Roshan: +480000ms may, +660000ms confirmed; Buyback: +480000ms; Glyph: +300000ms) (new)
  - [ ] `src/tracker/gameStatusTracker.spec.ts` — Tests: log Roshan → deadlines correct; log Buyback → deadline correct; log Glyph → deadline correct; clearEvent resets single; clearAll resets all; re-logging overwrites previous; getStatus returns null for unlogged events (new)

- [ ] `src/tracker/gameStatusTypes.ts` — Define types: `TrackedEventType` union ('roshan' | 'buyback' | 'glyph'), `TrackedEvent` (type, loggedAtMs, deadlines array with label+timeMs), `GameStatusState` (record of type → TrackedEvent | null) (new)

### Constants

- [ ] `src/tracker/gameConstants.ts` — Export Dota 2 timer constants: ROSHAN_MIN_RESPAWN_MS (480000), ROSHAN_MAX_RESPAWN_MS (660000), BUYBACK_COOLDOWN_MS (480000), GLYPH_COOLDOWN_MS (300000) (new)

## Done When
- [ ] `logEvent('roshan', timeMs)` produces correct may-respawn and confirmed-respawn deadlines
- [ ] `logEvent('buyback', timeMs)` produces correct cooldown deadline
- [ ] `logEvent('glyph', timeMs)` produces correct cooldown deadline
- [ ] `clearEvent` and `clearAll` reset state correctly
- [ ] All new tests pass
- [ ] No existing tests broken
