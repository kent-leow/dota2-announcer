const mockShow = jest.fn();
const mockHide = jest.fn();
const mockClose = jest.fn();
const mockLoadFile = jest.fn();
const mockLoadURL = jest.fn();
const mockSetIgnoreMouseEvents = jest.fn();
const mockShowInactive = jest.fn();
const mockIsDestroyed = jest.fn().mockReturnValue(false);
const mockWindowOn = jest.fn();

const mockBrowserWindowInstance = {
  show: mockShow,
  hide: mockHide,
  close: mockClose,
  loadFile: mockLoadFile,
  loadURL: mockLoadURL,
  setIgnoreMouseEvents: mockSetIgnoreMouseEvents,
  showInactive: mockShowInactive,
  isDestroyed: mockIsDestroyed,
  on: mockWindowOn,
  webContents: { send: jest.fn() },
};

const mockBrowserWindow = jest.fn().mockImplementation(() => mockBrowserWindowInstance);

jest.mock('electron', () => ({
  BrowserWindow: mockBrowserWindow,
  screen: {
    getPrimaryDisplay: jest.fn().mockReturnValue({
      workAreaSize: { width: 1920, height: 1080 },
    }),
  },
}));

import { createOverlayWindow, showOverlay, hideOverlay, destroyOverlay, getOverlayWindow } from './overlayWindow';

describe('overlayWindow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOverlayWindow', () => {
    it('creates BrowserWindow with correct options', () => {
      createOverlayWindow();

      expect(mockBrowserWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          transparent: true,
          frame: false,
          alwaysOnTop: true,
          skipTaskbar: true,
          resizable: false,
          focusable: false,
          fullscreenable: false,
          show: false,
          width: 350,
          height: 600,
          x: 1920 - 350,
          y: 0,
        })
      );
    });

    it('calls setIgnoreMouseEvents(true) for click-through', () => {
      createOverlayWindow();
      expect(mockSetIgnoreMouseEvents).toHaveBeenCalledWith(true);
    });

    it('returns the created window', () => {
      const win = createOverlayWindow();
      expect(win).toBe(mockBrowserWindowInstance);
    });
  });

  describe('showOverlay', () => {
    it('calls showInactive on the overlay window', () => {
      createOverlayWindow();
      showOverlay();
      expect(mockShowInactive).toHaveBeenCalled();
    });

    it('does not throw if window is destroyed', () => {
      createOverlayWindow();
      mockIsDestroyed.mockReturnValue(true);
      expect(() => showOverlay()).not.toThrow();
    });
  });

  describe('hideOverlay', () => {
    it('calls hide on the overlay window', () => {
      mockIsDestroyed.mockReturnValue(false);
      createOverlayWindow();
      hideOverlay();
      expect(mockHide).toHaveBeenCalled();
    });

    it('does not throw if window is destroyed', () => {
      createOverlayWindow();
      mockIsDestroyed.mockReturnValue(true);
      expect(() => hideOverlay()).not.toThrow();
    });
  });

  describe('destroyOverlay', () => {
    it('closes the overlay window', () => {
      mockIsDestroyed.mockReturnValue(false);
      createOverlayWindow();
      destroyOverlay();
      expect(mockClose).toHaveBeenCalled();
    });

    it('sets internal reference to null', () => {
      mockIsDestroyed.mockReturnValue(false);
      createOverlayWindow();
      destroyOverlay();
      expect(getOverlayWindow()).toBeNull();
    });
  });

  describe('getOverlayWindow', () => {
    it('returns null before creation', () => {
      destroyOverlay();
      expect(getOverlayWindow()).toBeNull();
    });

    it('returns window after creation', () => {
      mockIsDestroyed.mockReturnValue(false);
      createOverlayWindow();
      expect(getOverlayWindow()).toBe(mockBrowserWindowInstance);
    });
  });
});
