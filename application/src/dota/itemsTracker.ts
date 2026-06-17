import * as gsiServer from './gsiServer';
import { ParsedGameState, GsiEvent } from './gsiTypes';
import { getDynamicEvents } from 'src/config/eventsLoader';
import { isNotableItem } from './itemFilter';
import { formatItemName, formatHeroName } from './itemNameFormatter';

export type ItemEventType = 'item_acquired' | 'item_sold';

export interface ItemEvent {
  type: ItemEventType;
  heroName: string;
  itemName: string;
  displayName: string;
}

export type ItemEventCallback = (event: ItemEvent) => void;

let listeners: ItemEventCallback[] = [];
let unsubGsi: (() => void) | null = null;
let previousItems: Map<string, number> = new Map();
let previousMatchId: string = '';
let initialized = false;
let lastProcessedAegisTime: number = -1;

function getConfig() {
  const dynamic = getDynamicEvents();
  return dynamic.dynamicEvents.find((e) => e.id === 'hero-items');
}

function toMultiset(items: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item, (map.get(item) || 0) + 1);
  }
  return map;
}

function processEventItems(state: ParsedGameState, notifications: { acquired?: boolean }): void {
  if (!notifications.acquired) return;

  const aegisEvent = state.events.find(
    (e: GsiEvent) => e.event_type === 'aegis_picked_up' && e.game_time !== lastProcessedAegisTime,
  );

  if (aegisEvent) {
    lastProcessedAegisTime = aegisEvent.game_time;
    notify({
      type: 'item_acquired',
      heroName: formatHeroName(state.heroName),
      itemName: 'item_aegis',
      displayName: 'Aegis of the Immortal',
    });
  }
}

function handleGsiState(state: ParsedGameState): void {
  const config = getConfig();
  if (!config || !config.enabled) return;

  const notifications = config.notifications as { acquired?: boolean; sold?: boolean };

  processEventItems(state, notifications);

  if (state.matchId !== previousMatchId) {
    previousMatchId = state.matchId;
    previousItems = toMultiset(state.items);
    initialized = true;
    return;
  }

  if (!initialized) {
    previousItems = toMultiset(state.items);
    initialized = true;
    return;
  }

  const currentItems = toMultiset(state.items);

  if (notifications.acquired) {
    for (const [item, count] of currentItems) {
      const prevCount = previousItems.get(item) || 0;
      if (count > prevCount && isNotableItem(item)) {
        const added = count - prevCount;
        for (let i = 0; i < added; i++) {
          notify({
            type: 'item_acquired',
            heroName: formatHeroName(state.heroName),
            itemName: item,
            displayName: formatItemName(item),
          });
        }
      }
    }
  }

  if (notifications.sold) {
    for (const [item, count] of previousItems) {
      const currCount = currentItems.get(item) || 0;
      if (currCount < count && isNotableItem(item)) {
        const removed = count - currCount;
        for (let i = 0; i < removed; i++) {
          notify({
            type: 'item_sold',
            heroName: formatHeroName(state.heroName),
            itemName: item,
            displayName: formatItemName(item),
          });
        }
      }
    }
  }

  previousItems = currentItems;
}

function notify(event: ItemEvent): void {
  listeners.forEach((cb) => cb(event));
}

export function startListening(): void {
  if (unsubGsi) return;
  unsubGsi = gsiServer.onStateChange(handleGsiState);
}

export function stopListening(): void {
  if (unsubGsi) {
    unsubGsi();
    unsubGsi = null;
  }
}

export function onItemEvent(callback: ItemEventCallback): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function reset(): void {
  previousItems = new Map();
  previousMatchId = '';
  initialized = false;
  lastProcessedAegisTime = -1;
}

export function _resetForTesting(): void {
  stopListening();
  reset();
  listeners = [];
}
