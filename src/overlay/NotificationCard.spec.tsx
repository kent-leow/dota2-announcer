import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NotificationCard } from './NotificationCard';

describe('NotificationCard', () => {
  it('renders event name', () => {
    render(<NotificationCard eventName="Bounty Rune" offsetSeconds={30} status="visible" />);
    expect(screen.getByText('Bounty Rune')).toBeInTheDocument();
  });

  it('shows offset text for non-zero offset', () => {
    render(<NotificationCard eventName="Power Rune" offsetSeconds={15} status="visible" />);
    expect(screen.getByText('in 15s')).toBeInTheDocument();
  });

  it('shows "now" for zero offset', () => {
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
});
