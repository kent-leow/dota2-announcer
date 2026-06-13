import { buildAppMenu } from './appMenu';

jest.mock('src/config/preferences', () => ({
  resetClosePreference: jest.fn(),
}));

jest.mock('src/config/eventsLoader', () => ({
  reload: jest.fn(() => ({ events: [] })),
}));

const mockShowMessageBox = jest.fn();
const mockBuildFromTemplate = jest.fn((template) => ({ items: template }));

jest.mock('electron', () => ({
  app: {
    quit: jest.fn(),
    isPackaged: false,
  },
  Menu: {
    buildFromTemplate: (t: unknown) => mockBuildFromTemplate(t),
  },
  dialog: {
    showMessageBox: (opts: unknown) => mockShowMessageBox(opts),
  },
  BrowserWindow: jest.fn(),
}));

describe('appMenu', () => {
  const mockWindow = {
    isDestroyed: () => false,
    webContents: { send: jest.fn(), toggleDevTools: jest.fn() },
  };
  const deps = {
    getWindow: () => mockWindow as any,
    toggleOverlay: jest.fn(),
    getAppVersion: () => '1.0.0',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds menu with File, View, Settings, Help', () => {
    buildAppMenu(deps);
    const template = mockBuildFromTemplate.mock.calls[0][0];
    const labels = template.map((item: any) => item.label);
    expect(labels).toEqual(['File', 'View', 'Settings', 'Help']);
  });

  it('File menu contains Reload Config and Quit', () => {
    buildAppMenu(deps);
    const template = mockBuildFromTemplate.mock.calls[0][0];
    const fileSubmenu = template[0].submenu;
    const fileLabels = fileSubmenu.filter((i: any) => i.label).map((i: any) => i.label);
    expect(fileLabels).toEqual(['Reload Config', 'Quit']);
  });

  it('View menu contains Toggle Overlay and Toggle DevTools in dev', () => {
    buildAppMenu(deps);
    const template = mockBuildFromTemplate.mock.calls[0][0];
    const viewSubmenu = template[1].submenu;
    const viewLabels = viewSubmenu.map((i: any) => i.label);
    expect(viewLabels).toContain('Toggle Overlay');
    expect(viewLabels).toContain('Toggle DevTools');
  });

  it('Help > User Guide sends menu:openGuide to renderer', () => {
    buildAppMenu(deps);
    const template = mockBuildFromTemplate.mock.calls[0][0];
    const helpSubmenu = template[3].submenu;
    const guideItem = helpSubmenu.find((i: any) => i.label === 'User Guide');
    guideItem.click();
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('menu:openGuide');
  });

  it('Help > About shows dialog with version', () => {
    buildAppMenu(deps);
    const template = mockBuildFromTemplate.mock.calls[0][0];
    const helpSubmenu = template[3].submenu;
    const aboutItem = helpSubmenu.find((i: any) => i.label === 'About');
    aboutItem.click();
    expect(mockShowMessageBox).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Dota 2 Announcer v1.0.0' }),
    );
  });

  it('File > Reload Config reloads events and notifies renderer', () => {
    const { reload } = require('src/config/eventsLoader');
    buildAppMenu(deps);
    const template = mockBuildFromTemplate.mock.calls[0][0];
    const fileSubmenu = template[0].submenu;
    const reloadItem = fileSubmenu.find((i: any) => i.label === 'Reload Config');
    reloadItem.click();
    expect(reload).toHaveBeenCalled();
    expect(mockWindow.webContents.send).toHaveBeenCalledWith('config:eventsChanged', { events: [] });
  });

  it('View > Toggle Overlay calls toggleOverlay', () => {
    buildAppMenu(deps);
    const template = mockBuildFromTemplate.mock.calls[0][0];
    const viewSubmenu = template[1].submenu;
    const overlayItem = viewSubmenu.find((i: any) => i.label === 'Toggle Overlay');
    overlayItem.click();
    expect(deps.toggleOverlay).toHaveBeenCalled();
  });

  it('Settings > Reset Close Behavior calls resetClosePreference', () => {
    const { resetClosePreference } = require('src/config/preferences');
    buildAppMenu(deps);
    const template = mockBuildFromTemplate.mock.calls[0][0];
    const settingsSubmenu = template[2].submenu;
    const resetItem = settingsSubmenu.find((i: any) => i.label === 'Reset Close Behavior');
    resetItem.click();
    expect(resetClosePreference).toHaveBeenCalled();
  });
});
