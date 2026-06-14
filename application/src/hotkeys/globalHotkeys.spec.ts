jest.mock('electron', () => ({
  globalShortcut: {
    register: jest.fn(),
    unregisterAll: jest.fn(),
  },
  app: {
    on: jest.fn(),
  },
}));

jest.mock('src/tts/muteManager', () => ({
  toggleMute: jest.fn(() => true),
}));

jest.mock('src/config/eventsLoader', () => ({
  reload: jest.fn(),
}));

jest.mock('src/scheduler/eventScheduler', () => ({
  loadSchedule: jest.fn(),
}));

import { globalShortcut } from 'electron';
import * as muteManager from 'src/tts/muteManager';
import * as eventsLoader from 'src/config/eventsLoader';
import * as eventScheduler from 'src/scheduler/eventScheduler';
import {
  registerHotkeys,
  unregisterHotkeys,
  onHotkeyAction,
  _resetForTesting,
} from './globalHotkeys';

describe('globalHotkeys', () => {
  let registeredCallbacks: Record<string, () => void> = {};

  beforeEach(() => {
    _resetForTesting();
    jest.clearAllMocks();
    registeredCallbacks = {};

    (globalShortcut.register as jest.Mock).mockImplementation(
      (accelerator: string, callback: () => void) => {
        registeredCallbacks[accelerator] = callback;
      }
    );
  });

  it('registers Ctrl+Shift+M and Ctrl+Shift+R', () => {
    registerHotkeys();
    expect(globalShortcut.register).toHaveBeenCalledWith('Ctrl+Shift+M', expect.any(Function));
    expect(globalShortcut.register).toHaveBeenCalledWith('Ctrl+Shift+R', expect.any(Function));
  });

  it('pressing both keys ~50ms apart produces exactly one toggle + one reload', () => {
    registerHotkeys();

    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    registeredCallbacks['Ctrl+Shift+M']();

    jest.spyOn(Date, 'now').mockReturnValue(now + 50);
    registeredCallbacks['Ctrl+Shift+R']();

    expect(muteManager.toggleMute).toHaveBeenCalledTimes(1);
    expect(eventsLoader.reload).toHaveBeenCalledTimes(1);
    expect(eventScheduler.loadSchedule).toHaveBeenCalledTimes(1);

    jest.restoreAllMocks();
  });

  it('rapid repeated presses within debounce window produce exactly one action', () => {
    registerHotkeys();

    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    registeredCallbacks['Ctrl+Shift+M']();
    registeredCallbacks['Ctrl+Shift+M']();
    registeredCallbacks['Ctrl+Shift+M']();

    expect(muteManager.toggleMute).toHaveBeenCalledTimes(1);

    jest.spyOn(Date, 'now').mockReturnValue(now + 250);
    registeredCallbacks['Ctrl+Shift+M']();
    expect(muteManager.toggleMute).toHaveBeenCalledTimes(2);

    jest.restoreAllMocks();
  });

  it('fires action callback on hotkey press', () => {
    const callback = jest.fn();
    onHotkeyAction(callback);
    registerHotkeys();

    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);

    registeredCallbacks['Ctrl+Shift+M']();
    expect(callback).toHaveBeenCalledWith('mute-toggle');

    jest.spyOn(Date, 'now').mockReturnValue(now + 250);
    registeredCallbacks['Ctrl+Shift+R']();
    expect(callback).toHaveBeenCalledWith('reload-config');

    jest.restoreAllMocks();
  });

  it('unregisters all shortcuts on unregister call', () => {
    registerHotkeys();
    unregisterHotkeys();
    expect(globalShortcut.unregisterAll).toHaveBeenCalled();
  });
});
