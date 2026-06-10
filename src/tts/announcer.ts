export type SpeakPriority = 'normal' | 'high';

export type SpeakFunction = (text: string, priority?: SpeakPriority) => void;

let volume = 100;
let rate = 1.0;
let muted = false;
let speaking = false;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let includeTimeSuffix = true;
let selectedVoiceUri: string | null = null;

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
  utterance.rate = rate;

  if (selectedVoiceUri) {
    const voices = synth.getVoices();
    const voice = voices.find((v) => v.voiceURI === selectedVoiceUri);
    if (voice) utterance.voice = voice;
  }

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

export function setRate(r: number): void {
  rate = Math.max(0.5, Math.min(3.0, r));
}

export function getRate(): number {
  return rate;
}

export function setVoice(voiceUri: string | null): void {
  selectedVoiceUri = voiceUri;
}

export function getSelectedVoice(): string | null {
  return selectedVoiceUri;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  const synth = getSynthesis();
  if (!synth) return [];
  return synth.getVoices();
}

export function _resetForTesting(): void {
  volume = 100;
  rate = 1.0;
  muted = false;
  speaking = false;
  currentUtterance = null;
  includeTimeSuffix = true;
  selectedVoiceUri = null;
}
