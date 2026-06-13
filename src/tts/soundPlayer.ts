let currentAudio: HTMLAudioElement | null = null;
let volume = 100;
let muted = false;

export function playSound(filePath: string): void {
  if (muted) return;

  stop();

  const audio = new Audio(filePath);
  audio.volume = volume / 100;
  audio.onended = () => { currentAudio = null; };
  audio.onerror = () => { currentAudio = null; };
  currentAudio = audio;
  audio.play().catch(() => { currentAudio = null; });
}

export function stop(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export function setVolume(v: number): void {
  volume = Math.max(0, Math.min(100, v));
  if (currentAudio) {
    currentAudio.volume = volume / 100;
  }
}

export function getVolume(): number {
  return volume;
}

export function setMuted(m: boolean): void {
  muted = m;
  if (m) stop();
}

export function getMuted(): boolean {
  return muted;
}

export function isPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused;
}

export function _resetForTesting(): void {
  stop();
  volume = 100;
  muted = false;
}
