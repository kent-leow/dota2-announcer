# Task 002 — Items Tracker: Detection Logic

## Goal
Implement `itemsTracker` module that detects item acquisitions and sales via multiset comparison across ticks, following the same pub-sub pattern as `roshanTracker`. Verified by: events fire on item add/remove but not on slot swaps.

## Prerequisites
- [ ] task-001.md completed

## Tasks

### Item Filter

- [x] `application/src/dota/itemFilter.ts` — Export `isNotableItem(name: string): boolean` that returns false for consumables (tpscroll, ward_observer, ward_sentry, clarity, tango, enchanted_mango, faerie_fire, smoke_of_deceit, dust, bottle, flask) and basic components (branches, circlet, slippers, mantle, band_of_elvenskin, robe, gauntlets, belt_of_strength, blades_of_attack, chainmail, quarterstaff, helm_of_iron_will, broadsword, claymore, javelin, mithril_hammer, ring_of_protection, stout_shield, quelling_blade, ring_of_regen, sobi_mask, boots, gloves, cloak, gem, magic_stick); returns true otherwise (new)
  - [x] `application/src/dota/itemFilter.spec.ts` — Tests: consumables return false; basic components return false; completed items (black_king_bar, butterfly, blink) return true; empty string returns false (new)

### Display Name Formatter

- [x] `application/src/dota/itemNameFormatter.ts` — Export `formatItemName(internalName: string): string` that strips `item_` prefix, replaces underscores with spaces, title-cases each word (new)
  - [x] `application/src/dota/itemNameFormatter.spec.ts` — Tests: `item_black_king_bar` → `"Black King Bar"`; `item_butterfly` → `"Butterfly"`; `item_swift_blink` → `"Swift Blink"`; already stripped name handles gracefully (new)

### Tracker Module

- [x] `application/src/dota/itemsTracker.ts` — Export `ItemEventType = 'item_acquired' | 'item_sold'`; `ItemEvent { type, heroName, itemName, displayName }`; `onItemEvent(callback): unsubscribe`; `startListening()` / `stopListening()` / `_resetForTesting()`; internally subscribe to `gsiServer.onStateChange`, maintain previous item multiset (Map<string, count>), compare current vs previous to detect added/removed items, filter via `isNotableItem`, check dynamic event config (`id: "hero-items"`), reset on matchId change, skip first tick of new match (new)
  - [x] `application/src/dota/itemsTracker.spec.ts` — Tests: detects new item acquired; detects item sold; slot swap (same multiset) fires no event; duplicate items handled (4x butterfly → 5x fires one acquired); consumables filtered out; disabled config fires no event; match ID change resets state without firing; first tick of match does not fire; individual notification toggles (acquired/sold) respected (new)

## Done When
- [x] Item acquisition fires `item_acquired` event with hero name and formatted item name <!-- verified 2026-06-17 -->
- [x] Item removal fires `item_sold` event with hero name and formatted item name <!-- verified 2026-06-17 -->
- [x] Slot swaps (same item set) produce no events <!-- verified 2026-06-17 -->
- [x] Duplicate items tracked correctly (multiset) <!-- verified 2026-06-17 -->
- [x] Consumables/components filtered out <!-- verified 2026-06-17 -->
- [x] Tracker resets on match change without spurious events <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
