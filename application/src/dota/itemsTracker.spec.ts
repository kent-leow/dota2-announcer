import { ParsedGameState } from './gsiTypes';

let gsiCallback: ((state: ParsedGameState) => void) | null = null;

jest.mock('./gsiServer', () => ({
  onStateChange: jest.fn((cb: (state: ParsedGameState) => void) => {
    gsiCallback = cb;
    return () => { gsiCallback = null; };
  }),
}));

jest.mock('src/config/eventsLoader', () => ({
  getDynamicEvents: jest.fn(() => ({
    dynamicEvents: [
      { id: 'hero-items', name: 'Hero Items', enabled: true, notifications: { acquired: true, sold: true } },
    ],
  })),
}));

import {
  startListening,
  onItemEvent,
  _resetForTesting,
  ItemEvent,
} from './itemsTracker';
import { getDynamicEvents } from 'src/config/eventsLoader';

function makeState(items: string[], heroName: string = 'ursa', matchId: string = 'match-1'): ParsedGameState {
  return {
    gameState: 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS',
    clockTime: 600,
    matchId,
    paused: false,
    daytime: true,
    roshanState: 'alive',
    roshanStateEndSeconds: 0,
    heroName,
    items,
  };
}

describe('itemsTracker', () => {
  let events: ItemEvent[];

  beforeEach(() => {
    _resetForTesting();
    gsiCallback = null;
    events = [];
    jest.clearAllMocks();
    (getDynamicEvents as jest.Mock).mockReturnValue({
      dynamicEvents: [
        { id: 'hero-items', name: 'Hero Items', enabled: true, notifications: { acquired: true, sold: true } },
      ],
    });
    startListening();
    onItemEvent((e) => events.push(e));
  });

  it('detects new item acquired', () => {
    gsiCallback?.(makeState(['item_black_king_bar']));
    // First tick initializes, no event
    expect(events).toHaveLength(0);

    gsiCallback?.(makeState(['item_black_king_bar', 'item_butterfly']));
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'item_acquired',
      heroName: 'Ursa',
      itemName: 'item_butterfly',
      displayName: 'Butterfly',
    });
  });

  it('detects item sold', () => {
    gsiCallback?.(makeState(['item_black_king_bar', 'item_butterfly']));
    gsiCallback?.(makeState(['item_black_king_bar']));

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'item_sold',
      heroName: 'Ursa',
      itemName: 'item_butterfly',
      displayName: 'Butterfly',
    });
  });

  it('slot swap (same multiset) fires no event', () => {
    gsiCallback?.(makeState(['item_black_king_bar', 'item_butterfly']));
    // Same items, different implicit ordering (multiset is identical)
    gsiCallback?.(makeState(['item_butterfly', 'item_black_king_bar']));

    expect(events).toHaveLength(0);
  });

  it('handles duplicate items correctly', () => {
    gsiCallback?.(makeState(['item_butterfly', 'item_butterfly', 'item_butterfly', 'item_butterfly']));
    gsiCallback?.(makeState(['item_butterfly', 'item_butterfly', 'item_butterfly', 'item_butterfly', 'item_butterfly']));

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('item_acquired');
    expect(events[0].displayName).toBe('Butterfly');
  });

  it('filters out consumables', () => {
    gsiCallback?.(makeState(['item_black_king_bar']));
    gsiCallback?.(makeState(['item_black_king_bar', 'item_tpscroll', 'item_clarity']));

    expect(events).toHaveLength(0);
  });

  it('filters out basic components', () => {
    gsiCallback?.(makeState(['item_black_king_bar']));
    gsiCallback?.(makeState(['item_black_king_bar', 'item_branches', 'item_boots']));

    expect(events).toHaveLength(0);
  });

  it('fires no event when disabled', () => {
    (getDynamicEvents as jest.Mock).mockReturnValue({
      dynamicEvents: [
        { id: 'hero-items', name: 'Hero Items', enabled: false, notifications: { acquired: true, sold: true } },
      ],
    });
    gsiCallback?.(makeState(['item_black_king_bar']));
    gsiCallback?.(makeState(['item_black_king_bar', 'item_butterfly']));

    expect(events).toHaveLength(0);
  });

  it('match ID change resets state without firing', () => {
    gsiCallback?.(makeState(['item_black_king_bar', 'item_butterfly'], 'ursa', 'match-1'));
    // New match with different items — should not fire (it's a reset)
    gsiCallback?.(makeState(['item_heart'], 'ursa', 'match-2'));

    expect(events).toHaveLength(0);
  });

  it('first tick of match does not fire', () => {
    gsiCallback?.(makeState(['item_black_king_bar', 'item_butterfly', 'item_heart']));
    expect(events).toHaveLength(0);
  });

  it('respects acquired notification toggle off', () => {
    (getDynamicEvents as jest.Mock).mockReturnValue({
      dynamicEvents: [
        { id: 'hero-items', name: 'Hero Items', enabled: true, notifications: { acquired: false, sold: true } },
      ],
    });
    gsiCallback?.(makeState(['item_black_king_bar']));
    gsiCallback?.(makeState(['item_black_king_bar', 'item_butterfly']));

    expect(events).toHaveLength(0);
  });

  it('respects sold notification toggle off', () => {
    (getDynamicEvents as jest.Mock).mockReturnValue({
      dynamicEvents: [
        { id: 'hero-items', name: 'Hero Items', enabled: true, notifications: { acquired: true, sold: false } },
      ],
    });
    gsiCallback?.(makeState(['item_black_king_bar', 'item_butterfly']));
    gsiCallback?.(makeState(['item_black_king_bar']));

    expect(events).toHaveLength(0);
  });
});
