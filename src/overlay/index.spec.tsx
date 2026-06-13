import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

let modeCallback: ((mode: string) => void) | null = null;
let currentMode = 'notification';

(window as any).overlayAPI = {
  getMode: jest.fn(() => Promise.resolve(currentMode)),
  onModeChange: jest.fn((cb) => {
    modeCallback = cb;
    return () => { modeCallback = null; };
  }),
  onNotification: jest.fn(() => () => {}),
  onTick: jest.fn(() => () => {}),
  onUpcoming: jest.fn(() => () => {}),
  getPosition: jest.fn(() => Promise.resolve('right-center')),
  getFontSize: jest.fn(() => Promise.resolve({ name: 16, offset: 13 })),
  onPositionChange: jest.fn(() => () => {}),
  onFontSizeChange: jest.fn(() => () => {}),
};

jest.mock('./NotificationStack', () => ({
  NotificationStack: () => <div data-testid="notification-stack" />,
}));

jest.mock('./PersistentPanel', () => ({
  PersistentPanel: () => <div data-testid="persistent-panel" />,
}));

import { OverlayRoot } from './OverlayRoot';

describe('OverlayRoot', () => {
  beforeEach(() => {
    currentMode = 'notification';
    modeCallback = null;
    jest.clearAllMocks();
  });

  it('renders NotificationStack for notification mode', async () => {
    currentMode = 'notification';
    await act(async () => {
      render(<OverlayRoot />);
    });
    expect(screen.getByTestId('notification-stack')).toBeInTheDocument();
    expect(screen.queryByTestId('persistent-panel')).not.toBeInTheDocument();
  });

  it('renders PersistentPanel for persistent mode', async () => {
    currentMode = 'persistent';
    await act(async () => {
      render(<OverlayRoot />);
    });
    expect(screen.getByTestId('persistent-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-stack')).not.toBeInTheDocument();
  });

  it('switches on mode change event', async () => {
    currentMode = 'notification';
    await act(async () => {
      render(<OverlayRoot />);
    });
    expect(screen.getByTestId('notification-stack')).toBeInTheDocument();
    await act(async () => {
      modeCallback!('persistent');
    });
    expect(screen.getByTestId('persistent-panel')).toBeInTheDocument();
  });
});
