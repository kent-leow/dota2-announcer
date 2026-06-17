# Task 004 — Overlay Notifier: Item Event Notifications

## Goal
Wire item events into the overlay notifier so `overlay:notify` messages are sent to the notification overlay. Verified by: acquiring/selling an item shows a notification in the overlay.

## Prerequisites
- [ ] task-003.md completed

## Tasks

### Overlay Notifier

- [x] `application/src/main/overlayNotifier.ts` — Import `onItemEvent` from `itemsTracker`; in `initOverlayNotifier`, subscribe to item events; format message as `"[HeroName] has [ItemName]"` for acquired, `"[HeroName] sold [ItemName]"` for sold; send via `overlay:notify` with `eventId: "hero-items"` and `offsetSeconds: 0`
  - [x] `application/src/main/overlayNotifier.spec.ts` — Add tests: item_acquired sends notification with correct eventName format; item_sold sends notification with correct eventName format; does not send if overlay is null; does not send if overlay is destroyed

## Done When
- [x] Item acquired shows "[Hero] has [Item]" notification in overlay <!-- verified 2026-06-17 -->
- [x] Item sold shows "[Hero] sold [Item]" notification in overlay <!-- verified 2026-06-17 -->
- [x] Null/destroyed overlay handled gracefully <!-- verified 2026-06-17 -->
- [x] All new and modified tests pass <!-- verified 2026-06-17 -->
- [x] No existing tests broken <!-- verified 2026-06-17 -->
