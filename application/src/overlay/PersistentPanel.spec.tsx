import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

let tickCallback: ((ms: number) => void) | null = null;
let upcomingCallback: ((occ: Array<{ eventId: string; eventName: string; happenTimeMs: number }>) => void) | null = null;

(window as any).overlayAPI = {
  onTick: jest.fn((cb) => {
    tickCallback = cb;
    return () => { tickCallback = null; };
  }),
  onUpcoming: jest.fn((cb) => {
    upcomingCallback = cb;
    return () => { upcomingCallback = null; };
  }),
};

import { PersistentPanel } from './PersistentPanel';

const defaultProps = {
  position: 'right' as const,
  fontSize: { name: 16, offset: 13 },
  onHeightChange: jest.fn(),
};

describe('PersistentPanel', () => {
  beforeEach(() => {
    tickCallback = null;
    upcomingCallback = null;
    jest.clearAllMocks();
  });

  it('renders N events from upcoming feed', () => {
    render(<PersistentPanel {...defaultProps} />);
    act(() => {
      tickCallback!(60000);
      upcomingCallback!([
        { eventId: 'a', eventName: 'Bounty Rune', happenTimeMs: 120000 },
        { eventId: 'b', eventName: 'Power Rune', happenTimeMs: 180000 },
      ]);
    });
    expect(screen.getByText('Bounty Rune')).toBeInTheDocument();
    expect(screen.getByText('Power Rune')).toBeInTheDocument();
  });

  it('updates countdown on tick', () => {
    render(<PersistentPanel {...defaultProps} />);
    act(() => {
      upcomingCallback!([{ eventId: 'a', eventName: 'Rune', happenTimeMs: 120000 }]);
      tickCallback!(60000);
    });
    expect(screen.getByText('in 1:00')).toBeInTheDocument();
    expect(screen.getByText('@02:00')).toBeInTheDocument();
    act(() => {
      tickCallback!(90000);
    });
    expect(screen.getByText('in 30s')).toBeInTheDocument();
  });

  it('removes event when countdown reaches 0', () => {
    render(<PersistentPanel {...defaultProps} />);
    act(() => {
      upcomingCallback!([{ eventId: 'a', eventName: 'Rune', happenTimeMs: 120000 }]);
      tickCallback!(60000);
    });
    expect(screen.getByText('Rune')).toBeInTheDocument();
    act(() => {
      tickCallback!(120000);
    });
    expect(screen.queryByText('Rune')).not.toBeInTheDocument();
  });

  it('shows events sorted by nearest time', () => {
    const { container } = render(<PersistentPanel {...defaultProps} />);
    act(() => {
      tickCallback!(0);
      upcomingCallback!([
        { eventId: 'b', eventName: 'Far Event', happenTimeMs: 600000 },
        { eventId: 'a', eventName: 'Near Event', happenTimeMs: 120000 },
      ]);
    });
    const items = container.querySelectorAll('.persistent-panel__name');
    expect(items[0].textContent).toBe('Far Event');
    expect(items[1].textContent).toBe('Near Event');
  });

  it('renders nothing when no upcoming events', () => {
    const { container } = render(<PersistentPanel {...defaultProps} />);
    act(() => {
      tickCallback!(0);
      upcomingCallback!([]);
    });
    expect(container.querySelector('.persistent-panel')).not.toBeInTheDocument();
  });

  it('calls onHeightChange when events render', () => {
    const onHeightChange = jest.fn();
    render(<PersistentPanel {...defaultProps} onHeightChange={onHeightChange} />);
    act(() => {
      tickCallback!(0);
      upcomingCallback!([{ eventId: 'a', eventName: 'Rune', happenTimeMs: 120000 }]);
    });
    expect(onHeightChange).toHaveBeenCalled();
  });

  it('uses position prop for alignment class', () => {
    const { container } = render(<PersistentPanel {...defaultProps} position="left" />);
    act(() => {
      tickCallback!(0);
      upcomingCallback!([{ eventId: 'a', eventName: 'Rune', happenTimeMs: 120000 }]);
    });
    expect(container.querySelector('.persistent-panel--left')).toBeInTheDocument();
  });
});
