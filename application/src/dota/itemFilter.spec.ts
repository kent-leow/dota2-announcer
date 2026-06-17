import { isNotableItem } from './itemFilter';

describe('itemFilter', () => {
  it('returns false for consumables', () => {
    expect(isNotableItem('item_tpscroll')).toBe(false);
    expect(isNotableItem('item_ward_observer')).toBe(false);
    expect(isNotableItem('item_clarity')).toBe(false);
    expect(isNotableItem('item_smoke_of_deceit')).toBe(false);
    expect(isNotableItem('item_dust')).toBe(false);
  });

  it('returns false for basic components', () => {
    expect(isNotableItem('item_branches')).toBe(false);
    expect(isNotableItem('item_circlet')).toBe(false);
    expect(isNotableItem('item_boots')).toBe(false);
    expect(isNotableItem('item_magic_stick')).toBe(false);
    expect(isNotableItem('item_quarterstaff')).toBe(false);
  });

  it('returns false for recipes', () => {
    expect(isNotableItem('item_recipe')).toBe(false);
    expect(isNotableItem('item_recipe_black_king_bar')).toBe(false);
  });

  it('returns true for completed items', () => {
    expect(isNotableItem('item_black_king_bar')).toBe(true);
    expect(isNotableItem('item_butterfly')).toBe(true);
    expect(isNotableItem('item_blink')).toBe(true);
    expect(isNotableItem('item_swift_blink')).toBe(true);
    expect(isNotableItem('item_heart')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isNotableItem('')).toBe(false);
  });
});
