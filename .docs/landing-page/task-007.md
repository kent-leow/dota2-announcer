# Task 007 — README Documentation Update

## Goal
Update the root `README.md` with landing page dev instructions and release workflow documentation so contributors know how to run, deploy, and publish.

## Prerequisites
- [x] task-005.md completed
- [x] task-006.md completed

## Tasks

### Documentation

- [x] `README.md` — Replace "Coming soon" landing section with: how to run landing locally (`cd landing && npm install && npm run dev`), how Vercel deployment works (auto on push to main), required secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`). Add new "Releasing" section: how to publish a release (`git tag v0.x.x && git push origin v0.x.x`), what the pipeline does (builds Windows + macOS, creates GitHub Release with installers), note about `GITHUB_TOKEN` auto-provided

## Done When
- [x] `README.md` landing section contains local dev instructions <!-- verified 2026-06-15 -->
- [x] `README.md` landing section documents Vercel deployment and required secrets <!-- verified 2026-06-15 -->
- [x] `README.md` has a "Releasing" section with tag-and-push instructions <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
