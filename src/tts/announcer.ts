export type SpeakPriority = 'normal' | 'high';

export type SpeakFunction = (text: string, priority?: SpeakPriority) => void;

let volume = 100;
let muted = false;
let speaking = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let includeTimeSuffix = true;

function getSynthesis(): SpeechSynthesis | null {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis;
  }
  console.warn('[announcer] SpeechSynthesis not available');
  return null;
}

export function formatMessage(eventName: string, offsetSeconds: number): string {
  if (!includeTimeSuffix) return eventName;
  return `${eventName} in ${offsetSeconds} seconds`;
}

export function setIncludeTimeSuffix(value: boolean): void {
  includeTimeSuffix = value;
}

export function getIncludeTimeSuffix(): boolean {
  return includeTimeSuffix;
}

export function speak(text: string, priority: SpeakPriority = 'normal'): void {
  if (muted) return;

  const synth = getSynthesis();
  if (!synth) return;

  if (priority === 'high') {
    synth.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = volume / 100;
  utterance.onstart = () => { speaking = true; };
  utterance.onend = () => { speaking = false; currentUtterance = null; };
  utterance.onerror = () => { speaking = false; currentUtterance = null; };

  currentUtterance = utterance;
  synth.speak(utterance);
}

export function stop(): void {
  const synth = getSynthesis();
  if (synth) {
    synth.cancel();
  }
  speaking = false;
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  return speaking;
}

export function setVolume(v: number): void {
  volume = Math.max(0, Math.min(100, v));
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

export function _resetForTesting(): void {
  volume = 100;
  muted = false;
  speaking = false;
  currentUtterance = null;
  includeTimeSuffix = true;
}
