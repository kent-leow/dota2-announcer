import { app, Menu, dialog, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import { resetClosePreference } from 'src/config/preferences';

interface MenuDeps {
  getWindow: () => BrowserWindow | null;
  getAppVersion: () => string;
}

export function buildAppMenu(deps: MenuDeps): Menu {
  const { getWindow, getAppVersion } = deps;

  const template: MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        ...(!app.isPackaged ? [{
          label: 'Toggle DevTools',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: () => {
            const win = getWindow();
            if (win && !win.isDestroyed()) {
              win.webContents.toggleDevTools();
            }
          },
        } as MenuItemConstructorOptions] : []),
      ],
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Reset Close Behavior',
          click: () => {
            resetClosePreference();
            dialog.showMessageBox({
              type: 'info',
              title: 'Settings',
              message: 'Close behavior has been reset. You will be asked again next time you close the window.',
            });
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'User Guide',
          click: () => {
            const win = getWindow();
            if (win && !win.isDestroyed()) {
              win.webContents.send('menu:openGuide');
            }
          },
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About Dota 2 Announcer',
              message: `Dota 2 Announcer v${getAppVersion()}`,
              detail: 'Game event announcer with TTS and in-game overlay for Dota 2.',
            });
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
