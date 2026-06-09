# Task 005 — README Documentation

## Goal
Write a comprehensive README.md that enables developers to set up the project and users to understand, install, and configure the app.

## Prerequisites
- [x] task-003.md completed (UI must be themed so screenshots are representative)

## Tasks

### Documentation

- [x] `README.md` — rewrite with full content:
  - Project title, badge placeholders, one-line description
  - **Features** section: bullet list of capabilities
  - **Prerequisites**: Node.js version, npm, Windows OS
  - **Installation**: clone + npm install steps
  - **Development**: `npm run dev` command and what it does
  - **Build**: `npm run build` for production executable
  - **Usage**: how the app works (auto-detect, timer, TTS announcements)
  - **Hotkeys**: table with Ctrl+Shift+M and Ctrl+Shift+R
  - **Event Configuration**: JSON format reference (id, name, spawnTime, repeatEvery, warnings array), location of config file, how to reload
  - **Project Structure**: brief folder overview (src/config, src/dota, src/scheduler, src/timer, src/tts, src/ui)
  - **Contributing**: run tests command, code style notes
  - **License**: placeholder or MIT

## Done When
- [x] README.md contains all sections listed above <!-- verified 2026-06-10 -->
- [x] A new developer can follow instructions to run `npm run dev` successfully <!-- verified 2026-06-10 -->
- [x] A user can understand how to configure events without reading source code <!-- verified 2026-06-10 -->
- [x] Hotkey reference is accurate and complete <!-- verified 2026-06-10 -->
- [x] No broken markdown formatting <!-- verified 2026-06-10 -->
