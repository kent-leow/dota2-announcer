# Task 001 — GSI Types & Parser: Extract Item Slots

## Goal
Extend the GSI type definitions and parser to extract item names from all 9 inventory slots (slot0–slot8) and hero name into `ParsedGameState`. Verified by: parsed state includes item array and hero name from raw GSI payload.

## Prerequisites
- None

## Tasks

### Type Definitions

- [x] `application/src/dota/gsiTypes.ts` — Add `GsiItems` interface (slot0–slot8 each with `name: string`); add `items?: GsiItems` to `GsiPayload`; add `heroName: string` and `items: string[]` to `ParsedGameState`
  - [x] `application/src/dota/gsiServer.spec.ts` — Add tests: payload with items field parses item names for slot0–slot8; empty slots excluded from array; payload without items field returns empty array; hero name extracted from `hero.name` field; missing hero returns empty string

### Parser

- [x] `application/src/dota/gsiServer.ts` — In `parsePayload`, extract `data.items` slot0–slot8 names (filter out `"empty"`), extract `data.hero?.name` (strip `npc_dota_hero_` prefix); populate new `ParsedGameState` fields

## Done When
- [x] `ParsedGameState` contains `items: string[]` with non-empty slot names from slot0–slot8 <!-- verified 2026-06-17 -->
- [x] `ParsedGameState` contains `heroName: string` with cleaned hero name <!-- verified 2026-06-17 -->
- [x] Payloads without `items` or `hero` field parse without error (defaults to empty) <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
