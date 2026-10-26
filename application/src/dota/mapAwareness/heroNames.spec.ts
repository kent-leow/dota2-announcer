import { displayName } from './heroNames';

describe('displayName', () => {
  it('maps internal names that differ from the in-game name', () => {
    expect(displayName('nevermore')).toBe('Shadow Fiend');
    expect(displayName('zuus')).toBe('Zeus');
    expect(displayName('furion')).toBe("Nature's Prophet");
    expect(displayName('antimage')).toBe('Anti-Mage');
    expect(displayName('keeper_of_the_light')).toBe('Keeper of the Light');
  });

  it('title-cases other names', () => {
    expect(displayName('crystal_maiden')).toBe('Crystal Maiden');
    expect(displayName('tidehunter')).toBe('Tidehunter');
  });

  it('falls back to "Enemy" for an empty name', () => {
    expect(displayName('')).toBe('Enemy');
  });
});
