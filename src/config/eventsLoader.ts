import * as fs from 'fs';
import * as path from 'path';
import { eventsConfigSchema, EventsConfig } from './events.schema';
import { DEFAULT_EVENTS } from './defaults';

function getConfigPath(): string {
  try {
    const { app } = require('electron');
    return path.resolve(app.getPath('userData'), 'config', 'events.json');
  } catch {
    return path.resolve(process.cwd(), 'config', 'events.json');
  }
}

function getBundledConfigPath(): string {
  try {
    const { app } = require('electron');
    return path.resolve(app.getAppPath(), 'config', 'events.json');
  } catch {
    return path.resolve(process.cwd(), 'config', 'events.json');
  }
}

let cachedConfig: EventsConfig = DEFAULT_EVENTS;

export function loadEvents(filePath: string = getConfigPath()): EventsConfig {
  if (!fs.existsSync(filePath)) {
    const bundled = getBundledConfigPath();
    if (bundled !== filePath && fs.existsSync(bundled)) {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.copyFileSync(bundled, filePath);
    }
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(raw);
    const parsed = eventsConfigSchema.safeParse(json);

    if (parsed.success && parsed.data.events.length > 0) {
      cachedConfig = parsed.data;
    } else {
      cachedConfig = DEFAULT_EVENTS;
    }
  } catch {
    cachedConfig = DEFAULT_EVENTS;
  }

  return cachedConfig;
}

export function reload(filePath: string = getConfigPath()): EventsConfig {
  return loadEvents(filePath);
}

export function saveEvents(config: EventsConfig, filePath: string = getConfigPath()): EventsConfig {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf-8');
  cachedConfig = config;
  return cachedConfig;
}

export function getEvents(): EventsConfig {
  return cachedConfig;
}
