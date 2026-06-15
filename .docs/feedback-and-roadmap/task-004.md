# Task 004 — SEO Enrichment

## Goal
Enrich the landing page SEO with keyword-dense meta content, expanded structured data (FAQPage schema), and semantic keyword-bearing headings in the new sections, verifiable via metadata tests and HTML inspection.

## Prerequisites
- [x] task-003.md completed

## Tasks

### Meta & Structured Data

- [x] `landing/index.html` — Update meta description to include primary keywords (Dota 2 announcer, game timer, voice alerts, roshan timer, community feedback, roadmap); update OG and Twitter description to match; add FAQPage JSON-LD schema block with 3–5 Q&A pairs (what is it, how does it work, is it free, what timers are supported)
  - [x] `landing/src/seo.spec.ts` — Add tests: meta description contains target keywords, FAQPage JSON-LD is valid schema with correct @type, FAQ items have `name` and `acceptedAnswer` fields, OG/Twitter descriptions match meta description

### Semantic HTML in Components

- [x] `landing/src/components/Feedback.tsx` — Ensure heading and paragraph text incorporate keywords naturally (e.g. "Community Feedback for Dota 2 Announcer", body mentions bug reports, feature requests, game timer improvements)
- [x] `landing/src/components/Roadmap.tsx` — Ensure heading uses keyword-bearing text (e.g. "Dota 2 Announcer Roadmap"), status group labels and item descriptions weave in terms (roshan timer, power rune, voice alerts, game state integration)
- [x] `landing/src/data/roadmapData.ts` — Ensure item descriptions contain relevant secondary keywords (roshan timer, aegis timer, power rune countdown, custom voice pack, hero-specific reminders)

### Sitemap Update

- [x] `landing/public/sitemap.xml` — Update `<lastmod>` to current date (already 2026-06-15)

## Done When
- [x] Meta description includes primary keywords without keyword stuffing <!-- verified 2026-06-15 -->
- [x] FAQPage JSON-LD validates with correct schema structure <!-- verified 2026-06-15 -->
- [x] OG and Twitter Card descriptions reflect updated meta description <!-- verified 2026-06-15 -->
- [x] Feedback and Roadmap component headings contain target keywords <!-- verified 2026-06-15 -->
- [x] Sitemap `<lastmod>` reflects latest deployment date <!-- verified 2026-06-15 -->
- [x] All new and modified tests pass <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
