# Task 006 — Map Awareness Config, Defaults & Settings UI

**Phase**: Feature
**Covers**: AC17

## Goal
Add a "Map Awareness" dynamic event with on/off, visible/fog toggles and numeric settings (lead time, engage distance, maximum fog age), persisted and validated, editable in Settings and pushed live to the running tracker without restart; verified by schema, store and UI tests.

## Prerequisites
- [x] task-005.md completed (engine consumes `EngineSettings`)

## Tasks

### Schema & Defaults
- [x] `application/src/config/events.schema.ts` — Add optional `settings: z.record(z.number().finite())` to `dynamicEventConfigSchema` (backward compatible: Roshan entries without `settings` still valid).
  - [x] `application/src/config/events.schema.spec.ts` — Entry with numeric settings valid; entry without settings valid; non-numeric / `NaN` / `Infinity` setting rejected.
- [x] `application/src/config/defaults.ts` — Append to `DEFAULT_DYNAMIC_EVENTS`: `{ id: 'map-awareness', name: 'Map Awareness', enabled: true, notifications: { visible: true, fog: true }, settings: { leadSeconds: 5, engageDistance: 800, maxFogSeconds: 20 } }` (values from task-003 constants — single source, import them).
  - [x] `application/src/config/defaults.spec.ts` — Map-awareness entry present, enabled, both notification flags true, settings equal constants, passes `dynamicEventsConfigSchema`.
- [x] `application/src/dota/mapAwareness/settings.ts` (new) — `toEngineSettings(config: DynamicEventConfig | undefined): EngineSettings | null` — `null` when missing or `enabled=false`; each numeric setting clamped to its range (lead 2–15, engage 300–1500, maxFog 5–40) and missing/invalid keys → default; missing notification keys → `true` (safe side).
  - [x] `application/src/dota/mapAwareness/settings.spec.ts` (new) — Disabled → null; undefined → null; lead 1 → 2, 16 → 15; engage 299 → 300, 1501 → 1500; maxFog 4 → 5, 41 → 40; missing settings object → all defaults; missing `fog` flag → true.

### Persistence (existing installs)
- [x] `application/src/tts/stateStore.ts` — No logic change expected: `parseDynamicEvents` already appends missing default entries, so existing users get `map-awareness` automatically. Verify with test.
  - [x] `application/src/tts/stateStore.spec.ts` — Saved state containing only `roshan` → read returns `roshan` + default `map-awareness`; saved `map-awareness` with custom settings preserved.

### Live Update
- [x] `application/src/main/ipcHandlers.ts` — In `config:setDynamicEvents`, after `writeAppState`, notify the map awareness tracker of the new config (tracker created in task-007; until then call a setter exported by a small `mapAwarenessConfig` holder: `application/src/dota/mapAwareness/configHolder.ts` (new) with `getConfig()`, `setConfig()`, `loadFromAppState()`).
  - [x] `application/src/dota/mapAwareness/configHolder.spec.ts` (new) — `loadFromAppState` picks `map-awareness` entry; `setConfig` replaces it; listeners notified on change.

### Settings UI
- [x] `application/src/ui/settings/DynamicEventConfig.tsx` — For entries with `settings`, render labelled number inputs (`data-testid="dynamic-setting-<id>-<key>"`) with min/max/step (lead 2–15 step 1 "Warn before (s)"; engage 300–1500 step 50 "Engage distance"; maxFog 5–40 step 1 "Track in fog for (s)"); save on blur/Enter with clamping; invalid/empty input reverts to last saved value. Add tooltips: `map-awareness:visible` "Warn when a visible enemy is closing in", `map-awareness:fog` "Warn when an enemy that vanished into fog could reach you". Add one-line limitation note under the card: "Uses only what your team can see. Blink, teleports and invisibility in fog can arrive earlier than predicted."
  - [x] `application/src/ui/settings/DynamicEventConfig.spec.tsx` — Map-awareness card renders with both toggles and three number inputs; entering 20 in lead saves 15; empty input reverts; toggling `fog` saves correct config; master off hides sub-controls; Roshan card unchanged (no number inputs).

## Routes & Navigation
| Route | Layout | Access | Nav entry | States (loading/empty/error) | Change |
|---|---|---|---|---|---|
| N/A — no router (Electron single window) | Settings → Timing tab → "Dynamic Events (GSI)" section | local user | existing section, new "Map Awareness" card after Roshan | loading: section empty until IPC resolves (existing behaviour); save error: value reverts | modify |

## Edge Cases & Failure Modes
- [x] Hand-edited app-state with `leadSeconds: "abc"` → schema rejects on save path; read path clamps/defaults via `toEngineSettings`
- [x] Older app version reading a newer state file with `settings` → zod object strips/ignores unknown key (no crash) (inferred: zod default strip)
- [x] User sets lead 15 and maxFog 5 → valid; fog warnings only possible within first 5 s
- [x] Rapid toggling → each save writes full array (existing pattern); last write wins

## Non-Functional Notes
- Security: values validated at IPC boundary (zod) and clamped again at engine boundary.
- Performance: config pushed on change; no per-second disk reads.
- Observability: N/A — settings errors surface as reverted inputs (existing pattern).
- Rollback: removing the default entry hides the feature; stored entries are filtered out by `parseDynamicEvents` (unknown ids dropped).

## Verify
- `cd application && npx jest src/config src/tts/stateStore.spec.ts src/dota/mapAwareness src/ui/settings/DynamicEventConfig.spec.tsx` — all pass
- `cd application && npx tsc --noEmit -p tsconfig.json` — no errors
- Manual: `npm start` → Settings → Dynamic Events shows "Map Awareness" with toggles and 3 inputs; change lead to 7, restart app → still 7

## Done When
- [x] Map Awareness appears in Settings for new and existing users <!-- verified 2026-10-26 -->
- [x] Changes persist across restart and reach the running tracker without restart <!-- verified 2026-10-26 -->
- [x] Out-of-range values are clamped, never crash <!-- verified 2026-10-26 -->
- [x] All new/modified tests pass <!-- verified 2026-10-26 -->
- [x] No existing tests broken <!-- verified 2026-10-26 -->
