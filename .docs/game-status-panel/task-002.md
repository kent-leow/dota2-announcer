# Task 002 — Game Status Panel UI Component

## Goal
Create the GameStatusPanel React component that displays tracked events with log buttons, live countdowns, and clear buttons. Verifiable by rendering the component and interacting with log/clear controls.

## Prerequisites
- [x] task-001.md completed

## Tasks

### UI Component

- [x] `src/ui/main/GameStatusPanel.tsx` — Create panel component: renders a card for each trackable event (Roshan, Buyback, Glyph); each card has a "Log" button, shows logged time + computed deadlines with live countdowns (updated via `onClockTick`), a "Clear" button when active; listens to `onStateChange` for match-end reset via `clearAll()`; uses Dota theme styling (new)
  - [x] `src/ui/main/GameStatusPanel.spec.tsx` — Tests: renders all three event sections in idle state; clicking Log records current elapsed time and shows deadlines; countdown updates on clock tick; clicking Clear resets to unlogged; state change to 'idle' clears all; Roshan row shows color transition when past may-respawn time (new)

### Status Row Sub-component

- [x] `src/ui/main/StatusRow.tsx` — Reusable row component: accepts event type, tracked state (or null), elapsed time, onLog callback, onClear callback; renders log button when null, renders deadlines with countdowns when active; shows visual state transitions (amber when past first deadline, green when past final deadline) (new)
  - [x] `src/ui/main/StatusRow.spec.tsx` — Tests: renders log button when no tracked state; renders deadlines when tracked; countdown displays correct remaining time; color changes at deadline boundaries; clear button calls onClear (new)

## Done When
- [x] Panel renders three trackable event sections with Log buttons <!-- verified 2026-06-11 -->
- [x] Clicking Log populates the row with deadlines and live countdown <!-- verified 2026-06-11 -->
- [x] Clicking Clear resets a row to unlogged state <!-- verified 2026-06-11 -->
- [x] Roshan row visually transitions through may-respawn and confirmed-respawn states <!-- verified 2026-06-11 -->
- [x] Match end (idle transition) clears all tracked events <!-- verified 2026-06-11 -->
- [x] All new tests pass <!-- verified 2026-06-11 -->
- [x] No existing tests broken <!-- verified 2026-06-11 -->
