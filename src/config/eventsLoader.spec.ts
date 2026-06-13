import * as fs from 'fs';
import { loadEvents, reload, getEvents, saveEvents } from './eventsLoader';
import { DEFAULT_EVENTS } from './defaults';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('eventsLoader', () => {
  const validConfig = {
    events: [
      {
        id: 'test-event',
        name: 'Test Event',
        spawnTime: 120,
        warnings: [{ offsetSeconds: 30 }],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.existsSync.mockReturnValue(true);
  });

  it('loads valid config from disk', () => {
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(validConfig));
    const result = loadEvents('/fake/path.json');

    expect(result.events).toHaveLength(1);
    expect(result.events[0].id).toBe('test-event');
  });

  it('falls back to defaults on malformed JSON', () => {
    mockedFs.readFileSync.mockReturnValue('not valid json {{{');
    const result = loadEvents('/fake/path.json');

    expect(result).toEqual(DEFAULT_EVENTS);
  });

  it('falls back to defaults on validation failure', () => {
    const invalid = { events: [{ name: 'Missing ID' }] };
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(invalid));
    const result = loadEvents('/fake/path.json');

    expect(result).toEqual(DEFAULT_EVENTS);
  });

  it('falls back to defaults when file does not exist and no bundled fallback', () => {
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.readFileSync.mockImplementation(() => {
      throw new Error('ENOENT');
    });
    const result = loadEvents('/fake/path.json');

    expect(result).toEqual(DEFAULT_EVENTS);
  });

  it('copies bundled config on first run when userData file missing', () => {
    mockedFs.existsSync.mockImplementation((p) => {
      if (p === '/userData/config/events.json') return false;
      if (p === '/bundled/config/events.json') return true;
      if (p === '/userData/config') return false;
      return false;
    });
    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.copyFileSync.mockReturnValue(undefined);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(validConfig));

    jest.doMock('electron', () => ({
      app: {
        getPath: (key: string) => key === 'userData' ? '/userData' : '/userData',
        getAppPath: () => '/bundled',
      },
    }));

    const eventsLoader = require('./eventsLoader');
    const result = eventsLoader.loadEvents('/userData/config/events.json');

    expect(mockedFs.copyFileSync).toHaveBeenCalledWith(
      '/bundled/config/events.json',
      '/userData/config/events.json',
    );
    expect(result.events[0].id).toBe('test-event');
  });

  it('reload fetches fresh disk state', () => {
    const config1 = {
      events: [{ id: 'first', name: 'First', spawnTime: 60 }],
    };
    const config2 = {
      events: [{ id: 'second', name: 'Second', spawnTime: 120 }],
    };

    mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(config1));
    loadEvents('/fake/path.json');

    mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(config2));
    const reloaded = reload('/fake/path.json');

    expect(reloaded.events[0].id).toBe('second');
  });

  it('getEvents returns cached config', () => {
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(validConfig));
    loadEvents('/fake/path.json');

    const cached = getEvents();
    expect(cached.events[0].id).toBe('test-event');
  });

  it('falls back to defaults on empty events array', () => {
    const empty = { events: [] };
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(empty));
    const result = loadEvents('/fake/path.json');

    expect(result).toEqual(DEFAULT_EVENTS);
  });

  it('saveEvents writes to specified path', () => {
    mockedFs.writeFileSync.mockReturnValue(undefined);
    const result = saveEvents(validConfig as any, '/fake/output.json');

    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      '/fake/output.json',
      JSON.stringify(validConfig, null, 2),
      'utf-8',
    );
    expect(result.events[0].id).toBe('test-event');
  });

  it('saveEvents creates directory if missing', () => {
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.writeFileSync.mockReturnValue(undefined);

    saveEvents(validConfig as any, '/new/dir/events.json');

    expect(mockedFs.mkdirSync).toHaveBeenCalledWith('/new/dir', { recursive: true });
  });
});
