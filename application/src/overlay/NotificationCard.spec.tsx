import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationCard } from './NotificationCard';

describe('NotificationCard', () => {
  it('renders event name', () => {
    render(<NotificationCard eventName="Bounty Rune" offsetSeconds={30} status="visible" />);
    expect(screen.getByText('Bounty Rune')).toBeInTheDocument();
  });

  it('shows offset text for non-zero offset (fallback without happenTimeMs)', () => {
    render(<NotificationCard eventName="Power Rune" offsetSeconds={15} status="visible" />);
    expect(screen.getByText('in 15s')).toBeInTheDocument();
  });

  it('shows "now" for zero offset (fallback)', () => {
    render(<NotificationCard eventName="Stack Camps" offsetSeconds={0} status="visible" />);
    expect(screen.getByText('now')).toBeInTheDocument();
  });

  it('applies entering CSS class', () => {
    const { container } = render(<NotificationCard eventName="Test" offsetSeconds={5} status="entering" />);
    expect(container.querySelector('.notification-card--entering')).toBeInTheDocument();
  });

  it('applies visible CSS class', () => {
    const { container } = render(<NotificationCard eventName="Test" offsetSeconds={5} status="visible" />);
    expect(container.querySelector('.notification-card--visible')).toBeInTheDocument();
  });

  it('applies exiting CSS class', () => {
    const { container } = render(<NotificationCard eventName="Test" offsetSeconds={5} status="exiting" />);
    expect(container.querySelector('.notification-card--exiting')).toBeInTheDocument();
  });

  describe('dynamic countdown', () => {
    it('counts down based on happenTimeMs and gameTimeMs', () => {
      render(<NotificationCard eventName="Rune" offsetSeconds={60} happenTimeMs={120000} gameTimeMs={90000} status="visible" />);
      expect(screen.getByText('in 30s')).toBeInTheDocument();
    });

    it('shows "now" when gameTimeMs reaches happenTimeMs', () => {
      render(<NotificationCard eventName="Rune" offsetSeconds={60} happenTimeMs={120000} gameTimeMs={120000} status="visible" />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    it('never shows negative countdown', () => {
      render(<NotificationCard eventName="Rune" offsetSeconds={60} happenTimeMs={120000} gameTimeMs={130000} status="visible" />);
      expect(screen.getByText('now')).toBeInTheDocument();
    });

    it('updates countdown when gameTimeMs prop changes', () => {
      const { rerender } = render(<NotificationCard eventName="Rune" offsetSeconds={60} happenTimeMs={120000} gameTimeMs={60000} status="visible" />);
      expect(screen.getByText('in 60s')).toBeInTheDocument();

      rerender(<NotificationCard eventName="Rune" offsetSeconds={60} happenTimeMs={120000} gameTimeMs={90000} status="visible" />);
      expect(screen.getByText('in 30s')).toBeInTheDocument();
    });
  });
});
