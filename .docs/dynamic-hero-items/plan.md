# Dynamic Event: Hero Item Notifications

## Summary
Add a new dynamic GSI event that detects when the player's hero acquires a new item and fires a notification overlay message (e.g., "Ursa has Black King Bar"). This follows the same tracker pattern as the existing Roshan dynamic event — notification overlay only, no persistent panel entry. Item changes are detected by comparing the current `items` slot data from GSI against the previous tick's state.

## Scope
**In scope**
- Extend GSI types and parser to extract hero item slot data from the payload
- Implement an `itemsTracker` module following the same pub-sub pattern as `roshanTracker`
- Detect item acquisitions and sales by comparing the full set of items across all 9 slots (slot0–slot8) as a collection, not slot-by-slot
- Fire notification overlay events when a significant item is acquired or sold (filter out consumables/components)
- Add dynamic event config entry for "Hero Items" (enable/disable, configurable item filter or significance threshold)
- Register the tracker in the app lifecycle (start/stop alongside Roshan tracker)
- Wire into `overlayNotifier` to send `overlay:notify` messages for item acquisition events

**Out of scope**
- Persistent panel / countdown display (notification only)
- Tracking enemy heroes' items (GSI player perspective only provides own hero data)
- Spectator/observer multi-hero item tracking
- Audio/TTS changes (existing TTS pipeline handles notifications generically)
- Settings UI changes beyond the dynamic events toggle section

## Acceptance Criteria

| **AC1** | GSI parser extracts item data |
|---------|---|
| Given | A GSI payload is received containing an `items` field with slot data |
| When | The payload is parsed |
| Then | Item names for all 9 inventory slots (slot0–slot8: main + backpack) are extracted into `ParsedGameState` |

| **AC2** | New item acquisition detected via set comparison |
|---------|---|
| Given | The previous tick had item set {A, B, C} across all 9 slots |
| When | The current tick has item set {A, B, C, D} (D is new regardless of which slot) |
| Then | An `item_acquired` event fires with the hero name and item name D |

| **AC3** | Item sold/consumed detected via set comparison |
|---------|---|
| Given | The previous tick had item set {A, B, C, D} across all 9 slots |
| When | The current tick has item set {A, B, C} (D is gone regardless of which slot) |
| Then | An `item_sold` event fires with the hero name and item name D |

| **AC4** | Consumables and minor items filtered out |
|---------|---|
| Given | A new item appears or disappears in inventory |
| When | The item is a consumable (TP scroll, ward, clarity, etc.) or a basic component |
| Then | No notification is fired |

| **AC5** | Notification overlay shows item events |
|---------|---|
| Given | An `item_acquired` or `item_sold` event fires |
| When | The overlay is active |
| Then | A notification appears showing "[Hero] has [Item]" for acquired or "[Hero] sold [Item]" for sold |

| **AC6** | Dynamic event config controls item notifications |
|---------|---|
| Given | The "Hero Items" dynamic event is disabled in config |
| When | A new item is acquired or sold |
| Then | No notification fires |

| **AC7** | Slot swaps do not trigger false notifications |
|---------|---|
| Given | A hero moves an item from slot 2 to slot 5 |
| When | The set of item names across all 9 slots remains the same |
| Then | No notification fires |

| **AC8** | Tracker resets between matches |
|---------|---|
| Given | A match ends and a new match starts |
| When | The match ID changes |
| Then | The item tracker resets its previous state so the first inventory snapshot of the new match does not fire notifications |

## Open Questions
> None — all resolved.

## Estimate
**Story Points**: 13 SP (~26 days)
> raw SP = (8 AC x 2) + 0 OQ = 16, rounded to nearest Fibonacci = 13. 1 SP = 2 days.

## Decisions
- Item display name: strip `item_` prefix, replace underscores with spaces, title-case (no lookup table)
- Track all items above component tier — filter out consumables and basic components only (no configurable notable items list)

## Notes
- GSI `items` field structure (from sample): each slot has `name` (e.g., `"item_swift_blink"`, `"item_butterfly"`, `"empty"`), `purchaser`, `item_level`, `can_cast`, `cooldown`, `passive`
- Inventory slots: `slot0`–`slot5` (main), `slot6`–`slot8` (backpack), `stash0`–`stash5`, `teleport0`, `neutral0`–`neutral1`
- Compare all 9 slots (slot0–slot5 main + slot6–slot8 backpack) as one collection — stash/teleport/neutral excluded
- The tracker compares multisets of item names (not slot positions) to handle slot swaps without false positives
- Multiset comparison needed because heroes can have duplicate items (e.g., 4x Butterfly in sample data)
- Internal item names follow pattern `item_<snake_case_name>` — can derive display name by stripping `item_` prefix and converting to title case
- Follows same architecture as `roshanTracker`: subscribes to `gsiServer.onStateChange()`, maintains previous state, fires events to registered listeners
- Config entry goes into `DEFAULT_DYNAMIC_EVENTS` alongside Roshan with structure: `{ id: "hero-items", name: "Hero Items", enabled: true, notifications: { acquired: true, sold: true } }`

## Changelog
- 2026-06-17: Created plan. Resolved OQ1 — use string manipulation (strip prefix + title-case) for display names. Resolved OQ2 — track all non-consumable/non-component items, no configurable list.
- 2026-06-17: Updated — comparison is multiset-based across all 9 slots (not slot-by-slot). Added item sold detection (AC3). Removed "item loss/sell detection" from out-of-scope.
