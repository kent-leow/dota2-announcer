import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Features } from './Features';

describe('Features', () => {
  it('renders all 7 feature cards', () => {
    const { container } = render(<Features />);
    const cards = container.querySelectorAll('.grid > div');
    expect(cards).toHaveLength(7);
  });

  it('each card contains a title and description', () => {
    render(<Features />);
    expect(screen.getByText('Real-time Voice Announcements')).toBeInTheDocument();
    expect(screen.getByText('Dual Overlay Modes')).toBeInTheDocument();
    expect(screen.getByText('12 Configurable Events')).toBeInTheDocument();
    expect(screen.getByText('TTS Customisation')).toBeInTheDocument();
    expect(screen.getByText('Global Hotkeys')).toBeInTheDocument();
    expect(screen.getByText('System Tray Integration')).toBeInTheDocument();
    expect(screen.getByText('GSI Auto-Setup')).toBeInTheDocument();
  });

  it('grid is responsive with lg:grid-cols-3', () => {
    const { container } = render(<Features />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });
});
