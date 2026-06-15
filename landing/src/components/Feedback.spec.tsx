import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Feedback } from './Feedback';

describe('Feedback', () => {
  it('renders section heading with "Community Feedback"', () => {
    render(<Feedback />);
    expect(screen.getByText(/Community/)).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText(/Dota 2 Announcer/)).toBeInTheDocument();
  });

  it('renders three category links', () => {
    render(<Feedback />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('Bug Report link has correct GitHub issue template href', () => {
    render(<Feedback />);
    const link = screen.getByRole('link', { name: /submit bug report/i });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/kent-leow/dota2-announcer/issues/new?template=bug_report.yml'
    );
  });

  it('Feature Request link has correct GitHub issue template href', () => {
    render(<Feedback />);
    const link = screen.getByRole('link', { name: /submit feature request/i });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/kent-leow/dota2-announcer/issues/new?template=feature_request.yml'
    );
  });

  it('Question link has correct GitHub issue template href', () => {
    render(<Feedback />);
    const link = screen.getByRole('link', { name: /submit question/i });
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/kent-leow/dota2-announcer/issues/new?template=question.yml'
    );
  });

  it('all links open in new tab with noopener noreferrer', () => {
    render(<Feedback />);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('section has aria-label="Community Feedback"', () => {
    const { container } = render(<Feedback />);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'Community Feedback');
  });
});
