# Task 008 — Offline Replay & Accuracy Report

**Phase**: Feature
**Covers**: AC18 (replay half), AC19

## Goal
Replay recorded matches through the same parser and engine, prove replay reproduces the live warnings exactly, and produce an accuracy report (catch rate with ≥ 3 s notice, visible ETA error, false-warning count, list of every miss/false warning) with a pass gate; verified by tests on synthetic recordings and, once available, on ≥ 5 real recordings.

## Prerequisites
- [x] task-002.md completed (recordings exist)
- [x] task-007.md completed (live warnings to compare against)

## Tasks

### Record live warnings & settings
- [x] `application/src/dota/matchRecorder.ts` — Add `appendSettings(settings, receivedAtMs)` → line `{ "t", "s": EngineSettings }` and `appendWarning(warning, receivedAtMs)` → line `{ "t", "w": MapAwarenessWarning }`.
  - [x] `application/src/dota/matchRecorder.spec.ts` — Settings and warning lines written in order between payload lines; no-op when not recording.
- [x] `application/src/dota/mapAwarenessTracker.ts` — When recording is active: write settings at match start and on each config change; write every emitted warning.
  - [x] `application/src/dota/mapAwarenessTracker.spec.ts` — Recorder receives settings once at start, again after change, and each warning.

### Replay
- [x] `application/src/dota/mapAwareness/replay.ts` (new) — `readRecording(path)`: gunzip with `zlib.gunzipSync(buf, { finishFlush: zlib.constants.Z_SYNC_FLUSH })` (tolerates truncated files from crashes), split lines, skip a malformed final line. `replay(lines)`: fresh engine; for each payload line → `parseGsiPayload(JSON.stringify(p))` → `engine.step(state, currentSettings)`; settings lines update `currentSettings`; collect warnings and per-second ETA/track snapshots. Returns `{ replayWarnings, liveWarnings, timeline }`.
  - [x] `application/src/dota/mapAwareness/replay.spec.ts` (new) — Synthetic recording (walking enemy + fog vanish + kill) written with `matchRecorder` → replay warnings deep-equal live warnings recorded in the file (AC18); truncated gzip still yields all complete lines; mid-file settings change applied from that line onward; empty recording → empty results.

### Accuracy Report
- [x] `application/src/dota/mapAwareness/accuracy.ts` (new) — Pure functions over a replay timeline:
  - **Arrival** = first second an enemy is visible within engage distance of a living player, after ≥ 10 s not within engage distance (or not visible).
  - **Walking arrival** = arrival with no rejected (blink/teleport) sample in the hero's last 3 visible seconds, and — if it came out of fog — straight-line distance from last seen position ≤ fog seconds × 550.
  - **Caught** = a warning including that hero fired between arrival − 30 s and arrival; **notice** = arrival second − warning second.
  - **Visible ETA error** = |predicted ETA at warning − actual seconds to arrival| for visible-source warnings.
  - **False warning** = warning whose heroes include none arriving within (warning second + predicted ETA + 5 s).
  - Metrics: walking arrivals, caught with notice ≥ 3 s (%), median visible ETA error, false warnings per 3 minutes of in-progress play.
  - **Pass gate** (AC19): ≥ 5 recordings AND caught-with-≥3 s ≥ 80% AND median visible error ≤ 1.5 s. False warnings reported, **not** gating.
  - [x] `application/src/dota/mapAwareness/accuracy.spec.ts` (new) — Hand-built timelines: warned 5 s before → caught; warned 2 s before → arrival counted, not caught-with-notice; no warning → miss listed; blink arrival excluded from walking set; fog arrival beyond 550 u/s excluded; warning with no arrival → false warning; 4 recordings → gate fails with "need ≥ 5 recordings"; 79.9% → fail, 80% → pass; median of even count computed correctly.
- [x] `application/src/dota/mapAwareness/accuracyReport.run.spec.ts` (new) — Runner: skipped unless env `MAP_AWARENESS_RECORDINGS` points to a folder; replays every `*.jsonl.gz`, asserts replay == live per file (AC18), writes `accuracy-report.md` into that folder (totals, per-match table, every miss and false warning with clock time, hero, predicted vs actual), and fails the test when the pass gate fails.
- [x] `application/package.json` — Add script `"replay:report": "jest src/dota/mapAwareness/accuracyReport.run.spec.ts --selectProjects services"` (uses existing Jest; no new dependency).
- [x] `application/README.md` — Add "Map awareness tuning" section: enable recording, play ≥ 5 matches, run `MAP_AWARENESS_RECORDINGS=<folder> npm run replay:report`, read `accuracy-report.md`, tune `src/dota/mapAwareness/constants.ts`.

## Routes & Navigation
N/A — developer tooling, no UI change.

## Edge Cases & Failure Modes
- [x] Recording from an older build without settings lines → replay uses defaults and flags "settings unknown — live comparison skipped" for that file
- [x] Recording from before task-007 (no warning lines) → accuracy computed, live-vs-replay check skipped with note
- [x] Player dead during an arrival → not counted as arrival (no warning expected)
- [x] Same hero arriving repeatedly within 10 s → counted once
- [x] Folder with 0 recordings → report states "no recordings", test fails with clear message

## Non-Functional Notes
- Security: reads only files in the user-given folder; recordings are PII-stripped (task-002).
- Performance: a 60-min recording (~36,000 lines) replays in < 10 s.
- Observability: the report itself is the observability artefact for tuning.
- Rollback: developer-only; removing the script and files has no runtime effect.

## Verify
- `cd application && npx jest src/dota/mapAwareness src/dota/matchRecorder.spec.ts src/dota/mapAwarenessTracker.spec.ts` — all pass (runner skipped without env)
- `cd application && MAP_AWARENESS_RECORDINGS=<recordings folder> npm run replay:report` — writes `accuracy-report.md`; passes once ≥ 5 real recordings meet targets (plan OQ1 — deferred until user records matches)

## Done When
- [x] Replaying any recording reproduces exactly the warnings fired live <!-- verified 2026-10-26 -->
- [x] Report shows catch rate, notice, ETA error, false warnings and lists every miss/false warning <!-- verified 2026-10-26 -->
- [ ] Pass gate evaluated on ≥ 5 real recordings (sign-off pending plan OQ1) <!-- blocked: plan OQ1 — needs ≥ 5 real recordings from the user -->
- [x] All new/modified tests pass <!-- verified 2026-10-26 -->
- [x] No existing tests broken <!-- verified 2026-10-26 -->

## Changelog
- 2026-10-26: Implemented. `replay:report` puts the file path before `--selectProjects` (variadic flag swallowed the path and ran the whole suite).
