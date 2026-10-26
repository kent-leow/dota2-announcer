# Task 004 — Arrival-Time (ETA) Calculation: Visible, Fog, Expiry, Pause

**Phase**: Feature
**Covers**: AC6, AC7, AC8, AC14

## Goal
For every tracked enemy, compute each game second the predicted seconds until it can reach the player's engage distance — measured closing rate for visible enemies, straight-line worst case for fogged enemies — with fog expiry and pause freeze; verified by deterministic unit tests with hand-computed expected values.

## Prerequisites
- [x] task-003.md completed

## Tasks

### ETA Functions
- [x] `application/src/dota/mapAwareness/eta.ts` (new) — Pure functions, all distances in GSI world units, times in game seconds:
  - `visibleEta(track, player, engageDistance)`: distance history to the player over the last 3 game seconds (needs ≥ 2 samples, span ≥ 1 s — a 2 s minimum would miss fast enemies appearing out of fog). Closing rate = (distance at oldest sample − current distance) ÷ elapsed. Current distance ≤ engage → `0`. Closing rate < 100 u/s → `null` (not approaching). Else `(currentDistance − engage) ÷ closingRate`.
  - `fogEta(track, player, nowSecond, engageDistance, maxFogSeconds)`: fog age N = now − vanished-at. N > maxFogSeconds → `null` (expired, AC8). N < fog grace (1 s) → `null` (lets task-003 death inference confirm kills first). S = `fogSpeed(track)` (learned speed, floor 350). ETA = `max(0, (dist(lastSeen, player) − engage − S × N) ÷ S)`; add turn-around allowance (1 s) when `headingAway`. Uses the player's **current** position every second.
  - Dead tracks → `null`.
  - [x] `application/src/dota/mapAwareness/eta.spec.ts` (new) — Visible: enemy 2000 u away closing 300 u/s for 3 s, engage 800 → ETA 4.0; inside engage → 0; closing 99 u/s → null; closing exactly 100 → numeric; only 1 sample → null; moving away → null; both heroes moving toward each other (closing = sum) → uses measured closing. Fog: last seen 3000 u away, S 350, N 2, engage 800 → (3000−800−700)/350 = 4.286; heading away adds +1; N > maxFog → null; N exactly maxFog → numeric; N = 0 → null (grace); player walks toward last seen position → ETA drops next second; fallback speed used when < 3 samples; result never negative; dead → null.

### Engine Integration
- [x] `application/src/dota/mapAwareness/engine.ts` — Each processed second, compute `eta` per non-dead track (visible → `visibleEta`, fog → `fogEta`), store on an internal per-hero ETA map exposed via `getEtas()` for task-005 and tests.
  - Pause (AC14): when `state.paused` is true → skip the step entirely (no fog aging, no ETA changes, no warnings). Clock is also frozen during pause, so second-dedupe already holds; the explicit check guards against clock drift while paused.
  - [x] `application/src/dota/mapAwareness/engine.spec.ts` — Add: ETAs computed per second for visible and fog heroes; paused states (even with changing positions) leave ETAs and fog age untouched; unpause resumes from the same fog age; fogged hero beyond `maxFogSeconds` has no ETA.

## Routes & Navigation
N/A — no UI change.

## Edge Cases & Failure Modes
- [x] Player dead → ETAs still computed (warnings suppressed in task-005) so state is correct on respawn
- [x] Player position missing for one second → reuse last known player position for that second
- [x] Enemy visible but standing still next to player (inside engage) → ETA 0 (fires once via episode logic in task-005)
- [x] Enemy appears out of fog already inside engage distance → ETA 0 immediately (no 2-sample requirement inside engage)
- [x] Extremely large distances (opposite corners ~23,000 u) → finite numbers, no overflow
- [x] `maxFogSeconds` changed mid-fog → applied next second

## Non-Functional Notes
- Security: N/A — pure computation.
- Performance: O(enemies) per second; trivial.
- Observability: `getEtas()` snapshot consumed by task-008 replay report (per-second ETA log).
- Rollback: not wired into the app until task-007.

## Verify
- `cd application && npx jest src/dota/mapAwareness` — all pass
- `cd application && npx tsc --noEmit -p tsconfig.json` — no errors

## Done When
- [x] Hand-computed visible and fog ETA cases match to 3 decimals <!-- verified 2026-10-26 -->
- [x] Fog ETA stops after maximum fog age and starts after 1 s grace <!-- verified 2026-10-26 -->
- [x] Pause freezes all ETA state <!-- verified 2026-10-26 -->
- [x] All new/modified tests pass <!-- verified 2026-10-26 -->
- [x] No existing tests broken <!-- verified 2026-10-26 -->

## Changelog
- 2026-10-26: Implemented. Visible ETA minimum span 1 s (was 2 s); fog ETA uses `fogSpeed`.
