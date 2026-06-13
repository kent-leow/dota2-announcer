import * as fs from 'fs';
import { loadPreferences, savePreferences, resetClosePreference } from './preferences';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('preferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFs.existsSync.mockReturnValue(true);
  });

  it('returns defaults when file missing', () => {
    mockedFs.readFileSync.mockImplementation(() => { throw new Error('ENOENT'); });
    const prefs = loadPreferences();
    expect(prefs).toEqual({ closeBehavior: 'ask' });
  });

  it('reads existing preferences', () => {
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ closeBehavior: 'minimize' }));
    const prefs = loadPreferences();
    expect(prefs.closeBehavior).toBe('minimize');
  });

  it('falls back to ask on invalid closeBehavior', () => {
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ closeBehavior: 'invalid' }));
    const prefs = loadPreferences();
    expect(prefs.closeBehavior).toBe('ask');
  });

  it('savePreferences writes to disk', () => {
    mockedFs.writeFileSync.mockReturnValue(undefined);
    savePreferences({ closeBehavior: 'quit' });
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify({ closeBehavior: 'quit' }, null, 2),
      'utf-8',
    );
  });

  it('savePreferences creates directory if missing', () => {
    mockedFs.existsSync.mockReturnValue(false);
    mockedFs.mkdirSync.mockReturnValue(undefined);
    mockedFs.writeFileSync.mockReturnValue(undefined);
    savePreferences({ closeBehavior: 'minimize' });
    expect(mockedFs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('resetClosePreference sets closeBehavior back to ask', () => {
    mockedFs.readFileSync.mockReturnValue(JSON.stringify({ closeBehavior: 'minimize' }));
    mockedFs.writeFileSync.mockReturnValue(undefined);
    resetClosePreference();
    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      JSON.stringify({ closeBehavior: 'ask' }, null, 2),
      'utf-8',
    );
  });
});
