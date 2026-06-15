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
});
