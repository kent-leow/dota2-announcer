function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export const PLACEHOLDER_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="28" fill="#3c3c50" opacity="0.8"/><text x="32" y="40" text-anchor="middle" font-size="28" font-family="sans-serif" fill="#c8aa32">?</text></svg>`
);

export const BOUNTY_RUNE_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><path d="M32 12 L38 28 L54 28 L41 38 L46 54 L32 44 L18 54 L23 38 L10 28 L26 28 Z" fill="#f5a623" stroke="#d4920a" stroke-width="1.5"/></svg>`
);

export const WATER_RUNE_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><path d="M32 14 C32 14 18 30 18 40 C18 48 24 54 32 54 C40 54 46 48 46 40 C46 30 32 14 32 14Z" fill="#4fc3f7" stroke="#0288d1" stroke-width="1.5"/></svg>`
);

export const POWER_RUNE_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><polygon points="34,10 22,36 30,36 28,54 42,28 34,28" fill="#ff6f00" stroke="#e65100" stroke-width="1.5"/></svg>`
);

export const WISDOM_RUNE_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><path d="M20 44 L32 16 L44 44 Z" fill="none" stroke="#ab47bc" stroke-width="3"/><circle cx="32" cy="36" r="4" fill="#ab47bc"/></svg>`
);

export const LOTUS_RUNE_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><ellipse cx="32" cy="36" rx="6" ry="14" fill="#e91e63" opacity="0.8"/><ellipse cx="24" cy="38" rx="5" ry="12" fill="#e91e63" opacity="0.6" transform="rotate(-20 24 38)"/><ellipse cx="40" cy="38" rx="5" ry="12" fill="#e91e63" opacity="0.6" transform="rotate(20 40 38)"/></svg>`
);

export const NIGHT_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><path d="M36 16 C28 16 22 22 22 32 C22 42 28 48 36 48 C30 44 28 38 28 32 C28 26 30 20 36 16Z" fill="#b0bec5" stroke="#78909c" stroke-width="1"/><circle cx="42" cy="20" r="1.5" fill="#fff9c4"/><circle cx="46" cy="28" r="1" fill="#fff9c4"/><circle cx="44" cy="42" r="1.2" fill="#fff9c4"/></svg>`
);

export const DAY_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><circle cx="32" cy="32" r="12" fill="#fdd835"/><g stroke="#fdd835" stroke-width="2.5" stroke-linecap="round"><line x1="32" y1="14" x2="32" y2="18"/><line x1="32" y1="46" x2="32" y2="50"/><line x1="14" y1="32" x2="18" y2="32"/><line x1="46" y1="32" x2="50" y2="32"/><line x1="19" y1="19" x2="22" y2="22"/><line x1="42" y1="42" x2="45" y2="45"/><line x1="19" y1="45" x2="22" y2="42"/><line x1="42" y1="22" x2="45" y2="19"/></g></svg>`
);

export const NEUTRAL_CAMP_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><rect x="20" y="28" width="24" height="20" rx="3" fill="#4e342e" stroke="#3e2723" stroke-width="1.5"/><rect x="24" y="24" width="16" height="6" rx="2" fill="#6d4c41"/><circle cx="28" cy="38" r="3" fill="#ffcc02"/><circle cx="36" cy="38" r="3" fill="#ffcc02"/></svg>`
);

export const TORMENTOR_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><path d="M32 16 L38 24 L46 24 L40 32 L44 42 L32 36 L20 42 L24 32 L18 24 L26 24 Z" fill="#b71c1c" stroke="#7f0000" stroke-width="1.5"/><circle cx="32" cy="28" r="4" fill="#ff5252"/></svg>`
);

export const AGHANIM_SHARD_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><polygon points="32,14 38,26 44,44 32,40 20,44 26,26" fill="#7c4dff" stroke="#6200ea" stroke-width="1.5"/><line x1="32" y1="14" x2="32" y2="40" stroke="#b388ff" stroke-width="1" opacity="0.6"/></svg>`
);

export const SIEGE_CREEP_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><rect x="18" y="30" width="28" height="16" rx="3" fill="#546e7a" stroke="#37474f" stroke-width="1.5"/><rect x="30" y="22" width="4" height="12" fill="#78909c"/><circle cx="32" cy="20" r="4" fill="#ff8a65" stroke="#e64a19" stroke-width="1"/></svg>`
);

export const FLAGBEARER_CREEP_ICON = svgToDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="26" fill="#1a1a2e"/><line x1="26" y1="50" x2="26" y2="18" stroke="#8d6e63" stroke-width="2.5"/><polygon points="28,18 46,24 28,30" fill="#c62828"/><rect x="22" y="36" width="20" height="14" rx="2" fill="#5d4037" stroke="#3e2723" stroke-width="1"/></svg>`
);

export const DEFAULT_EVENT_ICONS: Record<string, string> = {
  'bounty-rune': BOUNTY_RUNE_ICON,
  'water-rune': WATER_RUNE_ICON,
  'power-rune': POWER_RUNE_ICON,
  'wisdom-rune': WISDOM_RUNE_ICON,
  'lotus-rune': LOTUS_RUNE_ICON,
  'night': NIGHT_ICON,
  'day': DAY_ICON,
  'neutral-camp': NEUTRAL_CAMP_ICON,
  'tormentor': TORMENTOR_ICON,
  'aghanim-shard': AGHANIM_SHARD_ICON,
  'siege-creep': SIEGE_CREEP_ICON,
  'flagbearer-creep': FLAGBEARER_CREEP_ICON,
};
