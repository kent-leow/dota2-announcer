# Map Awareness: Enemy Arrival-Time Warning

## Summary
Warn the player a few seconds **before** an enemy hero can reach them. Using only what the player's own team can already see on the minimap (no fog-of-war bypass), the app learns how fast each enemy hero actually moves, predicts when an approaching enemy, or one that just disappeared into fog, could arrive at the player's position, and announces it ahead of time. Example: "Tidehunter, 5 seconds." This is the product's flagship differentiator, so accuracy is measured against recorded real matches and has explicit pass targets, rather than being judged by feel.

## Scope
**In scope**
- Read every enemy hero currently visible on the minimap: hero name, position and facing
- Identify each enemy by hero name, never by its position in the minimap list (the list order reshuffles between updates)
- Read the player's own hero position, alive state and side (Radiant or Dire) and treat the opposite side as enemies
- Learn each enemy's real movement speed from its observed movement while visible, because the game feed provides no speed value
- Filter out invalid speed samples: blinks/teleports (impossible jumps), standing still, paused game and gaps across fog
- Fall back to a safe default speed when an enemy has not been observed long enough
- **Visible-enemy ETA**: for a visible enemy closing in on the player, predict seconds until it reaches engage distance, based on how fast the gap is actually shrinking
- **Fog ETA**: for an enemy that vanished into fog, predict the earliest time it could reach the player, assuming it keeps coming at its learned speed by the most direct route, from its last seen position to the player's **current** position
- Predict fog arrival for **every** enemy that vanished, whichever way it was heading; an enemy heading away only gets a small turn-around allowance added (a false warning is preferred over a missed one); stop predicting after a maximum fog age
- Warn when the predicted arrival time drops to the configured lead time (e.g. 5 seconds), with hero name and seconds, via voice and overlay
- One warning per threat episode per hero, re-armed only when a new episode starts
- Grouped warning when two or more enemies are threatening at the same time (possible gank or smoke)
- Exclude an enemy as dead only when it can be pinned to a specific kill; when unsure, treat it as alive (false warning preferred)
- Freeze all predictions while the game is paused
- No warnings while the player is dead; reset all tracking between matches
- Settings: master on/off, toggles for visible and fog warnings, lead time, engage distance, maximum fog age
- Record a full match's game feed and replay it through the warning engine offline, to measure and tune accuracy
- Accuracy report with pass targets (see AC18)

**Out of scope**
- Revealing anything not already visible to the player's team (any fog bypass)
- Terrain/pathfinding-aware routes (straight-line worst case used instead; candidate for v2)
- Enemy items, buffs or abilities (Blink, Force Staff, Haste, invisibility) not exposed to the player feed. Covered only by safety margins
- Spectator/observer full-vision mode
- Persistent panel entry (warnings are ephemeral)

## Acceptance Criteria

| **AC1** | Visible enemies read and identified by name |
|---------|---|
| Given | The minimap shows enemy heroes and the order of minimap entries differs from the previous update |
| When | The update is processed |
| Then | Each enemy is matched to its own history by hero name, with correct position and facing; allies and the player's own hero are never treated as enemies |

| **AC2** | Player position and side |
|---------|---|
| Given | The player is on Radiant or Dire |
| When | An update is processed |
| Then | The player's own position, alive state and side are known, and enemies are the opposite side |

| **AC3** | Speed learned from observed movement |
|---------|---|
| Given | An enemy has been continuously visible for at least 3 consecutive game seconds while moving |
| When | Its speed is estimated |
| Then | The estimate is within ±15% of its true average speed over that window and never exceeds the game's maximum movement speed (550) |

| **AC4** | Invalid speed samples rejected |
|---------|---|
| Given | An enemy jumps further between two updates than the maximum speed allows (blink/teleport), stands still, or reappears after fog |
| When | The speed estimate is updated |
| Then | That sample is excluded and the previous estimate is kept |

| **AC5** | Safe fallback speed |
|---------|---|
| Given | An enemy has fewer than 3 valid speed samples |
| When | An arrival time is needed |
| Then | A default speed of 350 is used (deliberately fast, so warnings come early rather than late) |

| **AC6** | Visible-enemy arrival time |
|---------|---|
| Given | A visible enemy's distance to the player has shrunk by at least 100 units/second on average over the last 3 game seconds |
| When | Arrival time is computed |
| Then | Arrival time = (current distance − engage distance) ÷ measured closing rate; an enemy already inside engage distance has arrival time 0 |

| **AC7** | Fog arrival time (worst case) |
|---------|---|
| Given | An enemy vanished into fog N seconds ago with a learned speed S, heading in any direction |
| When | Each game second passes |
| Then | Earliest arrival time = (straight-line distance from its last seen position to the player's current position − engage distance − S × N) ÷ S, never negative, recalculated as the player moves; if it was heading away (more than 90° off the direction to the player) a turn-around allowance (default 1 s) is added, and it is never excluded from warnings |

| **AC8** | Fog prediction expires |
|---------|---|
| Given | An enemy has been in fog longer than the maximum fog age (default 20 seconds) |
| When | Predictions run |
| Then | No further fog warnings fire for that enemy until it is seen again |

| **AC9** | Warning fires at lead time |
|---------|---|
| Given | An enemy's arrival time (visible or fog) is above the lead time (default 5 seconds) |
| When | It drops to or below the lead time |
| Then | A warning fires within the same game second |

| **AC10** | Warning content |
|---------|---|
| Given | A warning fires |
| When | It is shown and spoken |
| Then | The overlay shows the enemy hero icon/name, whether it is visible or in fog, and a live countdown to arrival; voice says the hero name and seconds (e.g. "Tidehunter, 5 seconds") |

| **AC11** | One warning per threat episode |
|---------|---|
| Given | A warning fired for an enemy |
| When | That enemy's arrival time stays at or below lead time, or flickers around it |
| Then | No repeat warning fires; it re-arms only after the enemy is seen moving away (arrival time rises above lead time + 3 seconds), reappears from fog, or the fog prediction expires |

| **AC12** | Grouped gank warning |
|---------|---|
| Given | Two or more enemies have arrival times at or below lead time within the same 3-second window |
| When | Warnings would fire |
| Then | A single grouped warning fires listing the number of heroes and the earliest arrival time (e.g. "3 heroes, 4 seconds") instead of separate warnings |

| **AC13** | Dead enemy identified by elimination |
|---------|---|
| Given | The player's team kill score rises by K, and within the same 2 game seconds exactly K enemies vanish from the minimap |
| When | Fog prediction would start |
| Then | Those K enemies are marked dead and get no fog prediction until seen again; if the number of vanished enemies is not exactly K, all of them are treated as alive and predicted normally |

| **AC14** | Pause freezes predictions |
|---------|---|
| Given | The game is paused |
| When | Real time passes |
| Then | Fog time, arrival times and countdowns do not advance; no warnings fire until unpaused |

| **AC15** | Silent while player is dead |
|---------|---|
| Given | The player's hero is dead |
| When | Any threat condition occurs |
| Then | No warning fires; tracking continues so state is correct on respawn |

| **AC16** | Reset between matches |
|---------|---|
| Given | A match ends or a new one starts (match ID may be "0" in lobby/practice games) |
| When | The match ID changes, the game leaves in-progress state, or the game clock goes backwards |
| Then | All enemy history, speeds and pending warnings are cleared |

| **AC17** | Player settings |
|---------|---|
| Given | The player changes master toggle, visible/fog toggles, lead time (2–15 s), engage distance (300–1500) or maximum fog age (5–40 s) |
| When | The next game second is processed |
| Then | The new settings apply without restart; disabled warning types never fire |

| **AC18** | Match recording and offline replay |
|---------|---|
| Given | Recording is enabled for a match |
| When | The match ends |
| Then | Every game-feed update is saved, and replaying it through the warning engine produces exactly the same warnings, in the same game seconds, as the live run |

| **AC19** | Accuracy targets met on recorded matches |
|---------|---|
| Given | At least 5 recorded real matches, with "arrivals" labelled where an enemy actually came within engage distance of the player |
| When | The replay accuracy report runs |
| Then | **Pass gate:** ≥ 80% of walking arrivals were warned with ≥ 3 s notice (median error ≤ 1.5 s for visible warnings). False warnings are counted and reported for tuning but are **not** a pass/fail gate (missing a real arrival is worse than a false warning). Report lists every miss and false warning |

## Open Questions
| # | Question | Impact if unresolved |
|---|----------|----------------------|
| OQ1 | **Deferred:** user will record at least 5 full real matches after recording (AC18) ships. Does not block building; blocks AC19 sign-off only. | Speed learning, thresholds and accuracy cannot be validated until recordings exist |

## Estimate
**Story Points**: 55 SP (~110 days)
> raw SP = (19 AC × 2) + 1 OQ = 39, rounded up to nearest Fibonacci = 55. 1 SP = 2 days.

## Notes
**Dump evidence (2 snapshots, game second 64 and 832)**
- **No movement speed data** anywhere in the feed: not for the player's hero, not for enemies, not on the minimap. Speed must be learned from movement (AC3–AC5).
- Visible enemies carry: hero name, side, position, facing (−180…180°), vision range. Only 2 of 5 enemies were listed at 832 s → feed respects fog.
- Minimap list order is **not stable**: the same list slot held an ally at 831 s and an enemy at 832 s. The feed's "previous values" section is keyed by slot too, so it cannot be used for enemy movement. The app must keep its own per-hero history.
- Player's own position on the hero data equals its minimap position → one shared coordinate space (≈ −8200…+8200), no calibration.
- Feed updates every game second during play (game clock changes each second), so predictions are evaluated per game second. Pause stops the clock → naturally freezes (AC14).
- No per-enemy alive/dead flag and no hero-kill events in the feed. The player's own kill list names victims only by player slot (no hero name). Team kill score is the only all-team death signal → specific dead hero found by elimination (AC13). Works because a kill almost always happens inside the killing team's vision, so the victim is usually visible right before it vanishes. Denies, suicides and neutral-creep deaths may not raise the score → that enemy stays "alive" (safe side).
- Match ID is "0" in practice lobbies (AC16).

**Prediction model (reference)**
- Learned speed = distance travelled ÷ game seconds, over a rolling 3-second window of continuous visibility; capped at 550; samples implying > 550 × 1.2 rejected as blink/teleport; samples < 50 units/s ignored (idle).
- Visible ETA uses the **measured closing rate** of the distance (it already reflects both heroes' movement and real pathing), not raw speed.
- Fog ETA is a **worst case**: straight line, at learned speed but never below 350 (observed averages underestimate heroes that are last-hitting or juking), starting from the moment it was last seen. Straight line makes warnings early, never late.
- Direction does not exclude anyone: heading away only adds the turn-around allowance (default 1 s, tune from recordings). Main noise limiter is the maximum fog age: at 350 speed, 20 s of fog + 5 s lead covers ≈ 8,750 units, so most enemies in fog nearby can trigger. Accepted: a false warning is better than a miss.
- Heading toward player = facing/movement direction within ±60° of the direction to the player at the moment of vanishing.
- Real Dota hero speeds ≈ 270–330 base, ≈ 315–420 with boots, max 550.
- 1-second update rate means arrival-time precision is roughly ±1 s; default lead time 5 s leaves headroom.

**Known limitations (communicate to users)**
- Blink, Force Staff, teleports, Haste rune, invisibility and speed buffs used **in fog** cannot be seen → earlier-than-predicted arrivals are possible.
- Straight-line worst case may warn about enemies blocked by cliffs/trees.
- Illusions/clones share hero names; the entry closest to the previous known position is followed.

**Anti-cheat**: uses only Valve-provided Game State Integration data that the player can already see. Equivalent to an attentive player watching the minimap.

## Changelog
- 2026-06-17: Created plan.
- 2026-06-17: Resolved OQ1 — GSI `events` array has `CHAT_MESSAGE_HERO_KILL` for death detection. Resolved OQ2 — confirmed 1Hz update rate from GSI dump (`game_time` 664→665).
- 2026-10-26: Reviewed GSI sample dumps. Added visible-nearby alert (AC13), side detection (AC14), suppress-while-dead (AC15), 1s game-clock timer in scope. Reworked AC9 (no hero-kill event in dump → kill-score proxy) and AC11 (match ID is "0" in dump). Reopened death-detection as OQ1; added OQ2 (default values). Estimate 21 → 34 SP.
- 2026-10-26: Rethought plan around an Enemy Arrival-Time (ETA) warning engine. Confirmed the game feed has NO movement-speed field → speed is learned from observed movement. Found minimap slot keys reshuffle between updates → heroes identified by name only. Replaced radius/decay/proximity ACs with speed learning, visible ETA, fog ETA, lead-time warning, episode/re-arm, gank grouping, pause handling, recording/replay and measurable accuracy target. Removed implementation detail (file/module names) per plan rules. Corrected earlier note: evaluation can be driven by the per-second game feed (clock changes every second), no separate timer needed. Estimate 34 → 55 SP.
- 2026-10-26: OQ4 resolved — fog warnings for all enemies regardless of direction; heading away adds 1 s turn-around allowance (AC7, Scope, Notes). OQ1 deferred (recordings later; blocks AC19 sign-off only). Estimate unchanged 55 SP.
- 2026-10-26: OQ2 resolved — dead enemy identified by elimination (score rise K + exactly K enemies vanish), otherwise treated alive (AC13). OQ3 resolved — prefer false warnings over misses: catch rate is the only pass gate, false warnings reported but not gating (AC19). Estimate unchanged 55 SP.
- 2026-10-26: Implemented task-001…008. Fog speed floor of 350 applied (Notes). Live-lobby checks and AC19 sign-off pending (OQ1).
