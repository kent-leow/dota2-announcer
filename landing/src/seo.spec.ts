import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf-8');

describe('SEO Meta Tags', () => {
  it('has Open Graph tags', () => {
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('property="og:url"');
    expect(html).toContain('property="og:type"');
  });

  it('has Twitter Card tags', () => {
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('name="twitter:title"');
    expect(html).toContain('name="twitter:description"');
    expect(html).toContain('name="twitter:image"');
    expect(html).toContain('content="summary_large_image"');
  });

  it('has canonical URL pointing to production', () => {
    expect(html).toContain('rel="canonical" href="https://dota2-announcer.kent-leow.top/"');
  });

  it('has valid JSON-LD SoftwareApplication schema', () => {
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(match).not.toBeNull();
    const jsonLd = JSON.parse(match![1]);
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('SoftwareApplication');
    expect(jsonLd.name).toBe('Dota 2 Announcer');
    expect(jsonLd.operatingSystem).toBe('Windows, macOS');
    expect(jsonLd.applicationCategory).toBe('GameApplication');
    expect(jsonLd.offers.price).toBe('0');
    expect(jsonLd.offers.priceCurrency).toBe('USD');
  });

  it('meta description contains primary SEO keywords', () => {
    const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
    expect(descMatch).not.toBeNull();
    const description = descMatch![1];
    expect(description).toContain('Dota 2 announcer');
    expect(description).toContain('game timer');
    expect(description).toContain('voice alerts');
    expect(description).toContain('Roshan');
    expect(description).toContain('Game State Integration');
  });

  it('OG and Twitter descriptions match meta description', () => {
    const metaDesc = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1];
    const twDesc = html.match(/<meta name="twitter:description" content="([^"]+)"/)?.[1];
    expect(ogDesc).toBe(metaDesc);
    expect(twDesc).toBe(metaDesc);
  });

  it('has valid JSON-LD FAQPage schema', () => {
    const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    const faqMatch = matches.find((m) => m[1].includes('FAQPage'));
    expect(faqMatch).not.toBeUndefined();
    const faqSchema = JSON.parse(faqMatch![1]);
    expect(faqSchema['@context']).toBe('https://schema.org');
    expect(faqSchema['@type']).toBe('FAQPage');
    expect(faqSchema.mainEntity).toBeInstanceOf(Array);
    expect(faqSchema.mainEntity.length).toBeGreaterThanOrEqual(3);
    faqSchema.mainEntity.forEach((item: any) => {
      expect(item['@type']).toBe('Question');
      expect(item.name).toBeTruthy();
      expect(item.acceptedAnswer['@type']).toBe('Answer');
      expect(item.acceptedAnswer.text).toBeTruthy();
    });
  });

  it('has keywords meta tag', () => {
    expect(html).toContain('name="keywords"');
    const keywordsMatch = html.match(/<meta name="keywords" content="([^"]+)"/);
    expect(keywordsMatch).not.toBeNull();
    const keywords = keywordsMatch![1];
    expect(keywords).toContain('Dota 2 announcer');
    expect(keywords).toContain('roshan timer');
    expect(keywords).toContain('game state integration');
  });
});
