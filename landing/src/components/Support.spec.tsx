import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Support } from './Support';

describe('Support', () => {
  it('renders section heading "Support the Project"', () => {
    render(<Support />);
    expect(screen.getByText(/Support the/)).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
  });

  it('Ko-fi link has correct href', () => {
    render(<Support />);
    const link = screen.getByRole('link', { name: /support on ko-fi/i });
    expect(link).toHaveAttribute('href', 'https://ko-fi.com/kentleow');
  });

  it('link opens in new tab', () => {
    render(<Support />);
    const link = screen.getByRole('link', { name: /support on ko-fi/i });
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('link has rel="noopener noreferrer"', () => {
    render(<Support />);
    const link = screen.getByRole('link', { name: /support on ko-fi/i });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('section has aria-label="Support"', () => {
    const { container } = render(<Support />);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'Support');
  });
});
