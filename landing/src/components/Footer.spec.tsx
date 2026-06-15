import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/Dota 2 Announcer/)).toBeInTheDocument();
  });

  it('GitHub link points to repo', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /view source code on github/i });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/kent-leow/dota2-announcer'
    );
  });

  it('footer has aria-label="Footer"', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveAttribute('aria-label', 'Footer');
  });

  it('GitHub link has accessible aria-label', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: /view source code on github/i });
    expect(link).toHaveAttribute('aria-label', 'View source code on GitHub');
  });
});
