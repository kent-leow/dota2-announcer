# SEO Optimisation & Support/Donation Section

## Summary
Improve search engine visibility for the Dota 2 Announcer landing page so it ranks higher in Google and other search engines, and add a "Buy Me a Coffee" support section to the landing page using a zero-platform-fee donation service so the creator receives donations without being taxed by the platform.

## Scope
**In scope**
- Add structured metadata (Open Graph, Twitter Card, canonical URL) to `index.html`
- Add a `robots.txt` and XML sitemap for crawler discoverability
- Add semantic HTML enhancements (aria-labels, heading hierarchy, alt text)
- Add JSON-LD structured data (SoftwareApplication schema)
- Add a "Support the Creator" / "Buy Me a Coffee" section to the landing page
- Research and recommend a donation platform with 0% platform fee (Ko-fi recommended — takes no cut; only payment processor fees apply)

**Out of scope**
- Paid ads or SEM campaigns
- Blog/content marketing strategy
- Analytics or tracking scripts
- Server-side rendering / pre-rendering (Vercel already handles SPA crawling)
- Payment gateway integration (donation section links externally to the chosen platform)

## Acceptance Criteria

| **AC1** | Meta tags for SEO |
|---------|-------------------|
| Given   | A search engine crawler visits the landing page |
| When    | It reads the `<head>` section |
| Then    | It finds: `<title>`, `<meta name="description">`, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`), Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`), and a `<link rel="canonical">` |

| **AC2** | Robots.txt and Sitemap |
|---------|------------------------|
| Given   | A search engine crawler visits `/robots.txt` |
| When    | It reads the file |
| Then    | It finds a valid robots.txt allowing all crawlers, with a `Sitemap:` directive pointing to `/sitemap.xml`; the sitemap lists the landing page URL |

| **AC3** | Structured Data (JSON-LD) |
|---------|---------------------------|
| Given   | Google's Rich Results validator processes the page |
| When    | It parses the JSON-LD script tag |
| Then    | It finds a valid `SoftwareApplication` schema with name, description, operating system, offers (free), and application category |

| **AC4** | Semantic HTML improvements |
|---------|----------------------------|
| Given   | A crawler or screen reader processes the page |
| When    | It evaluates the heading hierarchy and landmarks |
| Then    | There is exactly one `<h1>`, headings follow sequential order, sections have descriptive `aria-label` attributes, and images/links have accessible text |

| **AC5** | Support/Donation section visible on landing page |
|---------|--------------------------------------------------|
| Given   | A user visits the landing page |
| When    | They scroll past the Download section |
| Then    | They see a "Support" section with a brief message and a button linking to the creator's Ko-fi (or chosen platform) page, opening in a new tab |

| **AC6** | Donation platform is zero-platform-fee |
|---------|----------------------------------------|
| Given   | A supporter clicks the donation button and completes a payment |
| When    | The transaction processes |
| Then    | The creator receives the full amount minus only the payment processor fee (Stripe/PayPal ~2.9% + $0.30) — no additional platform commission |

## Estimate
**Story Points**: 5 SP (~10 days)
> raw SP = (6 AC × 2) + 0 OQ = 12 → nearest Fibonacci = 13, but scope is straightforward front-end additions with no backend → adjusted to 5 SP based on actual complexity.

## Notes
- **Production URL**: `https://dota2-announcer.kent-leow.top/`
- **Donation platform**: Ko-fi (0% platform fee). Use a temporary/mock Ko-fi link (`https://ko-fi.com/kentleow`) as placeholder until account is created.
- **OG image**: Create a static social share image (1200×630px) for use in meta tags. Design should feature the app name, tagline, and Dota 2 visual style.
- **Ko-fi** is the recommended donation platform: 0% platform fee on one-time donations, no monthly subscription required for basic use. Creator keeps 100% minus Stripe/PayPal processing fees (~2.9% + $0.30). Alternative: **GitHub Sponsors** (also 0% fee, but requires approval and GitHub account).
- **Buy Me a Coffee** charges 5% platform fee on all transactions — not recommended if avoiding platform tax is a priority.
- Vercel serves SPAs with proper `200.html` fallback, so `robots.txt` and `sitemap.xml` should be placed in the `public/` directory.
- JSON-LD is preferred over microdata for Google structured data.

## Changelog
- 2026-06-15: Resolved all open questions — production URL is `https://dota2-announcer.kent-leow.top/`, Ko-fi with mock link, OG image to be created.
