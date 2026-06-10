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
    isMinimized: jest.fn().mockReturnValue(false),
    restore: jest.fn(),
    focus: jest.fn(),
    isDestroyed: jest.fn().mockReturnValue(false),
    webContents: { openDevTools: jest.fn(), send: jest.fn() },
  }));

  (mockBrowserWindow as any).getAllWindows = jest.fn().mockReturnValue([]);

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

jest.mock('src/dota/matchStateManager', () => ({
  startListening: jest.fn(),
  stopListening: jest.fn(),
  getPhase: jest.fn(() => 'idle'),
  onPhaseChange: jest.fn(() => () => {}),
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
        height: 600,
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
});
