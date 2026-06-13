import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';

let configChangeCallback: ((config: { notification: any; persistent: any }) => void) | null = null;

const defaultNotif = { enabled: true, position: 'right', fontSize: { name: 16, offset: 13 } };
const defaultPersist = { enabled: false, position: 'right', fontSize: { name: 16, offset: 13 }, eventCount: 5 };

(window as any).overlayAPI = {
  getNotificationConfig: jest.fn(() => Promise.resolve(defaultNotif)),
  getPersistentConfig: jest.fn(() => Promise.resolve(defaultPersist)),
  onConfigChange: jest.fn((cb) => {
    configChangeCallback = cb;
    return () => { configChangeCallback = null; };
  }),
  onNotification: jest.fn(() => () => {}),
  onTick: jest.fn(() => () => {}),
  onUpcoming: jest.fn(() => () => {}),
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
    configChangeCallback = null;
    jest.clearAllMocks();
    (window as any).overlayAPI.getNotificationConfig.mockResolvedValue(defaultNotif);
    (window as any).overlayAPI.getPersistentConfig.mockResolvedValue(defaultPersist);
  });

  it('renders NotificationStack when notification enabled', async () => {
    await act(async () => {
      render(<OverlayRoot />);
    });
    expect(screen.getByTestId('notification-stack')).toBeInTheDocument();
    expect(screen.queryByTestId('persistent-panel')).not.toBeInTheDocument();
  });

  it('renders PersistentPanel when persistent enabled', async () => {
    (window as any).overlayAPI.getNotificationConfig.mockResolvedValue({ ...defaultNotif, enabled: false });
    (window as any).overlayAPI.getPersistentConfig.mockResolvedValue({ ...defaultPersist, enabled: true });
    await act(async () => {
      render(<OverlayRoot />);
    });
    expect(screen.getByTestId('persistent-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-stack')).not.toBeInTheDocument();
  });

  it('renders both when both enabled', async () => {
    (window as any).overlayAPI.getPersistentConfig.mockResolvedValue({ ...defaultPersist, enabled: true });
    await act(async () => {
      render(<OverlayRoot />);
    });
    expect(screen.getByTestId('notification-stack')).toBeInTheDocument();
    expect(screen.getByTestId('persistent-panel')).toBeInTheDocument();
  });

  it('updates on config change event', async () => {
    await act(async () => {
      render(<OverlayRoot />);
    });
    expect(screen.queryByTestId('persistent-panel')).not.toBeInTheDocument();
    await act(async () => {
      configChangeCallback!({
        notification: { ...defaultNotif, enabled: true },
        persistent: { ...defaultPersist, enabled: true },
      });
    });
    expect(screen.getByTestId('persistent-panel')).toBeInTheDocument();
  });
});
