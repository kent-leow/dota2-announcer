import { formatItemName, formatHeroName } from './itemNameFormatter';

describe('formatItemName', () => {
  it('strips item_ prefix and title-cases', () => {
    expect(formatItemName('item_black_king_bar')).toBe('Black King Bar');
  });

  it('handles single word items', () => {
    expect(formatItemName('item_butterfly')).toBe('Butterfly');
  });

  it('handles two word items', () => {
    expect(formatItemName('item_swift_blink')).toBe('Swift Blink');
  });

  it('handles name without item_ prefix gracefully', () => {
    expect(formatItemName('butterfly')).toBe('Butterfly');
  });
});

describe('formatHeroName', () => {
  it('title-cases hero name', () => {
    expect(formatHeroName('ursa')).toBe('Ursa');
  });

  it('handles multi-word hero names', () => {
    expect(formatHeroName('death_prophet')).toBe('Death Prophet');
  });

  it('handles skeleton_king', () => {
    expect(formatHeroName('skeleton_king')).toBe('Skeleton King');
  });
});
