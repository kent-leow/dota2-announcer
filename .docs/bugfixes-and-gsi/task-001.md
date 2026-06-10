# Task 001 — GSI HTTP Server & Game State Parser

## Goal
Create a local HTTP server that receives Dota 2 Game State Integration payloads and exposes parsed match state (game phase, clock time, match ID) to the rest of the app.

## Prerequisites
- None

## Tasks

### GSI Server

- [x] `src/dota/gsiServer.ts` — create HTTP server on port 3001; accept POST `/`; parse JSON body; emit parsed state to registered listeners (new)
  - [x] `src/dota/gsiServer.spec.ts` — server starts/stops; parses valid payload; ignores malformed body; emits state change on game phase transition (new)

### GSI Payload Types

- [x] `src/dota/gsiTypes.ts` — define TypeScript interfaces for GSI payload structure (map.game_state, map.clock_time, map.matchid, player, hero) (new)

### GSI Config File Template

- [x] `config/gamestate_integration_announcer.cfg` — provide the Dota 2 GSI config file users copy into their game directory (new)

## Done When
- [x] HTTP server starts on port 3001 and accepts POST requests <!-- verified 2026-06-10 -->
- [x] Valid Dota 2 GSI payloads are parsed into typed game state objects <!-- verified 2026-06-10 -->
- [x] Listeners are notified when game state changes (e.g., game_state field transitions) <!-- verified 2026-06-10 -->
- [x] Invalid/empty payloads are handled gracefully without crashing <!-- verified 2026-06-10 -->
- [x] GSI config file exists with correct format pointing to localhost:3001 <!-- verified 2026-06-10 -->
- [x] All new tests pass <!-- verified 2026-06-10 -->
