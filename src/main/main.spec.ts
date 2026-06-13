const mockOn = jest.fn();
const mockLoadFile = jest.fn();
const mockLoadURL = jest.fn();
const mockWindowOn = jest.fn();
const mockWindowOnce = jest.fn();

jest.mock('electron', () => {
  const mockBrowserWindow = jest.fn().mockImplementation(() => ({
    loadFile: mockLoadFile,
    loadURL: mockLoadURL,
    on: mockWindowOn,
    once: mockWindowOnce,
    show: jest.fn(),
    hide: jest.fn(),
    isMinimized: jest.fn().mockReturnValue(false),
    restore: jest.fn(),
    focus: jest.fn(),
    isDestroyed: jest.fn().mockReturnValue(false),
    webContents: { openDevTools: jest.fn(), send: jest.fn() },
  }));

  (mockBrowserWindow as any).getAllWindows = jest.fn().mockReturnValue([]);

  const mockTray = jest.fn().mockImplementation(() => ({
    setToolTip: jest.fn(),
    setContextMenu: jest.fn(),
    on: jest.fn(),
  }));

  return {
    app: {
      whenReady: jest.fn().mockResolvedValue(undefined),
      on: mockOn,
      quit: jest.fn(),
      commandLine: { appendSwitch: jest.fn() },
      getPath: jest.fn().mockReturnValue('/tmp/mock-user-data'),
      getAppPath: jest.fn().mockReturnValue('/tmp/mock-app'),
      requestSingleInstanceLock: jest.fn().mockReturnValue(true),
    },
    BrowserWindow: mockBrowserWindow,
    Tray: mockTray,
    Menu: { buildFromTemplate: jest.fn().mockReturnValue({}) },
    nativeImage: {
      createEmpty: jest.fn().mockReturnValue({ isEmpty: () => true }),
      createFromPath: jest.fn().mockReturnValue({ isEmpty: () => true }),
    },
    ipcMain: {
      handle: jest.fn(),
    },
  };
});

jest.mock('src/config/eventsLoader', () => ({
  loadEvents: jest.fn(),
  getEvents: jest.fn(() => ({ events: [] })),
  reload: jest.fn(() => ({ events: [] })),
}));

jest.mock('src/tts/muteManager', () => ({
  loadMuteState: jest.fn(() => false),
  toggleMute: jest.fn(() => true),
  setMuted: jest.fn(),
  isMuted: jest.fn(() => false),
}));

jest.mock('src/tts/volumeController', () => ({
  loadVolume: jest.fn(() => 100),
  setVolume: jest.fn(),
  getVolume: jest.fn(() => 100),
}));

jest.mock('src/dota/processDetector', () => ({
  startDetection: jest.fn(),
  stopDetection: jest.fn(),
  getState: jest.fn(() => 'idle'),
  onStateChange: jest.fn(() => () => {}),
}));

jest.mock('src/dota/gsiServer', () => ({
  start: jest.fn(() => Promise.resolve()),
  stop: jest.fn(() => Promise.resolve()),
  onStateChange: jest.fn(() => () => {}),
  getLastState: jest.fn(() => null),
}));

const mockOnPhaseChange = jest.fn(() => () => {});
jest.mock('src/dota/matchStateManager', () => ({
  startListening: jest.fn(),
  stopListening: jest.fn(),
  getPhase: jest.fn(() => 'idle'),
  isPaused: jest.fn(() => false),
  onPhaseChange: mockOnPhaseChange,
  onPauseChange: jest.fn(() => () => {}),
}));

const mockCreateOverlayWindow = jest.fn();
const mockShowOverlay = jest.fn();
const mockHideOverlay = jest.fn();
const mockDestroyOverlay = jest.fn();
jest.mock('./overlayWindow', () => ({
  createOverlayWindow: mockCreateOverlayWindow,
  showOverlay: mockShowOverlay,
  hideOverlay: mockHideOverlay,
  destroyOverlay: mockDestroyOverlay,
  getOverlayWindow: jest.fn(),
}));

describe('main process', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('creates a BrowserWindow with expected dimensions', () => {
    const { BrowserWindow } = require('electron');
    const { createWindow } = require('./main');
    const win = createWindow();

    expect(BrowserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 400,
        height: 700,
      })
    );
    expect(win).toBeDefined();
  });

  it('registers window-all-closed handler', () => {
    jest.isolateModules(() => {
      require('./main');
    });
    expect(mockOn).toHaveBeenCalledWith('window-all-closed', expect.any(Function));
  });

  it('calls createOverlayWindow on app ready', async () => {
    require('./main');
    await Promise.resolve();
    expect(mockCreateOverlayWindow).toHaveBeenCalled();
  });

  it('registers overlay phase change handler', async () => {
    require('./main');
    await Promise.resolve();
    expect(mockOnPhaseChange).toHaveBeenCalledWith(expect.any(Function));
  });
});
