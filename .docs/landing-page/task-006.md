# Task 006 — GitHub Actions: App Release Pipeline

## Goal
Create a GitHub Actions workflow that builds the Electron app for Windows and macOS and publishes installers as GitHub Release assets when a version tag is pushed.

## Prerequisites
- None

## Tasks

### CI/CD

- [x] `.github/workflows/release-app.yml` — Workflow triggered on tag push matching `v*`; matrix strategy with `windows-latest` and `macos-latest` runners; steps: checkout, install Node, install dependencies in `application/`, run `npm run build` (vite build + electron-builder); create GitHub Release (if not exists) with tag name; upload `.exe` (Windows) and `.dmg` (macOS) artifacts from `application/dist/installer/` to the release using `softprops/action-gh-release` (new)

## Done When
- [x] Workflow file exists at `.github/workflows/release-app.yml` <!-- verified 2026-06-15 -->
- [x] Workflow triggers only on `v*` tags <!-- verified 2026-06-15 -->
- [x] Builds run on both Windows and macOS runners <!-- verified 2026-06-15 -->
- [x] GitHub Release is created with the tag name as title <!-- verified 2026-06-15 -->
- [x] `.exe` and `.dmg` installer files are uploaded as release assets <!-- verified 2026-06-15 -->
- [x] Uses only `GITHUB_TOKEN` (no additional secrets needed) <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
