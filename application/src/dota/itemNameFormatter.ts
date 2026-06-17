export function formatItemName(internalName: string): string {
  const stripped = internalName.replace(/^item_/, '');
  return stripped
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatHeroName(internalName: string): string {
  return internalName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
