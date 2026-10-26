# Task 001 — GSI Parser: Enemy Heroes, Player Position, Side, Kill Scores

**Phase**: Feature
**Covers**: AC1, AC2

## Goal
Expose visible enemy heroes (name, position), the player's own position/alive/side, and team kill scores in the parsed GSI state through a pure, exported parser; verified by unit tests built from the real sample dumps.

## Prerequisites
- [x] None

## Tasks

### Types
- [x] `application/src/dota/gsiTypes.ts` — Add raw payload types: minimap entry (`xpos`, `ypos`, `yaw`, `image`, `team`, `name`, `unitname`, `visionrange`; all optional), `GsiPayload.minimap` as a string-keyed record of entries, `GsiMap.radiant_score` / `dire_score` (optional), `GsiPlayer.team_name`, `GsiHero.xpos` / `ypos` / `alive` (optional). Add parsed types: `VisibleHero { name: string; x: number; y: number }`, `PlayerSnapshot { team: 'radiant' | 'dire'; x: number; y: number; alive: boolean }`, `KillScores { radiant: number; dire: number }`. Add **optional** fields to `ParsedGameState`: `player?`, `enemyHeroes?` (array), `killScores?`. Optional so every existing spec that builds a `ParsedGameState` literal still compiles.

### Parser
- [x] `application/src/dota/gsiParser.ts` (new) — Move the existing private `parsePayload` / `extractHeroName` / `extractEvents` logic out of `gsiServer.ts` into an exported pure function `parseGsiPayload(body: string): ParsedGameState | null` (no `fs`, no `electron`, no `http`) so task-008 replay can reuse the identical parser. Add:
  - Side: `player.team_name` → `'radiant'` (team number 2) / `'dire'` (team number 3); unknown/missing → `player` left `undefined` (map awareness inactive, never guess).
  - Player snapshot: from `hero.xpos`, `hero.ypos`, `hero.alive`; omitted if coordinates are not finite numbers.
  - Enemy heroes: iterate `minimap` values; keep entries whose `unitname` starts with `npc_dota_hero_` AND whose numeric `team` is the opposite side's number; never key by minimap slot (`o0`, `o1`… reshuffle between updates). Name = `unitname` without the `npc_dota_hero_` prefix. Skip entries with non-finite coordinates.
  - Duplicate hero names (illusions/clones) are all returned; disambiguation is task-003's job.
  - Kill scores: from `map.radiant_score` / `map.dire_score`; omitted if either missing.
  - Malformed JSON / missing `map` → `null` (unchanged behaviour).
  - [x] `application/src/dota/gsiParser.spec.ts` (new) — Using trimmed copies of `.docs/.sample/gsi-dump-after-ros.json` and `gsi-dump-before-ros.json` as inline fixtures: after-ros yields exactly `tidehunter` (5820, −5770) and `nevermore` (−71, −589) as enemies, player radiant at (−2797, 2023) alive, scores 16/3; before-ros yields zero enemies; allies (`minimap_herocircle`) and self (`minimap_herocircle_self`) never appear as enemies; mirrored Dire fixture (team_name `dire`) returns team-2 heroes as enemies; minimap absent / empty object / entry with missing or string coordinates → skipped, no throw; unknown `team_name` → `player` undefined and `enemyHeroes` empty; two entries with the same hero name → both returned; missing scores → `killScores` undefined; existing fields (`gameState`, `clockTime`, `matchId`, `paused`, `daytime`, `heroName`, `events`) unchanged vs current behaviour; malformed JSON → `null`.
- [x] `application/src/dota/gsiServer.ts` — Replace the private parsing functions with an import of `parseGsiPayload`; no other behaviour change.
  - [x] `application/src/dota/gsiServer.spec.ts` — Existing tests still pass unchanged; add one test asserting a payload with minimap enemies reaches `onStateChange` listeners with `enemyHeroes` populated.

## Routes & Navigation
N/A — no UI change.

## Edge Cases & Failure Modes
- [x] Minimap list order differs between updates → same parsed result (identity by name, not slot)
- [x] Player on Dire → Radiant heroes are enemies
- [x] Spectator / unknown side (`team_name` missing or other value) → no enemies reported, no crash
- [x] Pre-horn negative `clock_time` → parsed as-is (engine handles)
- [x] Coordinates `0` are valid (not treated as missing)
- [x] Huge payload (~40 KB, 150+ minimap entries) parses in < 5 ms

## Non-Functional Notes
- Security: payload comes from localhost GSI; parser must tolerate any shape (type-check every field, never trust) — no throws escape.
- Performance: single pass over minimap entries; no deep clone of the full payload.
- Observability: N/A — silent field skipping is intended; malformed payload behaviour unchanged.
- Rollback: new fields are optional and unused until task-007; reverting the file split restores the old inline parser.

## Verify
- `cd application && npx jest src/dota/gsiParser.spec.ts src/dota/gsiServer.spec.ts` — all pass
- `cd application && npx tsc --noEmit -p tsconfig.json` — no errors
- `cd application && npm test` — full suite green

## Done When
- [x] Parsed state from the after-ros sample lists exactly the 2 visible enemy heroes with correct positions <!-- verified 2026-10-26 -->
- [x] Player side, position and alive state are available for Radiant and Dire <!-- verified 2026-10-26 -->
- [x] All new/modified tests pass <!-- verified 2026-10-26 -->
- [x] No existing tests broken <!-- verified 2026-10-26 -->
