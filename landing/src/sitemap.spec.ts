import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const robotsTxt = readFileSync(resolve(__dirname, '../public/robots.txt'), 'utf-8');
const sitemapXml = readFileSync(resolve(__dirname, '../public/sitemap.xml'), 'utf-8');

describe('robots.txt', () => {
  it('allows all user-agents', () => {
    expect(robotsTxt).toContain('User-agent: *');
    expect(robotsTxt).toContain('Allow: /');
  });

  it('has Sitemap directive pointing to production sitemap', () => {
    expect(robotsTxt).toContain('Sitemap: https://dota2-announcer.kent-leow.top/sitemap.xml');
  });
});

describe('sitemap.xml', () => {
  it('is valid XML with urlset namespace', () => {
    expect(sitemapXml).toContain('<?xml version="1.0"');
    expect(sitemapXml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it('lists the production URL', () => {
    expect(sitemapXml).toContain('<loc>https://dota2-announcer.kent-leow.top/</loc>');
  });
});
