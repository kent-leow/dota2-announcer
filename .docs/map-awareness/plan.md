# Dynamic Event: Map Awareness (Enemy Missing/Approaching)

## Summary
Add a new dynamic GSI event that tracks enemy hero visibility on the minimap and warns the player when heroes go missing or are approaching. The system detects fog-of-war transitions (enemy disappearing from minimap data), estimates threat using dead reckoning (expanding reachability radius), vector-based approach detection (was enemy moving toward you?), and time-decay confidence scoring. This follows the same tracker pattern as Roshan and Hero Items — notification overlay only, no persistent panel entry.

## Scope
**In scope**
- Extend GSI types and parser to extract minimap data (enemy hero positions, yaw, team) from the payload
- Implement a `mapAwarenessTracker` module following the same pub-sub pattern as `roshanTracker` and `itemsTracker`
- Detect fog-of-war transitions: enemy hero appearing/disappearing from minimap entries
- Track last known position, facing direction (yaw), and velocity vector for each enemy hero
- Implement dead reckoning: compute expanding threat radius based on assumed movement speed and elapsed time
- Implement vector-based approach detection: dot product of enemy's last velocity vector against direction toward player's hero
- Implement time-decay confidence model: threat score decreases as time-since-last-seen increases
- Implement proximity alert: warn when a recently-fogged enemy was close to the player
- Fire notification overlay events with configurable alert types (missing, approaching, nearby danger)
- Add dynamic event config entry for "Map Awareness" with sub-toggles (missing alerts, approach warnings)
- Register the tracker in the app lifecycle alongside existing trackers
- Wire into `overlayNotifier` for overlay notifications
- Extract player's own hero position (`hero.xpos`, `hero.ypos`) into parsed game state for distance calculations

**Out of scope**
- Terrain-aware pathfinding / navmesh flood-fill (v2 enhancement)
- TP scroll detection or blink dagger awareness for enemies (enemy items not available in player GSI)
- Spectator/observer mode (full-vision tracking)
- Smoke of Deceit detection beyond "multiple heroes disappearing simultaneously"
- Audio/TTS changes (existing TTS pipeline handles notifications generically)
- Settings UI changes beyond the dynamic events toggle section
- Persistent panel entry (notification only, events are ephemeral)

## Acceptance Criteria

| **AC1** | GSI parser extracts minimap hero data |
|---------|---|
| Given | A GSI payload is received containing a `minimap` section with enemy hero entries (`image: "minimap_enemyicon"`) |
| When | The payload is parsed |
| Then | Enemy hero positions (xpos, ypos), facing direction (yaw), hero name, and team are extracted and available to the tracker |

| **AC2** | GSI parser extracts player hero position |
|---------|---|
| Given | A GSI payload is received containing `hero.xpos` and `hero.ypos` fields |
| When | The payload is parsed |
| Then | The player's own world coordinates are available in `ParsedGameState` for distance calculations |

| **AC3** | Fog-of-war transition detected (hero goes missing) |
|---------|---|
| Given | An enemy hero was present in the minimap data on the previous tick |
| When | That hero is absent from the current tick's minimap data and is not dead |
| Then | A "hero missing" event fires recording the hero name, last known position, last known velocity, and timestamp |

| **AC4** | Fog-of-war transition detected (hero reappears) |
|---------|---|
| Given | An enemy hero was tracked as "missing" |
| When | That hero reappears in the minimap data |
| Then | The hero's missing state is cleared and tracking resumes with fresh position data |

| **AC5** | Proximity alert on nearby disappearance |
|---------|---|
| Given | An enemy hero disappears from minimap within a configurable distance threshold of the player's hero (default: 3000 units) |
| When | The fog transition is detected |
| Then | An immediate "Hero X missing nearby!" notification fires |

| **AC6** | Approach detection warns when enemy was heading toward player |
|---------|---|
| Given | An enemy hero's velocity vector (computed from position samples before disappearance) has a dot product > 0.6 against the direction toward the player |
| When | The hero enters fog within a threshold distance (default: 4000 units) |
| Then | An "Enemy approaching!" notification fires with the hero name |

| **AC7** | Dead reckoning threat radius expands over time |
|---------|---|
| Given | An enemy hero has been missing for N seconds with assumed movement speed S |
| When | The threat radius (S × N) overlaps the player's position |
| Then | A "Hero X could reach you" warning fires (only once per missing period per hero) |

| **AC8** | Time-decay suppresses stale alerts |
|---------|---|
| Given | An enemy hero has been missing for longer than a configurable decay threshold (default: 15 seconds) |
| When | The confidence score drops below a minimum threshold |
| Then | No further approach/reachability warnings fire for that hero until new information arrives |

| **AC9** | Dead heroes do not trigger missing alerts |
|---------|---|
| Given | An enemy hero disappears from the minimap |
| When | The game's kill feed or hero status indicates the hero is dead |
| Then | No "missing" alert fires; the hero is tracked as "dead" until respawn |

| **AC10** | Dynamic event config controls map awareness notifications |
|---------|---|
| Given | The "Map Awareness" dynamic event is disabled in config or specific sub-notifications are toggled off |
| When | A fog transition or threat condition occurs |
| Then | No notification fires for disabled alert types |

| **AC11** | Tracker resets between matches |
|---------|---|
| Given | A match ends and a new match starts |
| When | The match ID changes |
| Then | All enemy tracking state (positions, missing status, velocity history) is cleared |

| **AC12** | Alert cooldown prevents notification spam |
|---------|---|
| Given | A notification was fired for a specific enemy hero |
| When | The same alert type would fire again within a configurable cooldown period (default: 8 seconds per hero) |
| Then | The duplicate notification is suppressed |

## Open Questions
> None — all resolved.

## Estimate
**Story Points**: 21 SP (~42 days)
> raw SP = (12 AC × 2) + 0 OQ = 24, rounded to nearest Fibonacci = 21. 1 SP = 2 days.

## Notes
- **Algorithm summary**: Layered approach — L0 (fog transition detection) → L1 (proximity alert) → L2 (dead reckoning + time decay) → L3 (vector approach detection). All layers combined cost <1ms per tick.
- **GSI minimap structure**: Flat object with keys `o0`, `o1`, ... Each entry has `xpos`, `ypos`, `yaw`, `image`, `team`, `name`, `unitname`. Filter by `image === "minimap_enemyicon"` for enemy heroes.
- **Coordinate system**: Map ranges approximately -8100 to +8100 on both axes (~16,000 × 16,000 unit playable area).
- **Movement speed assumptions**: Assume 350 units/sec base (accounts for boots) since enemy item data is unavailable. Speed cap is 550.
- **Velocity calculation**: Compare enemy position between consecutive ticks. With ~1 Hz GSI updates, velocity = `(pos_current - pos_previous) / delta_time`.
- **Approach score**: `dot(normalize(velocity), normalize(player_pos - enemy_pos))`. Values >0.6 indicate "heading toward player".
- **Decay function**: `confidence = 1 / (1 + 0.15 * elapsed_seconds)`. At 3s: 0.69, 8s: 0.45, 15s: 0.31, 30s: 0.18.
- **Config structure**: `{ id: "map-awareness", name: "Map Awareness", enabled: true, notifications: { missing: true, approaching: true, reachable: true } }`
- **Anti-cheat**: Feature uses ONLY Valve-provided GSI data (visible minimap). No memory reading, packet sniffing, or fog penetration. Equivalent to a human watching the minimap carefully.
- **`previously` section**: GSI delta encoding shows changed fields from last tick — can be used for velocity without storing state, but explicit state tracking is more reliable.
- **Death detection (OQ1 resolved)**: GSI `events` array contains `CHAT_MESSAGE_HERO_KILL` entries with `playerid` fields. Parse these to detect enemy deaths and suppress false "missing" alerts for dead heroes. Respawn time can be estimated from hero level.
- **Update frequency (OQ2 resolved)**: GSI dump confirms 1Hz updates (`game_time` increments by 1 per tick). Velocity calculation from consecutive position samples is viable at this rate — gives ~1 sample/sec, sufficient for approach vector with some noise tolerance.

## Changelog
- 2026-06-17: Created plan.
- 2026-06-17: Resolved OQ1 — GSI `events` array has `CHAT_MESSAGE_HERO_KILL` for death detection. Resolved OQ2 — confirmed 1Hz update rate from GSI dump (`game_time` 664→665).
