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
  getPosition: jest.fn(() => Promise.resolve('right-center')),
  getFontSize: jest.fn(() => Promise.resolve({ name: 16, offset: 13 })),
  onPositionChange: jest.fn(() => () => {}),
  onFontSizeChange: jest.fn(() => () => {}),
};

import { PersistentPanel } from './PersistentPanel';

describe('PersistentPanel', () => {
  beforeEach(() => {
    tickCallback = null;
    upcomingCallback = null;
    jest.clearAllMocks();
  });

  it('renders N events from upcoming feed', () => {
    render(<PersistentPanel />);
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
    render(<PersistentPanel />);
    act(() => {
      upcomingCallback!([{ eventId: 'a', eventName: 'Rune', happenTimeMs: 120000 }]);
      tickCallback!(60000);
    });
    expect(screen.getByText('1:00')).toBeInTheDocument();
    act(() => {
      tickCallback!(90000);
    });
    expect(screen.getByText('30s')).toBeInTheDocument();
  });

  it('removes event when countdown reaches 0', () => {
    render(<PersistentPanel />);
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
    const { container } = render(<PersistentPanel />);
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
    const { container } = render(<PersistentPanel />);
    act(() => {
      tickCallback!(0);
      upcomingCallback!([]);
    });
    expect(container.querySelector('.persistent-panel')).not.toBeInTheDocument();
  });
});
