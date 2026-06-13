import { BrowserWindow, screen } from 'electron';
import * as path from 'path';

let overlayWindow: BrowserWindow | null = null;

const OVERLAY_WIDTH = 350;
const OVERLAY_HEIGHT = 600;

export function createOverlayWindow(): BrowserWindow {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

  overlayWindow = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    x: screenWidth - OVERLAY_WIDTH,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    fullscreenable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'overlayPreload.js'),
    },
  });

  overlayWindow.setIgnoreMouseEvents(true);

  if (process.env.VITE_DEV_SERVER_URL) {
    const overlayUrl = new URL('/src/overlay/index.html', process.env.VITE_DEV_SERVER_URL).href;
    overlayWindow.loadURL(overlayUrl);
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../overlay/index.html'));
  }

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });

  return overlayWindow;
}

export function showOverlay(): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.showInactive();
  }
}

export function hideOverlay(): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide();
  }
}

export function destroyOverlay(): void {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }
  overlayWindow = null;
}

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow;
}
