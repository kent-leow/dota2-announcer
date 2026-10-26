import { DynamicEventConfig } from 'src/config/events.schema';
import { DEFAULT_DYNAMIC_EVENTS } from 'src/config/defaults';
import { readAppState } from 'src/tts/stateStore';
import { MAP_AWARENESS_EVENT_ID } from './constants';

export type ConfigListener = (config: DynamicEventConfig | undefined) => void;

function findEntry(entries: DynamicEventConfig[]): DynamicEventConfig | undefined {
  return entries.find((e) => e.id === MAP_AWARENESS_EVENT_ID);
}

let current: DynamicEventConfig | undefined = findEntry(DEFAULT_DYNAMIC_EVENTS.dynamicEvents);
let listeners: ConfigListener[] = [];

export function getConfig(): DynamicEventConfig | undefined {
  return current;
}

export function setConfig(config: DynamicEventConfig | undefined): void {
  current = config;
  listeners.forEach((cb) => cb(current));
}

export function setFromDynamicEvents(entries: DynamicEventConfig[]): void {
  setConfig(findEntry(entries));
}

export function loadFromAppState(): void {
  setFromDynamicEvents(readAppState().dynamicEvents);
}

export function onConfigChange(callback: ConfigListener): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function _resetForTesting(): void {
  current = findEntry(DEFAULT_DYNAMIC_EVENTS.dynamicEvents);
  listeners = [];
}
