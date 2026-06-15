# Feedback Corner & Roadmap Section

## Summary
Add two new sections to the landing page: a lightweight feedback/submission corner where users can report bugs, suggest ideas, or ask questions — without requiring a database — and a public roadmap section that displays upcoming features to build community hype and transparency. Additionally, enrich the site's SEO with keyword-dense meta content, expanded structured data, and semantic HTML targeting Dota 2 community search intent across both new sections.

## Scope
**In scope**
- Feedback submission section using GitHub Issues (via link-out to pre-filled issue templates)
- Issue templates for bug reports, feature suggestions, and questions
- Roadmap section displaying planned/in-progress/completed milestones
- Roadmap data stored as static JSON or hardcoded array (no backend)
- Responsive design matching existing Dota 2 theme
- SEO enrichment: keyword-optimised headings, meta description update, structured data expansion, and semantic HTML for both new sections
- Targeted keywords covering Dota 2 announcer, game timer, voice alerts, game state integration, community feedback, feature roadmap, and related long-tail search terms
- Unit tests for both new components and SEO metadata validation

**Out of scope**
- Database or backend for storing submissions
- Embedded forms (Google Forms, Typeform)
- Admin panel for managing roadmap items
- Real-time sync with GitHub Projects/Issues API
- User authentication or accounts
- Comment/voting system on roadmap items
- Paid SEO tools, backlink campaigns, or off-page SEO efforts
- Dynamic server-side rendering for SEO (SPA pre-rendering)

## Acceptance Criteria

| **AC1** | Feedback section renders with submission options |
|---------|------------------------------------------------|
| Given | A user visits the landing page |
| When  | They scroll to the feedback section |
| Then  | They see categorised buttons (Bug Report, Feature Request, Question) that link to pre-filled GitHub Issue templates |

| **AC2** | GitHub Issue templates exist in the repository |
|---------|----------------------------------------------|
| Given | A user clicks a feedback category button |
| When  | They are redirected to GitHub |
| Then  | A new issue form opens with the correct template pre-selected (title prefix, labels, body structure) |

| **AC3** | Roadmap section displays milestones |
|---------|-------------------------------------|
| Given | A user visits the landing page |
| When  | They scroll to the roadmap section |
| Then  | They see a timeline or card-based view showing planned features grouped by status (Planned, In Progress, Done) |

| **AC4** | Roadmap data is maintainable without code changes |
|---------|--------------------------------------------------|
| Given | A maintainer wants to update the roadmap |
| When  | They edit the roadmap data file |
| Then  | Changes reflect on the site after deployment without touching component code |

| **AC5** | Both sections are accessible and responsive |
|---------|---------------------------------------------|
| Given | A user visits on mobile or uses a screen reader |
| When  | They interact with the feedback or roadmap sections |
| Then  | All elements have proper aria-labels, keyboard navigation works, and layout adapts to viewport width |

| **AC6** | Unit tests cover both components |
|---------|----------------------------------|
| Given | The test suite runs |
| When  | Feedback and Roadmap component tests execute |
| Then  | All tests pass covering rendering, link correctness, and accessibility attributes |

| **AC7** | SEO meta content is enriched with targeted keywords |
|---------|-----------------------------------------------------|
| Given | A search engine crawls the landing page |
| When  | It indexes the page content and metadata |
| Then  | The meta description includes primary keywords (Dota 2 announcer, game timer, voice alerts, community feedback, roadmap), Open Graph tags reflect the expanded content, and structured data includes FAQPage or WebPage schema referencing the new sections |

| **AC8** | Section headings and content use semantic, keyword-rich HTML |
|---------|--------------------------------------------------------------|
| Given | A user or crawler views the feedback and roadmap sections |
| When  | The HTML source is inspected |
| Then  | Headings use descriptive, keyword-bearing text (not generic labels), section elements have meaningful aria-labels, and body copy naturally incorporates related terms (Dota 2 game state integration, real-time audio alerts, match timer, roshan timer, aegis timer, power rune timer, stack timer, pull timer, bounty rune timer, wisdom rune timer, tormentor timer, glyph timer, buyback status, open-source Dota 2 tool, community-driven development) |

| **AC9** | Sitemap and robots.txt remain valid after section additions |
|---------|-------------------------------------------------------------|
| Given | The site is deployed with the new sections |
| When  | Crawlers access robots.txt and sitemap.xml |
| Then  | Both files remain valid, sitemap lastmod is updated, and no new pages are required (single-page app) |

## Open Questions
> None — all resolved.

## Estimate
**Story Points**: 13 SP (~26 days)
> raw SP = (9 AC × 2) + 0 OQ = 18, rounded to nearest Fibonacci = 21 → adjusted to 13 SP given static nature of SEO additions (no backend, no dynamic rendering). 1 SP = 2 days.

## Notes
- **Initial roadmap items** (prioritised from a Dota 2 player's perspective — what matters most in-game):
  - **Planned**: Custom voice pack support (choose your announcer voice), hero-specific reminders (e.g. Meepo net-worth timing, Chen creep respawn), configurable alert thresholds (warn 30s/15s/5s before events), multi-monitor/overlay mode
  - **In Progress**: Roshan death & Aegis expiry precision timer, power rune / wisdom rune countdown, tormentor respawn alert
  - **Done**: Stack/pull timing alerts, bounty rune spawn reminders, glyph cooldown tracker, buyback status monitoring, game state integration setup
- **Why GitHub Issues over Google Sheets/Forms**: GitHub Issues is the most natural fit for an open-source project — contributors already have GitHub accounts, issues are public and searchable, templates enforce structure, and it requires zero infrastructure. No API keys, no auth, no CORS.
- Section order in page: Hero → Features → Download → Roadmap → Feedback → Support → Footer
- Roadmap data lives in a separate file (e.g., `roadmapData.ts`) so non-developers can propose changes via PR without touching component logic.
- Issue template approach uses GitHub's `new issue` URL parameters (`template`, `title`, `labels`) for zero-click pre-filling.
- **SEO keyword strategy**: Primary keywords — "Dota 2 announcer", "Dota 2 game timer", "Dota 2 voice alerts", "game state integration app". Secondary keywords — "roshan timer", "aegis timer", "power rune timer", "stack timer", "pull timer", "bounty rune timer", "wisdom rune timer", "tormentor timer", "glyph timer", "buyback tracker", "Dota 2 overlay", "Dota 2 companion app", "real-time Dota 2 notifications". Long-tail keywords — "open source Dota 2 announcer tool", "free Dota 2 game event timer", "community-driven Dota 2 app roadmap", "Dota 2 feedback and feature request", "desktop Dota 2 audio alert timer".
- **SEO implementation approach**: Update the existing meta description to be keyword-richer, expand the JSON-LD structured data to include FAQPage schema addressing common user questions (what is it, how does it work, is it free), use semantic section headings that double as keyword targets, and ensure all new body copy naturally weaves in related terms without keyword stuffing.
- **Existing SEO baseline**: The site already has OG tags, Twitter Cards, JSON-LD SoftwareApplication schema, canonical URL, robots.txt, and sitemap.xml. This work extends — not replaces — the current implementation.

## Changelog
- 2026-06-15: Added SEO enrichment scope (AC7–AC9), expanded keyword strategy, updated estimate from 8 SP to 13 SP
- 2026-06-15: Resolved OQ1 — defined initial roadmap items from a Dota 2 player's priority perspective (Roshan/Aegis timers, rune countdowns, custom voice packs, hero-specific reminders)
