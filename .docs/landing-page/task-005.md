# Task 005 — GitHub Actions: Landing Page Deploy to Vercel

## Goal
Create a GitHub Actions workflow that automatically deploys the landing page to Vercel when changes in `landing/` are pushed to main.

## Prerequisites
- [x] task-001.md completed

## Tasks

### CI/CD

- [x] `.github/workflows/deploy-landing.yml` — Workflow triggered on push to `main` with path filter `landing/**`; steps: checkout, install Node, install dependencies in `landing/`, build, deploy using Vercel CLI (`vercel --prod`) with `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` from secrets (new)

### Config

- [x] `landing/vercel.json` — Vercel project config: framework `vite`, buildCommand `npm run build`, outputDirectory `dist` (new)

## Done When
- [x] Workflow file exists at `.github/workflows/deploy-landing.yml` <!-- verified 2026-06-15 -->
- [x] Workflow only triggers on push to main when `landing/` files change <!-- verified 2026-06-15 -->
- [x] Workflow uses `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets <!-- verified 2026-06-15 -->
- [x] `landing/vercel.json` configures Vite build output <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
