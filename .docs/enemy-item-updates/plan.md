# Enemy Item Update Announcements

## Summary
When an enemy hero becomes visible on the map again, tell the player which new items that enemy has picked up since it was last seen (for example, "Nevermore: Black King Bar, Blink Dagger"). This lets the player spot key enemy power spikes without clicking each enemy hero. **Feasibility is blocked:** the game feed this app uses in normal player mode reports items only for the player's own hero. For enemies, it gives only hero name, map position and facing. Delivery depends on finding an approved source of enemy item data (see Open Questions).

## Scope
**In scope**
- Detect when an enemy hero goes from not visible to visible on the minimap, identified by hero name
- Get that enemy's current items from an approved data source, but only while the enemy is visible to the player's team
- Remember each enemy's last known items and compare them with the newly seen items
- Announce only new significant items (no consumables or components) by voice and overlay notification
- On the first sighting of an enemy in a match, set a baseline quietly
- Group several new items for one enemy into a single announcement
- Settings: on/off toggle and a significant-item filter consistent with the player's own item notifications
- Reset all enemy item memory between matches
- If no approved enemy item source is available, the feature stays disabled and the player is told why

**Out of scope**
- Revealing anything the player's team cannot already see (any fog-of-war bypass)
- Announcing items that were sold or dropped
- Spectator or observer full-vision mode
- Persistent panel display of enemy inventories
- Enemy neutral items, buffs or ability upgrades (unless the approved source exposes them, to revisit later)

## Acceptance Criteria

| **AC1** | Enemy reappearance detected |
|---------|---|
| Given | An enemy hero was not visible on the minimap in the previous update |
| When | It appears on the minimap in the current update |
| Then | A single "enemy sighted" moment is recorded for that hero by name, regardless of minimap list ordering; allies and the player's own hero never trigger it |

| **AC2** | New significant items announced |
|---------|---|
| Given | An enemy was last seen with a known set of items and has since gained one or more significant items |
| When | That enemy reappears |
| Then | Within 1 second, one voice and overlay announcement names the hero and lists only the newly gained significant items |

| **AC3** | First sighting baseline is silent |
|---------|---|
| Given | An enemy has not been seen yet in the current match |
| When | It becomes visible for the first time |
| Then | Its items are stored as the baseline and nothing is announced |

| **AC4** | No change, no announcement |
|---------|---|
| Given | An enemy reappears with no new significant items, or has only gained consumables or components |
| When | The reappearance is processed |
| Then | Nothing is announced and the stored items are updated |

| **AC5** | No fog-of-war bypass |
|---------|---|
| Given | An enemy is not visible to the player's team |
| When | Updates are processed |
| Then | Its items are neither read nor updated nor announced |

| **AC6** | Setting and match reset |
|---------|---|
| Given | The feature toggle is off, or a new match starts |
| When | Enemies are sighted |
| Then | With the toggle off, nothing is announced; after a new match starts, all enemies return to first-sighting baseline behaviour |

| **AC7** | Data source unavailable |
|---------|---|
| Given | No approved source provides enemy item data for the current match |
| When | The player opens the feature settings |
| Then | The feature is shown as unavailable with a one-line reason, and no enemy item announcements are made |

## Open Questions

| # | Question | Impact if unresolved |
|---|----------|----------------------|
| 1 | Which data source provides enemy items in normal player mode? The current game feed gives enemies' name, position and facing only, never their items. | **Blocking**: without a source, the feature cannot be built |
| 2 | Does every candidate source, such as screen reading or an external live-match service, comply with Valve's rules and avoid any risk to the player's account? | **Blocking**: a non-compliant source cannot be shipped |
| 3 | Should the significant-item list match the player's own item notifications or be a separate enemy-specific list? | Non-blocking: the default reuses the existing list |
| 4 | Should there be a cooldown per enemy, so a hero that flickers in and out of vision does not cause repeated checks? | Non-blocking: the default is no cooldown, because unchanged items are silent anyway |

## Estimate
**Story Points**: 21 SP (~42 days)
> raw SP = (7 × 2) + 4 = 18 → 21. Assumes a data source is found. If Open Question 1 cannot be resolved, the work is cancelled.

## Notes
- Verified against a recorded game feed sample from a real match. The player's own hero has full item slots. Visible enemy heroes appear only as minimap entries with hero name, position, facing and team, with no item data.
- The existing own-hero item notifications and map-awareness plans already list enemy items as out of scope for the same reason.
- Enemy sighting detection (AC1) can reuse the enemy visibility tracking from map awareness.
- Spectator mode does expose every player's items, but it is out of scope because players use the app during their own matches.
- Recommendation: run a spike on Open Questions 1 and 2 before any implementation.
