import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Download } from './Download';

describe('Download', () => {
  it('renders download heading', () => {
    render(<Download />);
    expect(screen.getByText(/Ready to/)).toBeInTheDocument();
  });

  it('CTA link has correct href and opens in new tab', () => {
    render(<Download />);
    const link = screen.getByRole('link', { name: /download latest release/i });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/kent-leow/dota2-announcer/releases/latest'
    );
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('mentions Windows and macOS', () => {
    render(<Download />);
    expect(screen.getByText(/Windows and macOS/)).toBeInTheDocument();
  });
});
