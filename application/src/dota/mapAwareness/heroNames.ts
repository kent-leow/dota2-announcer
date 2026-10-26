const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  abyssal_underlord: 'Underlord',
  antimage: 'Anti-Mage',
  centaur: 'Centaur Warrunner',
  doom_bringer: 'Doom',
  furion: "Nature's Prophet",
  keeper_of_the_light: 'Keeper of the Light',
  life_stealer: 'Lifestealer',
  magnataur: 'Magnus',
  necrolyte: 'Necrophos',
  nevermore: 'Shadow Fiend',
  obsidian_destroyer: 'Outworld Destroyer',
  queenofpain: 'Queen of Pain',
  rattletrap: 'Clockwerk',
  shredder: 'Timbersaw',
  skeleton_king: 'Wraith King',
  treant: 'Treant Protector',
  vengefulspirit: 'Vengeful Spirit',
  windrunner: 'Windranger',
  wisp: 'Io',
  zuus: 'Zeus',
};

const UNKNOWN_HERO = 'Enemy';

export function displayName(internal: string): string {
  if (!internal) return UNKNOWN_HERO;
  const override = DISPLAY_NAME_OVERRIDES[internal];
  if (override) return override;
  return internal
    .split('_')
    .filter((part) => part.length > 0)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}
