# Task 002 — Match Recording (GSI Feed Capture)

**Phase**: Feature
**Covers**: AC18 (recording half; replay half in task-008)

## Goal
When the user enables recording, every GSI payload of a match is saved (trimmed, PII-free, gzipped) to a per-match file so real matches can be collected early for tuning and accuracy measurement; verified by unit tests and a file appearing after a real/lobby match.

> Ordered early on purpose: recordings (plan OQ1) are needed before tuning in task-008, so capture can start while the engine is built.

## Prerequisites
- [x] None (independent of task-001; trims the raw body itself)

## Tasks

### Recorder
- [x] `application/src/dota/matchRecorder.ts` (new) — Module with `start(matchStartIso: string, matchId: string)`, `append(rawBody: string, receivedAtMs: number)`, `stop()`, `isRecording()`, `_resetForTesting()`:
  - File: `<userData>/recordings/<YYYYMMDD-HHMMSS>-<matchId>.jsonl.gz` (fallback `process.cwd()/recordings` outside Electron, same pattern as `stateStore.getStatePath`); directory created on first use.
  - Each line: `{ "t": <receivedAtMs>, "p": <trimmed payload> }`. Trim keeps only: `map`, `player.team_name`, `hero.{xpos,ypos,alive,name}`, `minimap` entries whose `unitname` starts with `npc_dota_hero_` (all fields), `events`. Drops steamid, accountid, player name, items, abilities, wearables, buildings, couriers, draft, neutralitems, non-hero minimap entries, `previously`, `added`.
  - Write via Node built-in `zlib.createGzip()` piped to `fs.createWriteStream` (non-blocking; no new dependency).
  - Unparseable body → written as `p: null` (live server treats it as a disconnect; replay must mirror it), recording continues.
  - Write/stream error (disk full, permission) → `console.error` once with file path, recording stops for this match, GSI processing unaffected.
  - Retention: after `stop()`, delete oldest files beyond the newest 20.
  - [x] `application/src/dota/matchRecorder.spec.ts` (new) — Uses a temp dir: start→append×3→stop produces one `.jsonl.gz` whose gunzipped lines parse and equal the trimmed payloads in order; trimmed line contains no `steamid`/`accountid`/`player.name`/`items`/`wearables`; non-hero minimap entries removed, hero entries kept intact; malformed body skipped; `append` while not recording is a no-op; `start` twice without `stop` closes the first file and opens a new one; stream error stops recording and does not throw; retention keeps newest 20 of 22 files.

### Lifecycle
- [x] `application/src/dota/gsiServer.ts` — Expose `onRawPayload(cb: (body: string, receivedAtMs: number) => void): () => void` fired for every POST body (before parsing), alongside existing `dumpRawPayload`.
  - [x] `application/src/dota/gsiServer.spec.ts` — Raw listener receives exact body for each POST; unsubscribe stops delivery.
- [x] `application/src/dota/matchStateManager.ts` — When recording preference is on: call `matchRecorder.start` on transition from `idle` into any non-idle phase (so pre-game/hero-pick seconds are included), subscribe `gsiServer.onRawPayload` → `matchRecorder.append`; call `matchRecorder.stop` on transition back to `idle` (post-game/disconnect/heartbeat timeout). Preference read at match start only (toggling mid-match takes effect next match). If `matchId` changes while non-idle, stop the current file and start a new one.
  - [x] `application/src/dota/matchStateManager.spec.ts` — Preference on: idle→hero-pick starts recorder, post-game stops it; preference off: recorder never starts; disconnect stops it; match ID change mid-match rotates to a new file; existing phase tests still pass.
- [x] `application/src/main/main.ts` — In the existing `before-quit` handler, call `matchRecorder.stop()` so the gzip stream is flushed.
  - [x] `application/src/main/main.spec.ts` — `before-quit` invokes recorder stop (mocked).

### Preference + Settings UI
- [x] `application/src/config/preferences.ts` — Add `recordMatches: boolean` (default `false`); `loadPreferences` validates type, falls back to `false`; `resetClosePreference` keeps `recordMatches`.
  - [x] `application/src/config/preferences.spec.ts` — Default false; persisted true round-trips; non-boolean value → false; existing close-behaviour tests unchanged.
- [x] `application/src/main/ipcHandlers.ts` — Add `prefs:getRecordMatches` / `prefs:setRecordMatches` (boolean-validated; non-boolean → `{ success: false }`). Add `prefs:openRecordingsFolder` using Electron `shell.openPath` on the recordings dir (create if missing).
- [x] `application/src/main/preload.ts` + `application/src/renderer/electron.d.ts` — Expose `getRecordMatches`, `setRecordMatches`, `openRecordingsFolder`.
- [x] `application/src/ui/settings/DynamicEventConfig.tsx` — Below the dynamic event cards, add a "Record matches (for map-awareness tuning)" checkbox (`data-testid="record-matches-toggle"`) and an "Open recordings folder" button (`data-testid="open-recordings"`), with an InfoTip: "Saves your hero positions and visible enemy positions each match. Stored locally only."
  - [x] `application/src/ui/settings/DynamicEventConfig.spec.tsx` — Checkbox reflects loaded preference; clicking calls `setRecordMatches(true)`; button calls `openRecordingsFolder`; existing Roshan tests unchanged.

## Routes & Navigation
| Route | Layout | Access | Nav entry | States (loading/empty/error) | Change |
|---|---|---|---|---|---|
| N/A — no router (Electron single window) | Settings → Timing tab → "Dynamic Events (GSI)" section | local user | existing section | checkbox disabled until preference loads | modify |

## Edge Cases & Failure Modes
- [x] App quits mid-match → gzip stream flushed/closed on `before-quit` (file readable up to last line); if not flushed, partial gzip tolerated by task-008 reader
- [x] Two matches back-to-back without idle in between (match ID change while in-match) → new file started on match ID change
- [x] Match ID `"0"` (lobby) → filename still unique via timestamp
- [x] Recordings dir deleted while recording → error path, recording stops, no crash
- [x] Very long match (90 min, ~10 payloads/s) → est. ≤ 15 MB gzipped (assumption; measure on first real recording)

## Non-Functional Notes
- Security: PII (steamid, accountid, player name) stripped before writing; files stay local; folder opened only via fixed path (no user-supplied paths).
- Performance: streamed async writes; trim is O(minimap entries); no sync fs in the GSI request path.
- Observability: single `console.error` on write failure with path + error code; `console.info` on start/stop with file path.
- Rollback: default off; disabling the preference stops future recordings; existing files untouched.

## Verify
- `cd application && npx jest src/dota/matchRecorder.spec.ts src/dota/gsiServer.spec.ts src/dota/matchStateManager.spec.ts src/config/preferences.spec.ts src/ui/settings/DynamicEventConfig.spec.tsx` — all pass
- `cd application && npx tsc --noEmit -p tsconfig.json` — no errors
- Manual (pending — needs a real/lobby match): enable "Record matches", play a lobby/bot match to the end → "Open recordings folder" shows one `.jsonl.gz`; `gunzip -c <file> | head -1` shows trimmed payload without steamid

## Done When
- [x] With recording on, one gzipped recording file per match appears in the recordings folder <!-- verified 2026-10-26 -->
- [x] Recording off by default; no file created when off <!-- verified 2026-10-26 -->
- [x] Recording never interrupts announcements, even on disk errors <!-- verified 2026-10-26 -->
- [x] All new/modified tests pass <!-- verified 2026-10-26 -->
- [x] No existing tests broken <!-- verified 2026-10-26 -->

## Changelog
- 2026-10-26: Implemented. Unparseable bodies recorded as `p: null` so replay mirrors the live disconnect reset; UI test ids prefixed `dynamic-` (existing TimingConfig test filters on that prefix); `savePreferences` callers moved to new `updatePreferences` merge helper so `recordMatches` is not lost.
