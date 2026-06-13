# Task 005 — Create AGENTREADME.md

## Goal
Create an AGENTREADME.md at project root that provides AI agents and new developers with a complete picture of the project: purpose, architecture, tech stack, theming/colors, folder structure, and development workflow.

## Prerequisites
- None (can be done in parallel with other tasks)

## Tasks

### Documentation

- [ ] `AGENTREADME.md` — Create file covering: Project abstract (Dota 2 game event announcer with TTS and overlay), Tech stack (Electron, Vite, React, TypeScript, Tailwind CSS, Zod), Architecture overview (main process modules: GSI server, match state, game timer, event scheduler, TTS announcer; renderer: React UI with settings panels; overlay: transparent always-on-top window), Folder structure summary, Theming/colors (dota-dark #0d1117, dota-gold, dota-amber, dota-grey palette from tailwind config), Key commands (dev, build, test), Data flow (GSI → matchState → gameTimer → scheduler → announcer → overlay) (new)

## Done When
- [ ] AGENTREADME.md exists at project root
- [ ] Contains accurate project purpose and abstract
- [ ] Lists tech stack with versions where relevant
- [ ] Describes architecture and data flow
- [ ] Documents color palette / theming tokens
- [ ] Includes folder structure overview
- [ ] Includes key dev commands (dev, build, test, lint)
- [ ] An agent reading this file can understand the project without exploring src/
