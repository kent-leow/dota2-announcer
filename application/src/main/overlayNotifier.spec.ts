import { RoshanEvent } from 'src/dota/roshanTracker';

let capturedCallback: ((name: string, offset: number, id: string, icon?: string) => void) | null = null;
let capturedRoshanCallback: ((event: RoshanEvent) => void) | null = null;

jest.mock('src/scheduler/eventScheduler', () => ({
  onAnnouncement: jest.fn((cb) => { capturedCallback = cb; }),
}));

jest.mock('src/dota/roshanTracker', () => ({
  onRoshanEvent: jest.fn((cb) => { capturedRoshanCallback = cb; }),
}));

jest.mock('electron', () => ({
  BrowserWindow: jest.fn(),
}));

import { initOverlayNotifier } from './overlayNotifier';

describe('overlayNotifier', () => {
  const mockSend = jest.fn();
  const mockOverlay = {
    isDestroyed: jest.fn().mockReturnValue(false),
    webContents: { send: mockSend },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOverlay.isDestroyed.mockReturnValue(false);
    capturedCallback = null;
    capturedRoshanCallback = null;
  });

  it('subscribes to announcement callback', () => {
    initOverlayNotifier(() => mockOverlay as any);
    expect(capturedCallback).toBeDefined();
  });

  it('sends overlay:notify with correct payload on announcement', () => {
    initOverlayNotifier(() => mockOverlay as any);
    capturedCallback!('Bounty Rune', 30, 'bounty-rune');

    expect(mockSend).toHaveBeenCalledWith('overlay:notify', {
      eventName: 'Bounty Rune',
      offsetSeconds: 30,
      eventId: 'bounty-rune',
      icon: undefined,
      timestamp: expect.any(Number),
    });
  });

  it('includes icon field in notification payload', () => {
    initOverlayNotifier(() => mockOverlay as any);
    capturedCallback!('Bounty Rune', 30, 'bounty-rune', 'data:image/png;base64,icon');

    expect(mockSend).toHaveBeenCalledWith('overlay:notify', {
      eventName: 'Bounty Rune',
      offsetSeconds: 30,
      eventId: 'bounty-rune',
      icon: 'data:image/png;base64,icon',
      timestamp: expect.any(Number),
    });
  });

  it('does not send if overlay is null', () => {
    initOverlayNotifier(() => null);
    capturedCallback!('Bounty Rune', 30, 'bounty-rune');

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('does not send if overlay is destroyed', () => {
    mockOverlay.isDestroyed.mockReturnValue(true);
    initOverlayNotifier(() => mockOverlay as any);
    capturedCallback!('Bounty Rune', 30, 'bounty-rune');

    expect(mockSend).not.toHaveBeenCalled();
  });

  describe('roshan events', () => {
    it('sends Roshan Killed notification', () => {
      initOverlayNotifier(() => mockOverlay as any);
      capturedRoshanCallback!({ type: 'killed' });

      expect(mockSend).toHaveBeenCalledWith('overlay:notify', {
        eventName: 'Roshan Killed',
        offsetSeconds: 0,
        eventId: 'roshan',
        timestamp: expect.any(Number),
      });
    });

    it('sends countdown notification with remaining minutes', () => {
      initOverlayNotifier(() => mockOverlay as any);
      capturedRoshanCallback!({ type: 'countdown', remainingSeconds: 180 });

      expect(mockSend).toHaveBeenCalledWith('overlay:notify', {
        eventName: 'Roshan — may respawn in 3m',
        offsetSeconds: 0,
        eventId: 'roshan',
        timestamp: expect.any(Number),
      });
    });

    it('sends Roshan Alive notification', () => {
      initOverlayNotifier(() => mockOverlay as any);
      capturedRoshanCallback!({ type: 'respawn' });

      expect(mockSend).toHaveBeenCalledWith('overlay:notify', {
        eventName: 'Roshan Alive',
        offsetSeconds: 0,
        eventId: 'roshan',
        timestamp: expect.any(Number),
      });
    });

    it('does not send roshan event if overlay is null', () => {
      initOverlayNotifier(() => null);
      capturedRoshanCallback!({ type: 'killed' });

      expect(mockSend).not.toHaveBeenCalled();
    });

    it('does not send roshan event if overlay is destroyed', () => {
      mockOverlay.isDestroyed.mockReturnValue(true);
      initOverlayNotifier(() => mockOverlay as any);
      capturedRoshanCallback!({ type: 'killed' });

      expect(mockSend).not.toHaveBeenCalled();
    });
  });
});
