# Task 005 — Warning Policy: Lead-Time Trigger, Episodes, Gank Grouping, Silence Rules

**Phase**: Feature
**Covers**: AC9, AC11, AC12, AC15, AC17 (engine side)

## Goal
Turn per-second ETAs into warnings: fire within the same game second an ETA reaches the lead time, at most once per threat episode per hero, merged into a grouped warning when several enemies threaten together, silenced while the player is dead or a warning type is disabled; verified by scripted multi-second scenarios.

## Prerequisites
- [x] task-004.md completed

## Tasks

### Policy
- [x] `application/src/dota/mapAwareness/warningPolicy.ts` (new) — Pure `evaluate(etas, episodeState, settings, playerAlive, nowSecond)` returning warnings + next episode state:
  - Per hero episode: `armed` → fires when ETA ≤ `leadSeconds` (AC9) → `fired`.
  - Re-arm (AC11) only when: visible ETA > lead + 3 s (seen moving away) or ETA `null` from moving away, OR hero transitions fog→visible, OR fog prediction expires. ETA flickering around lead while `fired` → no repeat.
  - Source toggles: `visibleEnabled=false` → visible-source crossings ignored (episode stays armed); same for `fogEnabled`.
  - Player dead (AC15) → no warnings emitted; episodes are not consumed (crossings during death fire after respawn if still ≤ lead).
  - Grouping (AC12): ≥ 2 heroes crossing in the same second → one grouped warning (`heroes` list, earliest ETA). A hero crossing within 3 s after a previous warning → grouped warning listing all heroes currently fired within that 3 s window instead of a separate single warning. First crossing is never delayed (AC9 priority; a miss is worse than a false warning).
  - [x] `application/src/dota/mapAwareness/warningPolicy.spec.ts` (new) — ETA 6→5 with lead 5 fires same second; 6→4 (skipped 5) fires; ETA 5 then 4,5,4,6,5 → only one warning; visible ETA rises to 8.1 (> 5+3) then back to 5 → second warning; to 7.9 then 5 → no second warning; fog→visible re-arms; fog expiry re-arms; two heroes cross same second → one grouped warning with both names and min ETA; second hero 2 s after first → grouped warning with both; second hero 4 s after → separate single warning; player dead → nothing, respawn with ETA ≤ lead → fires; `fogEnabled=false` → fog crossing ignored, visible still fires; lead boundary 2 and 15 work.

### Engine Integration
- [x] `application/src/dota/mapAwareness/engine.ts` — After ETA computation, call `evaluate`; `step` now returns the warnings for that second; episode state reset with the engine (AC16). Player alive from `state.player.alive`.
  - [x] `application/src/dota/mapAwareness/engine.spec.ts` — Scenario: enemy walks from 4000 u toward stationary player at 300 u/s → exactly one warning at the first second ETA ≤ 5; enemy walks in, vanishes into fog 2500 u away and stays fogged → one fog warning at the computed second; kill matched by score → no fog warning for the dead hero; same input sequence run twice through fresh engines → identical warning lists (determinism, prerequisite for AC18 replay).

## Routes & Navigation
N/A — no UI change.

## Edge Cases & Failure Modes
- [x] ETA = 0 on the first observation (appears inside engage) → fires immediately
- [x] Hero dies after warning → episode cleared with track reset to `dead`; next appearance re-arms
- [x] All 5 heroes cross in the same second → single grouped warning "5 heroes"
- [x] Settings change lead time while a hero is `fired` → no immediate re-fire; new lead applies to armed heroes next second
- [x] Master toggle off → engine not stepped (handled in task-007); policy itself has no master flag

## Non-Functional Notes
- Security: N/A — pure computation.
- Performance: O(enemies) per second.
- Observability: each warning carries `clockTime`, hero list, per-hero source & ETA — logged by task-008 replay and by task-007 at `console.info` level.
- Rollback: not wired into the app until task-007.

## Verify
- `cd application && npx jest src/dota/mapAwareness` — all pass
- `cd application && npx tsc --noEmit -p tsconfig.json` — no errors

## Done When
- [x] A walking enemy produces exactly one warning, in the first second its ETA ≤ lead time <!-- verified 2026-10-26 -->
- [x] Gank (≥ 2 heroes within 3 s) produces grouped warnings, never a burst of separate ones <!-- verified 2026-10-26 -->
- [x] No warnings while the player is dead or the warning type is disabled <!-- verified 2026-10-26 -->
- [x] Identical inputs → identical warnings (deterministic) <!-- verified 2026-10-26 -->
- [x] All new/modified tests pass <!-- verified 2026-10-26 -->
- [x] No existing tests broken <!-- verified 2026-10-26 -->
