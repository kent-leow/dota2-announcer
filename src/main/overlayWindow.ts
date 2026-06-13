import { BrowserWindow, screen } from 'electron';
import * as path from 'path';
import { OverlayPosition, readAppState, writeAppState } from 'src/tts/stateStore';

let overlayWindow: BrowserWindow | null = null;

const OVERLAY_WIDTH = 350;
const OVERLAY_HEIGHT = 300;

function computePosition(position: OverlayPosition): { x: number; y: number } {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const y = Math.round((screenHeight - OVERLAY_HEIGHT) / 2);
  switch (position) {
    case 'left-center':
      return { x: 0, y };
    case 'right-center':
    default:
      return { x: screenWidth - OVERLAY_WIDTH, y };
  }
}

export function createOverlayWindow(): BrowserWindow {
  const state = readAppState();
  const { x, y } = computePosition(state.overlayPosition);

  overlayWindow = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    x,
    y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    fullscreenable: false,
    hasShadow: false,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'overlayPreload.js'),
    },
  });

  overlayWindow.setIgnoreMouseEvents(true);

  if (process.env.VITE_DEV_SERVER_URL) {
    overlayWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}src/overlay/index.html`);
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../renderer/src/overlay/index.html'));
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

export function setOverlayPosition(position: OverlayPosition): void {
  const state = readAppState();
  state.overlayPosition = position;
  writeAppState(state);
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    const { x, y } = computePosition(position);
    overlayWindow.setPosition(x, y);
  }
}

export function getOverlayPosition(): OverlayPosition {
  return readAppState().overlayPosition;
}

export function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow;
}
