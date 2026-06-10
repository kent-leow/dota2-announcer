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
    webContents: { openDevTools: jest.fn() },
  }));

  (mockBrowserWindow as any).getAllWindows = jest.fn().mockReturnValue([]);

  return {
    app: {
      whenReady: jest.fn().mockResolvedValue(undefined),
      on: mockOn,
      quit: jest.fn(),
      commandLine: { appendSwitch: jest.fn() },
      getPath: jest.fn().mockReturnValue('/tmp/mock-user-data'),
      requestSingleInstanceLock: jest.fn().mockReturnValue(true),
    },
    BrowserWindow: mockBrowserWindow,
  };
});

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
