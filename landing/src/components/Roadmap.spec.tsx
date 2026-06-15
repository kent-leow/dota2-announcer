import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Roadmap } from './Roadmap';

describe('Roadmap', () => {
  it('renders section heading "Dota 2 Announcer Roadmap"', () => {
    render(<Roadmap />);
    expect(screen.getByText(/Dota 2 Announcer/)).toBeInTheDocument();
    expect(screen.getByText('Roadmap')).toBeInTheDocument();
  });

  it('renders all three status groups', () => {
    render(<Roadmap />);
    expect(screen.getByText(/Planned/)).toBeInTheDocument();
    expect(screen.getByText(/In Progress/)).toBeInTheDocument();
    expect(screen.getByText(/Done/)).toBeInTheDocument();
  });

  it('renders planned items', () => {
    render(<Roadmap />);
    expect(screen.getByText('Custom Voice Pack Support')).toBeInTheDocument();
    expect(screen.getByText('Hero-Specific Reminders')).toBeInTheDocument();
    expect(screen.getByText('Configurable Alert Thresholds')).toBeInTheDocument();
    expect(screen.getByText('Multi-Monitor Overlay Mode')).toBeInTheDocument();
  });

  it('renders in-progress items', () => {
    render(<Roadmap />);
    expect(screen.getByText('Roshan & Aegis Timer')).toBeInTheDocument();
    expect(screen.getByText('Power Rune & Wisdom Rune Countdown')).toBeInTheDocument();
    expect(screen.getByText('Tormentor Respawn Alert')).toBeInTheDocument();
  });

  it('renders done items', () => {
    render(<Roadmap />);
    expect(screen.getByText('Stack & Pull Timing Alerts')).toBeInTheDocument();
    expect(screen.getByText('Bounty Rune Spawn Reminders')).toBeInTheDocument();
    expect(screen.getByText('Glyph Cooldown Tracker')).toBeInTheDocument();
    expect(screen.getByText('Buyback Status Monitoring')).toBeInTheDocument();
  });

  it('section has aria-label="Dota 2 Announcer Roadmap"', () => {
    const { container } = render(<Roadmap />);
    const section = container.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'Dota 2 Announcer Roadmap');
  });

  it('items are rendered in lists with role="list"', () => {
    const { container } = render(<Roadmap />);
    const lists = container.querySelectorAll('[role="list"]');
    expect(lists.length).toBe(3);
  });

  it('has responsive grid layout classes', () => {
    const { container } = render(<Roadmap />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('md:grid-cols-3');
  });
});
