import * as fs from 'fs';
import * as path from 'path';
import { eventsConfigSchema, EventsConfig, dynamicEventsConfigSchema, DynamicEventsConfig } from './events.schema';
import { DEFAULT_EVENTS, DEFAULT_DYNAMIC_EVENTS } from './defaults';

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
let cachedDynamicEvents: DynamicEventsConfig = DEFAULT_DYNAMIC_EVENTS;

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

    if (json.dynamicEvents) {
      const dynParsed = dynamicEventsConfigSchema.safeParse({ dynamicEvents: json.dynamicEvents });
      if (dynParsed.success) {
        cachedDynamicEvents = dynParsed.data;
      }
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

export function getDynamicEvents(): DynamicEventsConfig {
  return cachedDynamicEvents;
}

export function saveDynamicEvents(config: DynamicEventsConfig, filePath: string = getConfigPath()): DynamicEventsConfig {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let existing: Record<string, unknown> = {};
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    existing = JSON.parse(raw);
  } catch {
    existing = { events: cachedConfig.events };
  }

  existing.dynamicEvents = config.dynamicEvents;
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
  cachedDynamicEvents = config;
  return cachedDynamicEvents;
}
