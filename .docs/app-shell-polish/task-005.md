# Task 005 — Create AGENTREADME.md

## Goal
Create an AGENTREADME.md at project root that provides AI agents and new developers with a complete picture of the project: purpose, architecture, tech stack, theming/colors, folder structure, and development workflow.

## Prerequisites
- None (can be done in parallel with other tasks)

## Tasks

### Documentation

- [x] `AGENTREADME.md` — Create file covering: Project abstract (Dota 2 game event announcer with TTS and overlay), Tech stack (Electron, Vite, React, TypeScript, Tailwind CSS, Zod), Architecture overview (main process modules: GSI server, match state, game timer, event scheduler, TTS announcer; renderer: React UI with settings panels; overlay: transparent always-on-top window), Folder structure summary, Theming/colors (dota-dark #1a1a2e, dota-gold #c9a83e, dota-amber #e8b84b, dota-grey #a0a0b0 palette from tailwind config), Key commands (dev, build, test), Data flow (GSI → matchState → gameTimer → scheduler → announcer → overlay) (new)

## Done When
- [x] AGENTREADME.md exists at project root <!-- verified 2026-06-14 -->
- [x] Contains accurate project purpose and abstract <!-- verified 2026-06-14 -->
- [x] Lists tech stack with versions where relevant <!-- verified 2026-06-14 -->
- [x] Describes architecture and data flow <!-- verified 2026-06-14 -->
- [x] Documents color palette / theming tokens <!-- verified 2026-06-14 -->
- [x] Includes folder structure overview <!-- verified 2026-06-14 -->
- [x] Includes key dev commands (dev, build, test, lint) <!-- verified 2026-06-14 -->
- [x] An agent reading this file can understand the project without exploring src/ <!-- verified 2026-06-14 -->
