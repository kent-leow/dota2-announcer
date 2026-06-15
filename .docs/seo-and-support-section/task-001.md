# Task 001 — SEO Meta Tags, Canonical URL & OG Image

## Goal
Add comprehensive SEO meta tags (Open Graph, Twitter Card, canonical) and a social share image so the landing page renders rich previews in search results and social platforms.

## Prerequisites
- None

## Tasks

### Static Assets

- [x] `landing/public/robots.txt` — create robots.txt allowing all user-agents, with `Sitemap: https://dota2-announcer.kent-leow.top/sitemap.xml` directive (new)
- [x] `landing/public/sitemap.xml` — create XML sitemap listing `https://dota2-announcer.kent-leow.top/` with today's date as lastmod (new)
- [x] `landing/public/og-image.svg` — create a 1200×630px social share image with app name "Dota 2 Announcer", tagline, dark background with gold accent matching site theme (new)

### HTML Head

- [x] `landing/index.html` — add Open Graph meta tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type` (website)
- [x] `landing/index.html` — add Twitter Card meta tags: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`
- [x] `landing/index.html` — add `<link rel="canonical" href="https://dota2-announcer.kent-leow.top/" />`
- [x] `landing/index.html` — add JSON-LD structured data script with `SoftwareApplication` schema (name, description, operatingSystem: "Windows, macOS", applicationCategory: "GameApplication", offers: {price: "0", priceCurrency: "USD"})

### Tests

- [x] `landing/src/seo.spec.ts` — test that index.html contains required meta tags, canonical link, and JSON-LD block (new)
  - [x] Verify OG tags present (og:title, og:description, og:image, og:url, og:type)
  - [x] Verify Twitter Card tags present
  - [x] Verify canonical URL matches production URL
  - [x] Verify JSON-LD parses as valid SoftwareApplication schema
- [x] `landing/src/sitemap.spec.ts` — test that robots.txt and sitemap.xml are valid (new)
  - [x] robots.txt contains User-agent and Sitemap directive
  - [x] sitemap.xml is valid XML with production URL listed

## Done When
- [x] Page renders rich preview when URL is shared on social media (OG image, title, description visible) <!-- verified 2026-06-15 -->
- [x] `/robots.txt` is accessible and points to sitemap <!-- verified 2026-06-15 -->
- [x] `/sitemap.xml` lists the production URL <!-- verified 2026-06-15 -->
- [x] JSON-LD passes Google Rich Results Test structure validation <!-- verified 2026-06-15 -->
- [x] All new and modified tests pass <!-- verified 2026-06-15 -->
- [x] No existing tests broken <!-- verified 2026-06-15 -->
