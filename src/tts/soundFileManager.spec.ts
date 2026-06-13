import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const TEST_DIR = path.join(os.tmpdir(), 'soundfile-test');
const TEST_SOUNDS_DIR = path.join(TEST_DIR, 'sounds');

jest.mock('electron', () => ({
  app: {
    getPath: () => path.join(os.tmpdir(), 'soundfile-test'),
    getAppPath: () => path.join(os.tmpdir(), 'soundfile-test', 'app'),
  },
}));

import { validateAudioFile, copyToSoundsDir, deleteSoundFile, getCustomSoundPath, getBundledSoundPath } from './soundFileManager';

describe('soundFileManager', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_SOUNDS_DIR)) {
      fs.mkdirSync(TEST_SOUNDS_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    try { fs.rmSync(TEST_DIR, { recursive: true }); } catch {}
  });

  describe('validateAudioFile', () => {
    it('rejects invalid extension', () => {
      const fakeFile = path.join(TEST_SOUNDS_DIR, 'test.txt');
      fs.writeFileSync(fakeFile, 'data');
      const result = validateAudioFile(fakeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
      fs.unlinkSync(fakeFile);
    });

    it('rejects file over 2MB', () => {
      const bigFile = path.join(TEST_SOUNDS_DIR, 'big.mp3');
      fs.writeFileSync(bigFile, Buffer.alloc(3 * 1024 * 1024));
      const result = validateAudioFile(bigFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
      fs.unlinkSync(bigFile);
    });

    it('accepts valid mp3 under 2MB', () => {
      const validFile = path.join(TEST_SOUNDS_DIR, 'valid.mp3');
      fs.writeFileSync(validFile, Buffer.alloc(1024));
      const result = validateAudioFile(validFile);
      expect(result.valid).toBe(true);
      fs.unlinkSync(validFile);
    });

    it('rejects non-existent file', () => {
      const result = validateAudioFile('/does/not/exist.mp3');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('accepts .wav files', () => {
      const wavFile = path.join(TEST_SOUNDS_DIR, 'test.wav');
      fs.writeFileSync(wavFile, Buffer.alloc(512));
      expect(validateAudioFile(wavFile).valid).toBe(true);
      fs.unlinkSync(wavFile);
    });

    it('accepts .ogg files', () => {
      const oggFile = path.join(TEST_SOUNDS_DIR, 'test.ogg');
      fs.writeFileSync(oggFile, Buffer.alloc(512));
      expect(validateAudioFile(oggFile).valid).toBe(true);
      fs.unlinkSync(oggFile);
    });
  });

  describe('copyToSoundsDir', () => {
    it('copies file and returns filename', () => {
      const srcFile = path.join(TEST_SOUNDS_DIR, 'source.mp3');
      fs.writeFileSync(srcFile, 'audio data');
      const filename = copyToSoundsDir(srcFile);
      expect(filename).toBe('source.mp3');
      const destPath = getCustomSoundPath(filename);
      expect(fs.existsSync(destPath)).toBe(true);
      fs.unlinkSync(srcFile);
    });
  });

  describe('deleteSoundFile', () => {
    it('deletes existing file', () => {
      const filePath = getCustomSoundPath('delete-me.mp3');
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, 'data');
      deleteSoundFile('delete-me.mp3');
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('does not throw for non-existent file', () => {
      expect(() => deleteSoundFile('nonexistent.mp3')).not.toThrow();
    });
  });

  describe('getBundledSoundPath', () => {
    it('returns a path containing assets/sounds', () => {
      const result = getBundledSoundPath('bounty-rune.mp3');
      expect(result).toContain('assets');
      expect(result).toContain('sounds');
      expect(result).toContain('bounty-rune.mp3');
    });
  });
});
