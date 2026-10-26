# Task 007 — Live Integration: Tracker, Voice & Overlay Warnings

**Phase**: Feature
**Covers**: AC10 (and wires AC1–AC17 into the running app)

## Goal
Run the engine live during matches and deliver each warning as a high-priority voice line ("Tidehunter, 5 seconds" / "3 heroes, 4 seconds") and an overlay card with hero name, visible/fog tag and a live countdown; verified by unit tests and a manual lobby test.

## Prerequisites
- [x] task-005.md completed
- [x] task-006.md completed

## Tasks

### Tracker (GSI consumer)
- [x] `application/src/dota/mapAwarenessTracker.ts` (new) — Same pub-sub shape as `roshanTracker.ts`: `startListening()`, `stopListening()`, `onWarning(cb) → unsubscribe`, `reset()`, `_resetForTesting()`. Holds one engine from `createEngine()`; on each `gsiServer.onStateChange` → `toEngineSettings(configHolder.getConfig())`; `null` (disabled) → skip; else `engine.step(state, settings)` → emit each warning. Any exception inside `step` → `console.error` once per match with message, swallow (never break other GSI consumers).
  - [x] `application/src/dota/mapAwarenessTracker.spec.ts` (new) — Mocks `gsiServer.onStateChange`: walking-enemy state sequence emits one warning; disabled config emits nothing; config change via `configHolder.setConfig` applies on next second; engine throw → logged, no rethrow, next second still processed; `stopListening` unsubscribes; `reset` clears engine.
- [x] `application/src/dota/matchStateManager.ts` — Start `mapAwarenessTracker` in `startListening()`; call `mapAwarenessTracker.reset()` alongside `roshanTracker.reset()` on idle; reset in `_resetForTesting`.
  - [x] `application/src/dota/matchStateManager.spec.ts` — Tracker started with manager; reset on post-game/disconnect.
- [x] `application/src/main/main.ts` — Call `configHolder.loadFromAppState()` at startup before `registerIpcHandlers`.

### Message Formatting
- [x] `application/src/dota/mapAwareness/heroNames.ts` (new) — `displayName(internal: string)`: override map for heroes whose internal name differs from the in-game name (e.g. `nevermore`→Shadow Fiend, `zuus`→Zeus, `furion`→Nature's Prophet, `obsidian_destroyer`→Outworld Destroyer, `magnataur`→Magnus, `skeleton_king`→Wraith King, `rattletrap`→Clockwerk, `wisp`→Io, `windrunner`→Windranger, `shredder`→Timbersaw, `doom_bringer`→Doom, `life_stealer`→Lifestealer, `queenofpain`→Queen of Pain, `necrolyte`→Necrophos, `abyssal_underlord`→Underlord, `antimage`→Anti-Mage, `vengefulspirit`→Vengeful Spirit, `centaur`→Centaur Warrunner, `treant`→Treant Protector); plus `keeper_of_the_light`→Keeper of the Light (list from known internal names, not verified against a live hero list); fallback = underscores → spaces, Title Case.
  - [x] `application/src/dota/mapAwareness/heroNames.spec.ts` (new) — Overrides map correctly; `crystal_maiden` → "Crystal Maiden" via fallback; empty string → "Enemy".
- [x] `application/src/dota/mapAwareness/messages.ts` (new) — `speechText(warning)`: single → "<Name>, <N> seconds" (N = rounded ETA; 1 → "1 second"; 0 → "<Name>, now"); grouped → "<count> heroes, <N> seconds". `overlayTitle(warning)`: single → "<Name> (fog)" or "<Name>"; grouped → "<count> heroes: <Name1>, <Name2>…".
  - [x] `application/src/dota/mapAwareness/messages.spec.ts` (new) — Rounding 4.4 → 4, 4.5 → 5; 0 → "now"; 1 → singular; grouped texts; fog tag only on fog source.

### Delivery
- [x] `application/src/config/defaultIcons.ts` — Add `MAP_AWARENESS_ICON` (SVG data URI, red warning eye on dark circle, same 64×64 style as existing icons).
  - [x] `application/src/config/defaultIcons.spec.ts` — New icon is a valid data URI and distinct from placeholder.
- [x] `application/src/main/ipcHandlers.ts` — Subscribe `mapAwarenessTracker.onWarning` → send `dota:mapAwarenessWarning` `{ text: speechText(w) }` to main window.
- [x] `application/src/main/overlayNotifier.ts` — Subscribe `mapAwarenessTracker.onWarning` → `overlay:notify` with `eventName: overlayTitle(w)`, `offsetSeconds: round(eta)`, `eventId: 'map-awareness'`, `icon: MAP_AWARENESS_ICON`, `happenTimeMs: (w.clockTime + w.etaSeconds) × 1000` (game timer is synced to `clockTime × 1000`, so the existing card countdown ticks live).
  - [x] `application/src/main/overlayNotifier.spec.ts` — Warning produces one `overlay:notify` with expected title, icon, `happenTimeMs`; destroyed overlay → no send, no throw.
- [x] `application/src/main/preload.ts` + `application/src/renderer/electron.d.ts` — Expose `onMapAwarenessWarning(cb: (text: string) => void) → unsubscribe`.
- [x] `application/src/ui/main/MainDock.tsx` — Subscribe `onMapAwarenessWarning` → `announcer.speak(text, 'high')` (interrupts lower-priority speech; respects mute); unsubscribe on unmount.
  - [x] `application/src/ui/main/MainDock.spec.tsx` — Warning event calls `speak` with text and `'high'`; unsubscribed on unmount.

## Routes & Navigation
| Route | Layout | Access | Nav entry | States (loading/empty/error) | Change |
|---|---|---|---|---|---|
| N/A — no router; overlay window notification stack | Overlay (existing NotificationStack) | local user | hidden (event-driven card) | card auto-hides after existing 5 s visible duration | modify (new card type) |

## Edge Cases & Failure Modes
- [x] Two warnings in consecutive seconds → second high-priority speech interrupts first (latest threat wins) — accepted
- [x] Lead time > 5 s → overlay card hides after 5 s before countdown reaches "now" (existing stack duration) — accepted for v1, noted
- [x] Muted → no voice, overlay still shown
- [x] Overlay disabled in settings → voice only (existing behaviour for Roshan)
- [x] Tracker started before config loaded → `configHolder` default = `DEFAULT_DYNAMIC_EVENTS` entry

## Non-Functional Notes
- Security: IPC payload is plain text built in main from hero names (no HTML rendering of raw GSI strings beyond existing card text nodes).
- Performance: one engine step per game second; IPC only on warnings.
- Observability: `console.info('[map-awareness] warning', { clockTime, heroes, etas })` per warning; `console.error` on engine failure (once per match).
- Rollback: disable "Map Awareness" in Settings (no restart), or remove `startListening` call in `matchStateManager`.

## Verify
- `cd application && npm test` — full suite green
- `cd application && npx tsc --noEmit -p tsconfig.json` — no errors
- Manual: `npm start`, Dota 2 lobby with a bot/friend on the enemy team; walk toward the visible enemy → voice "<Hero>, 5 seconds" and overlay card with countdown ~5 s before contact; let it disappear into fog nearby → fog warning card tagged "(fog)"

## Done When
- [ ] In a live lobby, an approaching visible enemy triggers voice + overlay before contact <!-- blocked: needs a live Dota 2 lobby/match; not runnable in this session -->
- [ ] A nearby enemy vanishing into fog triggers a "(fog)" warning <!-- blocked: needs a live Dota 2 lobby/match; not runnable in this session -->
- [x] Disabling Map Awareness in Settings stops warnings immediately <!-- verified 2026-10-26 -->
- [x] All new/modified tests pass <!-- verified 2026-10-26 -->
- [x] No existing tests broken <!-- verified 2026-10-26 -->

## Changelog
- 2026-10-26: Implemented. Hero override list finalised; fallback title-case for the rest.
