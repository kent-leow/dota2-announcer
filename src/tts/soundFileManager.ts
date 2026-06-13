import * as fs from 'fs';
import * as path from 'path';

const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function getSoundsDir(): string {
  try {
    const { app } = require('electron');
    return path.resolve(app.getPath('userData'), 'sounds');
  } catch {
    return path.resolve(process.cwd(), 'config', 'sounds');
  }
}

export function getBundledSoundPath(filename: string): string {
  try {
    const { app } = require('electron');
    if (process.env.VITE_DEV_SERVER_URL) {
      return path.join(path.dirname(path.dirname(__dirname)), 'assets', 'sounds', filename);
    }
    return path.join(app.getAppPath(), 'assets', 'sounds', filename);
  } catch {
    return path.resolve(process.cwd(), 'assets', 'sounds', filename);
  }
}

export function getCustomSoundPath(filename: string): string {
  return path.join(getSoundsDir(), filename);
}

export function validateAudioFile(filePath: string): { valid: boolean; error?: string } {
  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Invalid file type "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }

  try {
    const stats = fs.statSync(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File too large (${(stats.size / 1024 / 1024).toFixed(1)}MB). Max: 2MB` };
    }
  } catch {
    return { valid: false, error: 'File not found or not accessible' };
  }

  return { valid: true };
}

export function copyToSoundsDir(sourcePath: string): string {
  const dir = getSoundsDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = path.basename(sourcePath);
  const destPath = path.join(dir, filename);
  fs.copyFileSync(sourcePath, destPath);
  return filename;
}

export function deleteSoundFile(filename: string): void {
  const filePath = getCustomSoundPath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
