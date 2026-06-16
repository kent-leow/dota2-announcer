const SIZE_TABLE: Array<{ name: number; offset: number; icon: number; spawn: number }> = [
  { name: 9, offset: 7, icon: 9, spawn: 7 },
  { name: 11, offset: 9, icon: 11, spawn: 9 },
  { name: 13, offset: 10, icon: 13, spawn: 10 },
  { name: 14, offset: 11, icon: 14, spawn: 11 },
  { name: 15, offset: 12, icon: 15, spawn: 12 },
  { name: 17, offset: 14, icon: 17, spawn: 14 },
  { name: 19, offset: 15, icon: 19, spawn: 15 },
  { name: 21, offset: 17, icon: 21, spawn: 17 },
  { name: 23, offset: 19, icon: 23, spawn: 19 },
  { name: 26, offset: 21, icon: 26, spawn: 21 },
];

export const DEFAULT_OVERLAY_SIZE = 5;

export function sizeToPixels(size: number): { name: number; offset: number; icon: number; spawn: number } {
  const idx = Math.max(0, Math.min(9, size - 1));
  return SIZE_TABLE[idx];
}

export function fontSizeToOverlaySize(nameSize: number): number {
  let closest = 5;
  let minDiff = Infinity;
  for (let i = 0; i < SIZE_TABLE.length; i++) {
    const diff = Math.abs(SIZE_TABLE[i].name - nameSize);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i + 1;
    }
  }
  return closest;
}
