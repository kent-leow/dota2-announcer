import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders without crash', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('applies bg-dota-black class to root container', () => {
    const { container } = render(<App />);
    expect(container.firstChild).toHaveClass('bg-dota-black');
  });

  it('renders Support section between Download and Footer', () => {
    const { container } = render(<App />);
    const sections = container.querySelectorAll('section, footer');
    const labels = Array.from(sections).map((s) => s.getAttribute('aria-label'));
    const downloadIdx = labels.indexOf('Download');
    const supportIdx = labels.indexOf('Support');
    const footerIdx = labels.indexOf('Footer');
    expect(supportIdx).toBeGreaterThan(downloadIdx);
    expect(supportIdx).toBeLessThan(footerIdx);
  });
});
