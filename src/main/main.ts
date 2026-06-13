import { app, BrowserWindow, Tray, Menu, nativeImage, dialog } from 'electron';
import * as path from 'path';
import { registerIpcHandlers } from './ipcHandlers';
import { loadEvents } from 'src/config/eventsLoader';
import { loadMuteState } from 'src/tts/muteManager';
import { loadVolume } from 'src/tts/volumeController';
import { createOverlayWindow, showOverlay, hideOverlay, destroyOverlay } from './overlayWindow';
import * as matchStateManager from 'src/dota/matchStateManager';
import { readAppState } from 'src/tts/stateStore';
import { buildAppMenu } from './appMenu';
import { loadPreferences, savePreferences } from 'src/config/preferences';

app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disk-cache-dir', path.join(app.getPath('userData'), 'Cache'));

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

function getAssetPath(assetFile: string): string {
  if (process.env.VITE_DEV_SERVER_URL) {
    return path.join(__dirname, '../../assets', assetFile);
  }
  return path.join(app.getAppPath(), 'assets', assetFile);
}

function getAppIconPath(): string {
  return getAssetPath('dota2-announcer.png');
}

function createWindow(): BrowserWindow {
  let appIcon: Electron.NativeImage | undefined;
  try {
    appIcon = nativeImage.createFromPath(getAppIconPath());
    if (appIcon.isEmpty()) appIcon = undefined;
  } catch {
    appIcon = undefined;
  }

  mainWindow = new BrowserWindow({
    width: 600,
    height: 700,
    show: false,
    backgroundColor: '#0d1117',
    icon: appIcon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}src/renderer/index.html`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/src/renderer/index.html'));
  }

  mainWindow.on('close', (event) => {
    if (isQuitting) return;
    event.preventDefault();

    const prefs = loadPreferences();
    if (prefs.closeBehavior === 'minimize') {
      mainWindow?.hide();
      return;
    }
    if (prefs.closeBehavior === 'quit') {
      isQuitting = true;
      app.quit();
      return;
    }

    dialog.showMessageBox(mainWindow!, {
      type: 'question',
      title: 'Close Application',
      message: 'What would you like to do?',
      buttons: ['Minimize to Tray', 'Quit'],
      defaultId: 0,
      cancelId: 0,
      checkboxLabel: "Don't ask me again",
      checkboxChecked: false,
    }).then(({ response, checkboxChecked }) => {
      if (response === 0) {
        if (checkboxChecked) {
          savePreferences({ closeBehavior: 'minimize' });
        }
        mainWindow?.hide();
      } else {
        if (checkboxChecked) {
          savePreferences({ closeBehavior: 'quit' });
        }
        isQuitting = true;
        app.quit();
      }
    });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function getTrayIconPath(): string {
  return getAssetPath('dota2-announcer.png');
}

function createTray(): void {
  let icon: Electron.NativeImage;
  try {
    icon = nativeImage.createFromPath(getTrayIconPath());
    if (icon.isEmpty()) {
      icon = nativeImage.createEmpty();
    } else {
      icon = icon.resize({ width: 22, height: 22 });
      if (process.platform === 'darwin') {
        icon.setTemplateImage(true);
      }
    }
  } catch {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  tray.setToolTip('Dota 2 Announcer');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow?.show());
}


app.whenReady().then(() => {
  loadEvents();
  loadMuteState();
  loadVolume();
  registerIpcHandlers(() => mainWindow);
  createWindow();
  createTray();
  createOverlayWindow();

  const menu = buildAppMenu({
    getWindow: () => mainWindow,
    getAppVersion: () => app.getVersion(),
  });
  Menu.setApplicationMenu(menu);

  matchStateManager.onPhaseChange((phase) => {
    if (phase === 'in-match') {
      const state = readAppState();
      if (state.notification.enabled || state.persistent.enabled) {
        showOverlay();
      }
    } else {
      hideOverlay();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  destroyOverlay();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in main process:', error);
});

export { createWindow, getAssetPath };
