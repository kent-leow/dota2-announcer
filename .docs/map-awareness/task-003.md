# Task 003 — Engine Core: Hero Tracks, Speed Learning, Death Inference, Reset

**Phase**: Feature
**Covers**: AC1 (identity across updates), AC3, AC4, AC5, AC13, AC16

## Goal
A pure (no Electron, no I/O, no timers) per-enemy tracking core that, fed one parsed GSI state per game second, keeps each enemy's last seen position, visibility, learned speed and dead/alive status, and resets correctly between matches; verified by deterministic unit tests with synthetic movement.

## Prerequisites
- [x] task-001.md completed

## Tasks

### Types & Constants
- [x] `application/src/dota/mapAwareness/types.ts` (new) — `EnemyTrack` (hero name, visible flag, last seen x/y, last seen clock second, last 4 position samples with clock seconds, valid speed samples list, learned speed or `null`, state `'visible' | 'fog' | 'dead'`, vanished-at second, heading-away flag at vanish), `EngineSettings` (leadSeconds, engageDistance, maxFogSeconds, visibleEnabled, fogEnabled), `MapAwarenessWarning` (heroes: `{ name, etaSeconds, source: 'visible' | 'fog' }[]`, etaSeconds (earliest), clockTime, grouped flag).
- [x] `application/src/dota/mapAwareness/constants.ts` (new) — `MAX_MOVE_SPEED = 550`, `BLINK_REJECT_FACTOR = 1.2`, `IDLE_SPEED_FLOOR = 50`, `SPEED_WINDOW_SECONDS = 3`, `MIN_SPEED_SAMPLES = 3`, `FALLBACK_SPEED = 350`, `DEATH_MATCH_WINDOW_SECONDS = 2`, plus defaults/ranges used by later tasks: lead 5 (2–15), engage 800 (300–1500), max fog 20 (5–40), turn-around 1 s, re-arm margin 3 s, group window 3 s, closing-rate floor 100, fog grace 1 s. One place to tune after recordings.

### Hero Tracks
- [x] `application/src/dota/mapAwareness/heroTracks.ts` (new) — `updateTracks(tracks, enemyHeroes, clockSecond)`:
  - Identity by hero name. Duplicate names in one update (illusions/clones) → keep the entry closest to the track's last seen position (first entry if no history).
  - Hero present → `visible`; append position sample; drop samples older than `SPEED_WINDOW_SECONDS`.
  - Hero previously `visible`, now absent → `fog`, record vanished-at second and last seen position; mark `headingAway` when the last movement vector (from samples) points > 90° away from the player's position at that moment; no movement samples → `headingAway = false`.
  - Hero `fog`/`dead` and present again → `visible`, sample history cleared (no fog-gap speed samples).
- [x] `application/src/dota/mapAwareness/speedModel.ts` (new) — From consecutive samples (dt = clock delta, dt ≥ 1): speed = distance ÷ dt. Reject when speed > `MAX_MOVE_SPEED × BLINK_REJECT_FACTOR` (blink/teleport) or < `IDLE_SPEED_FLOOR` (standing still). Learned speed = mean of valid samples over the last `SPEED_WINDOW_SECONDS`, capped at `MAX_MOVE_SPEED`; keep previous learned value when the newest sample is rejected. `effectiveSpeed(track)` = learned speed if ≥ `MIN_SPEED_SAMPLES` valid samples ever collected for this hero, else `FALLBACK_SPEED`. `fogSpeed(track)` = `max(effectiveSpeed, MIN_FOG_SPEED)` with `MIN_FOG_SPEED = 350`, because observed averages underestimate heroes that are last-hitting or juking, and a late fog warning is a miss.
  - [x] `application/src/dota/mapAwareness/heroTracks.spec.ts` (new) — Minimap order shuffled between seconds → same tracks; ally/self never tracked (input already filtered — assert no extra tracks); visible→absent → `fog` with correct last seen pos & second; fog→present → `visible` and history cleared; duplicate names → closest entry chosen; heading-away flag true for movement directly away, false for directly toward, false with single sample.
  - [x] `application/src/dota/mapAwareness/speedModel.spec.ts` (new) — Hero moving 300 u/s for 3 s → learned 300 (±15% AC3 bound, exact here); 600 u/s observations capped at 550; jump of 1200 u in 1 s rejected and previous estimate kept (AC4); 20 u/s idle ignored; reappearance after fog adds no sample spanning fog; < 3 samples → effective speed 350 (AC5); dt = 2 (skipped second) → speed = distance ÷ 2; boundary: exactly 660 u/s (550×1.2) accepted, 661 rejected; exactly 50 accepted, 49 rejected.

### Death Inference
- [x] `application/src/dota/mapAwareness/deathInference.ts` (new) — Keep a rolling list of (second, heroes that vanished) and (second, own-team kill-score delta) within the last `DEATH_MATCH_WINDOW_SECONDS`. When the summed score delta K over the window equals the number of vanished heroes in the same window (K ≥ 1), mark exactly those heroes `dead` and consume both entries. Count mismatch → nobody marked dead (stays `fog`). Own team = player side from parsed state; score decrease (e.g. reconnect glitch) → ignored.
  - [x] `application/src/dota/mapAwareness/deathInference.spec.ts` (new) — Score +1 and 1 hero vanishes same second → dead; score +1 one second after vanish → dead; score +1 three seconds after → not dead; score +2 and 2 vanish → both dead; score +1 and 2 vanish → neither dead; score +1 with 0 vanished → no change and entry expires; dead hero reappears → visible; Dire player uses dire score; score decreases → ignored.

### Engine Shell + Reset
- [x] `application/src/dota/mapAwareness/engine.ts` (new) — `createEngine()` returning `{ step(state: ParsedGameState, settings: EngineSettings): MapAwarenessWarning[]; reset(); getTracks() }`. This task implements state ingestion only (warnings list always empty; tasks 004–005 fill it):
  - Process only the **first** state whose `clockTime` is greater than the last processed second; later states in the same second ignored (deterministic, ~1 Hz).
  - Skip entirely when `player` is undefined.
  - Reset all tracks/death buffers when: `matchId` differs from last seen, `gameState` ≠ `DOTA_GAMERULES_STATE_GAME_IN_PROGRESS`, or `clockTime` < last processed second (AC16).
  - [x] `application/src/dota/mapAwareness/engine.spec.ts` (new) — Multiple states with same `clockTime` → only first processed; match ID change resets; leaving in-progress resets; clock going backwards resets; match ID `"0"` stable across a match does not reset; missing `player` → no tracks, no throw.

## Routes & Navigation
N/A — no UI change.

## Edge Cases & Failure Modes
- [x] Clock skips several seconds (lag) → dt-based speed, no false blink rejection for normal movement over dt
- [x] Negative pre-horn clock seconds → treated normally (monotonic)
- [x] Hero visible for only 1 second ever → no speed samples, fallback 350
- [x] All 5 enemies vanish at once with score +0 (smoke) → all `fog`, none dead
- [x] Hero killed by neutrals/tower deny (no score change) → stays `fog` (safe side — false warning preferred)
- [x] Player's own hero position missing for a second → track updates still apply; heading-away computed only when player position present

## Non-Functional Notes
- Security: N/A — pure computation on already-parsed data.
- Performance: ≤ 10 enemies × 4 samples per second; O(1) per hero; < 1 ms per step.
- Observability: `getTracks()` snapshot exposed for tests and the task-008 report; no logging in the hot path.
- Rollback: not wired into the app until task-007; deleting the folder reverts.

## Verify
- `cd application && npx jest src/dota/mapAwareness` — all pass
- `cd application && npx tsc --noEmit -p tsconfig.json` — no errors

## Done When
- [x] Synthetic enemy walking at a fixed speed for 3 s is learned within ±15% (exact in test) <!-- verified 2026-10-26 -->
- [x] Blinks, idle, and fog gaps never change the learned speed <!-- verified 2026-10-26 -->
- [x] A kill matched by score marks exactly the right hero dead; mismatches leave heroes alive <!-- verified 2026-10-26 -->
- [x] Engine resets on match change, non-in-progress state, or clock rewind <!-- verified 2026-10-26 -->
- [x] All new/modified tests pass <!-- verified 2026-10-26 -->
- [x] No existing tests broken <!-- verified 2026-10-26 -->

## Changelog
- 2026-10-26: Implemented. Added `fogSpeed` floor (`MIN_FOG_SPEED = 350`).
