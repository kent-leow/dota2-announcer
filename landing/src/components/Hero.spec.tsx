import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders video element with autoplay, muted, and loop attributes', () => {
    const { container } = render(<Hero />);
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('loop');
  });

  it('renders WebM and MP4 source elements with correct src', () => {
    const { container } = render(<Hero />);
    const sources = container.querySelectorAll('source');
    expect(sources).toHaveLength(2);
    expect(sources[0]).toHaveAttribute(
      'src',
      'https://cdn.steamstatic.com/apps/dota2/videos/dota_react/homepage/dota_montage_webm.webm'
    );
    expect(sources[0]).toHaveAttribute('type', 'video/webm');
    expect(sources[1]).toHaveAttribute(
      'src',
      'https://cdn.steamstatic.com/apps/dota2/videos/dota_react/homepage/dota_montage_02.mp4'
    );
    expect(sources[1]).toHaveAttribute('type', 'video/mp4');
  });

  it('renders app title', () => {
    render(<Hero />);
    expect(screen.getByText(/Dota 2/)).toBeInTheDocument();
    expect(screen.getByText('Announcer')).toBeInTheDocument();
  });

  it('renders download CTA that scrolls to download section', () => {
    render(<Hero />);
    const link = screen.getByRole('link', { name: /download now/i });
    expect(link).toHaveAttribute('href', '#download');
  });

  it('section has aria-label="Hero"', () => {
    const { container } = render(<Hero />);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'Hero');
  });

  it('contains exactly one h1 element', () => {
    const { container } = render(<Hero />);
    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
  });
});
