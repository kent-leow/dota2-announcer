jest.mock('src/tts/stateStore', () => ({
  readAppState: jest.fn(() => ({
    dynamicEvents: [
      { id: 'roshan', name: 'Roshan', enabled: true, notifications: { kill: true } },
      { id: 'map-awareness', name: 'Map Awareness', enabled: false, notifications: { visible: true, fog: true }, settings: { leadSeconds: 7 } },
    ],
  })),
}));

import * as configHolder from './configHolder';

describe('configHolder', () => {
  beforeEach(() => {
    configHolder._resetForTesting();
  });

  it('defaults to the built-in map-awareness entry', () => {
    expect(configHolder.getConfig()).toMatchObject({ id: 'map-awareness', enabled: true });
  });

  it('loads the map-awareness entry from app state', () => {
    configHolder.loadFromAppState();
    expect(configHolder.getConfig()).toMatchObject({ enabled: false, settings: { leadSeconds: 7 } });
  });

  it('replaces the config and notifies listeners', () => {
    const listener = jest.fn();
    configHolder.onConfigChange(listener);
    configHolder.setFromDynamicEvents([{ id: 'map-awareness', name: 'Map Awareness', enabled: true, notifications: { fog: false } }]);
    expect(configHolder.getConfig()!.notifications.fog).toBe(false);
    expect(listener).toHaveBeenCalledWith(configHolder.getConfig());
  });

  it('stops notifying after unsubscribe', () => {
    const listener = jest.fn();
    const unsub = configHolder.onConfigChange(listener);
    unsub();
    configHolder.setConfig(undefined);
    expect(listener).not.toHaveBeenCalled();
  });
});
