/**
 * Generates cartoon-style sound effects for Dota 2 announcer events.
 * Each sound is 2-4 seconds, high-pitched, and has a distinct recognizable pattern.
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

function writeWav(filename, samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * 2;

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, filename), buffer);
  console.log(`  ✓ ${filename} (${(buffer.length / 1024).toFixed(1)} KB, ${(samples.length / SAMPLE_RATE).toFixed(2)}s)`);
}

function envelope(t, attack, decay, sustain, release, duration) {
  if (t < attack) return t / attack;
  if (t < attack + decay) return 1 - (1 - sustain) * ((t - attack) / decay);
  if (t < duration - release) return sustain;
  return sustain * (1 - (t - (duration - release)) / release);
}

function sine(t, freq) {
  return Math.sin(2 * Math.PI * freq * t);
}

function square(t, freq) {
  return sine(t, freq) > 0 ? 1 : -1;
}

function triangle(t, freq) {
  const p = (t * freq) % 1;
  return p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
}

function noise() {
  return Math.random() * 2 - 1;
}

// --- SOUND GENERATORS ---

// Bounty Rune: Coin collecting jingle - ascending "cha-ching!" with sparkle
function bountyRune() {
  const duration = 2.5;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // 3 ascending coin "dings"
    const coins = [
      { start: 0.0, freq: 1400, dur: 0.4 },
      { start: 0.25, freq: 1800, dur: 0.4 },
      { start: 0.5, freq: 2200, dur: 0.5 },
    ];
    for (const c of coins) {
      if (t >= c.start && t < c.start + c.dur) {
        const lt = t - c.start;
        const env = Math.exp(-lt * 8);
        s += sine(lt, c.freq) * env * 0.4;
        s += sine(lt, c.freq * 2.01) * env * 0.2; // slight detune shimmer
      }
    }

    // Final sparkle / cash register
    if (t >= 0.8 && t < 2.2) {
      const lt = t - 0.8;
      const sparkleEnv = Math.exp(-lt * 2.5);
      s += sine(lt, 2600) * sparkleEnv * 0.3;
      s += sine(lt, 3300) * sparkleEnv * 0.15;
      // Metallic shimmer
      s += sine(lt, 5200 + Math.sin(lt * 12) * 200) * sparkleEnv * 0.1;
    }

    // Fade out
    const masterEnv = t < 0.01 ? t / 0.01 : t > duration - 0.1 ? (duration - t) / 0.1 : 1;
    samples[i] = s * masterEnv * 0.7;
  }
  return samples;
}

// Water Rune: Bubbly water drip sounds - "bloop bloop blooop"
function waterRune() {
  const duration = 2.5;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Water drops with descending pitch (bloop effect)
    const drops = [
      { start: 0.0, baseFreq: 1200, dur: 0.35 },
      { start: 0.4, baseFreq: 1000, dur: 0.35 },
      { start: 0.75, baseFreq: 900, dur: 0.4 },
      { start: 1.2, baseFreq: 1400, dur: 0.5 },
      { start: 1.7, baseFreq: 800, dur: 0.6 },
    ];

    for (const d of drops) {
      if (t >= d.start && t < d.start + d.dur) {
        const lt = t - d.start;
        // Pitch drops quickly (bloop characteristic)
        const freq = d.baseFreq * Math.exp(-lt * 6);
        const env = Math.exp(-lt * 5) * Math.sin(Math.PI * lt / d.dur);
        s += sine(lt, freq) * env * 0.5;
        // Subtle harmonic for "roundness"
        s += sine(lt, freq * 1.5) * env * 0.15;
      }
    }

    // Background water ambiance (very subtle)
    if (t > 0.1 && t < 2.3) {
      const lt = t - 0.1;
      const ambEnv = Math.sin(Math.PI * lt / 2.2) * 0.08;
      s += noise() * ambEnv * (0.5 + 0.5 * sine(t, 3));
    }

    const masterEnv = t < 0.01 ? t / 0.01 : t > duration - 0.15 ? (duration - t) / 0.15 : 1;
    samples[i] = s * masterEnv * 0.75;
  }
  return samples;
}

// Power Rune: Epic power-up with rising "whoosh" and burst
function powerRune() {
  const duration = 3.0;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Rising sweep (whoooosh)
    if (t < 1.8) {
      const sweepFreq = 300 + 2000 * Math.pow(t / 1.8, 2);
      const sweepEnv = Math.min(1, t / 0.3) * (t < 1.5 ? 1 : (1.8 - t) / 0.3);
      s += sine(t, sweepFreq) * sweepEnv * 0.3;
      s += triangle(t, sweepFreq * 0.5) * sweepEnv * 0.15;
    }

    // Power burst at peak
    if (t >= 1.5 && t < 2.8) {
      const lt = t - 1.5;
      const burstEnv = Math.exp(-lt * 3);
      s += sine(lt, 1800) * burstEnv * 0.4;
      s += sine(lt, 2700) * burstEnv * 0.2;
      s += square(lt, 900) * burstEnv * 0.1;
      // Sparkle decay
      s += sine(lt, 3500 + Math.sin(lt * 20) * 300) * burstEnv * 0.15;
    }

    // Sub bass impact
    if (t >= 1.4 && t < 2.0) {
      const lt = t - 1.4;
      s += sine(lt, 80) * Math.exp(-lt * 5) * 0.3;
    }

    const masterEnv = t < 0.02 ? t / 0.02 : t > duration - 0.2 ? (duration - t) / 0.2 : 1;
    samples[i] = s * masterEnv * 0.7;
  }
  return samples;
}

// Wisdom Rune: Mystical chime melody - ethereal bell sequence
function wisdomRune() {
  const duration = 3.5;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Ethereal bell chimes (pentatonic scale for mystical feel)
    const chimes = [
      { start: 0.0, freq: 1100, dur: 1.0 },
      { start: 0.3, freq: 1320, dur: 0.9 },
      { start: 0.7, freq: 1650, dur: 1.0 },
      { start: 1.1, freq: 1980, dur: 1.2 },
      { start: 1.6, freq: 2200, dur: 1.5 },
    ];

    for (const c of chimes) {
      if (t >= c.start && t < c.start + c.dur) {
        const lt = t - c.start;
        const bellEnv = Math.exp(-lt * 2.5);
        // Bell = fundamental + inharmonic overtones
        s += sine(lt, c.freq) * bellEnv * 0.3;
        s += sine(lt, c.freq * 2.76) * bellEnv * 0.12;
        s += sine(lt, c.freq * 5.4) * bellEnv * 0.05;
      }
    }

    // Shimmering pad underneath
    if (t > 0.2 && t < 3.2) {
      const lt = t - 0.2;
      const padEnv = Math.sin(Math.PI * lt / 3.0) * 0.15;
      s += sine(t, 550 + Math.sin(t * 2) * 10) * padEnv;
      s += sine(t, 825 + Math.sin(t * 2.5) * 10) * padEnv * 0.5;
    }

    const masterEnv = t < 0.02 ? t / 0.02 : t > duration - 0.3 ? (duration - t) / 0.3 : 1;
    samples[i] = s * masterEnv * 0.7;
  }
  return samples;
}

// Lotus Rune: Soft magical bloom - expanding harmony with "flower opening" feel
function lotusRune() {
  const duration = 3.0;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Expanding chord (opens outward like petals)
    const baseFreq = 880;
    const spread = Math.min(1, t / 1.5);

    const env1 = envelope(t, 0.3, 0.3, 0.6, 0.8, duration);
    s += sine(t, baseFreq) * env1 * 0.25;
    s += sine(t, baseFreq * (1 + spread * 0.5)) * env1 * 0.2;
    s += sine(t, baseFreq * (1 + spread * 0.8)) * env1 * 0.15;

    // Gentle harp-like plucks
    const plucks = [
      { start: 0.0, freq: 1320, dur: 0.6 },
      { start: 0.5, freq: 1760, dur: 0.6 },
      { start: 1.0, freq: 2200, dur: 0.7 },
      { start: 1.5, freq: 2640, dur: 0.8 },
    ];

    for (const p of plucks) {
      if (t >= p.start && t < p.start + p.dur) {
        const lt = t - p.start;
        const pluckEnv = Math.exp(-lt * 5) * 0.3;
        s += sine(lt, p.freq) * pluckEnv;
        s += sine(lt, p.freq * 2) * pluckEnv * 0.3;
      }
    }

    // Soft shimmer
    if (t > 1.0) {
      const lt = t - 1.0;
      const shimEnv = Math.sin(Math.PI * lt / (duration - 1.0)) * 0.08;
      s += sine(t, 4400 + Math.sin(t * 6) * 200) * shimEnv;
    }

    const masterEnv = t < 0.05 ? t / 0.05 : t > duration - 0.2 ? (duration - t) / 0.2 : 1;
    samples[i] = s * masterEnv * 0.7;
  }
  return samples;
}

// Night: Owl hoot + crickets + descending tone (getting dark)
function nightSound() {
  const duration = 3.0;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Descending "woooo" tone (eerie night feeling)
    if (t < 2.0) {
      const freq = 800 - 300 * (t / 2.0);
      const env = envelope(t, 0.2, 0.3, 0.7, 0.5, 2.0);
      s += sine(t, freq) * env * 0.3;
      s += sine(t, freq * 0.5) * env * 0.15;
    }

    // Owl hoot (two-tone "hoo-hoo")
    const hoots = [
      { start: 0.5, freq: 450, dur: 0.35 },
      { start: 1.0, freq: 380, dur: 0.4 },
    ];
    for (const h of hoots) {
      if (t >= h.start && t < h.start + h.dur) {
        const lt = t - h.start;
        const hootEnv = Math.sin(Math.PI * lt / h.dur);
        s += sine(lt, h.freq) * hootEnv * 0.35;
        s += sine(lt, h.freq * 2) * hootEnv * 0.1;
      }
    }

    // Cricket-like chirps (high frequency bursts)
    if (t > 1.5 && t < 2.8) {
      const lt = t - 1.5;
      const chirpRate = 8;
      const chirpOn = (Math.sin(lt * chirpRate * 2 * Math.PI) > 0.3) ? 1 : 0;
      const chirpEnv = Math.sin(Math.PI * lt / 1.3) * 0.12;
      s += sine(t, 4500) * chirpOn * chirpEnv;
    }

    const masterEnv = t < 0.05 ? t / 0.05 : t > duration - 0.2 ? (duration - t) / 0.2 : 1;
    samples[i] = s * masterEnv * 0.7;
  }
  return samples;
}

// Day: Rooster crow / sunrise fanfare - bright ascending
function daySound() {
  const duration = 2.5;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Bright ascending fanfare (trumpet-like)
    const notes = [
      { start: 0.0, freq: 800, dur: 0.3 },
      { start: 0.25, freq: 1000, dur: 0.3 },
      { start: 0.5, freq: 1200, dur: 0.4 },
      { start: 0.9, freq: 1600, dur: 0.8 },
    ];

    for (const n of notes) {
      if (t >= n.start && t < n.start + n.dur) {
        const lt = t - n.start;
        const noteEnv = envelope(lt, 0.03, 0.1, 0.8, 0.15, n.dur);
        // Trumpet = odd harmonics emphasized
        s += sine(lt, n.freq) * noteEnv * 0.35;
        s += sine(lt, n.freq * 3) * noteEnv * 0.12;
        s += sine(lt, n.freq * 5) * noteEnv * 0.05;
      }
    }

    // Rooster-like "cock-a-doodle" sweep
    if (t >= 1.2 && t < 2.2) {
      const lt = t - 1.2;
      let crowFreq;
      if (lt < 0.15) crowFreq = 1200 + lt / 0.15 * 800; // rising
      else if (lt < 0.5) crowFreq = 2000 - (lt - 0.15) / 0.35 * 400; // sustain-dip
      else if (lt < 0.7) crowFreq = 1600 + (lt - 0.5) / 0.2 * 600; // rise again
      else crowFreq = 2200 * Math.exp(-(lt - 0.7) * 3); // decay
      const crowEnv = Math.sin(Math.PI * lt / 1.0) * 0.3;
      s += sine(lt, crowFreq) * crowEnv;
      s += sine(lt, crowFreq * 2) * crowEnv * 0.15;
    }

    const masterEnv = t < 0.02 ? t / 0.02 : t > duration - 0.15 ? (duration - t) / 0.15 : 1;
    samples[i] = s * masterEnv * 0.65;
  }
  return samples;
}

// Neutral Camp: Jungle drums - rhythmic tribal pattern
function neutralCamp() {
  const duration = 2.5;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Drum hits pattern (bongo/tom style)
    const drums = [
      { start: 0.0, freq: 180, dur: 0.2, amp: 1.0 },
      { start: 0.2, freq: 220, dur: 0.15, amp: 0.7 },
      { start: 0.35, freq: 180, dur: 0.2, amp: 0.9 },
      { start: 0.6, freq: 250, dur: 0.15, amp: 0.6 },
      { start: 0.75, freq: 180, dur: 0.2, amp: 1.0 },
      { start: 1.0, freq: 300, dur: 0.12, amp: 0.8 },
      { start: 1.15, freq: 280, dur: 0.12, amp: 0.7 },
      { start: 1.3, freq: 180, dur: 0.25, amp: 1.0 },
    ];

    for (const d of drums) {
      if (t >= d.start && t < d.start + d.dur) {
        const lt = t - d.start;
        const drumEnv = Math.exp(-lt * 15) * d.amp;
        s += sine(lt, d.freq * Math.exp(-lt * 10)) * drumEnv * 0.5;
        s += noise() * Math.exp(-lt * 30) * d.amp * 0.2; // attack transient
      }
    }

    // Animal growl / creature sound
    if (t >= 1.6 && t < 2.3) {
      const lt = t - 1.6;
      const growlEnv = Math.sin(Math.PI * lt / 0.7) * 0.2;
      const growlFreq = 150 + Math.sin(lt * 15) * 30;
      s += (sine(lt, growlFreq) + square(lt, growlFreq) * 0.3) * growlEnv;
    }

    const masterEnv = t < 0.01 ? t / 0.01 : t > duration - 0.2 ? (duration - t) / 0.2 : 1;
    samples[i] = s * masterEnv * 0.75;
  }
  return samples;
}

// Tormentor: Deep menacing horn + impact - boss appearance
function tormentor() {
  const duration = 3.5;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Deep warning horn (BWAAAM)
    if (t < 2.5) {
      const hornEnv = envelope(t, 0.4, 0.3, 0.8, 0.8, 2.5);
      const hornFreq = 120 + Math.sin(t * 3) * 10; // slight wobble
      s += sine(t, hornFreq) * hornEnv * 0.4;
      s += sine(t, hornFreq * 2) * hornEnv * 0.2;
      s += sine(t, hornFreq * 3) * hornEnv * 0.1;
      s += square(t, hornFreq * 0.5) * hornEnv * 0.08;
    }

    // Impact slam
    if (t >= 0.0 && t < 0.5) {
      const impactEnv = Math.exp(-t * 8);
      s += sine(t, 60) * impactEnv * 0.4;
      s += noise() * Math.exp(-t * 20) * 0.3;
    }

    // Ominous rising dissonance
    if (t >= 1.5 && t < 3.2) {
      const lt = t - 1.5;
      const riseEnv = Math.sin(Math.PI * lt / 1.7) * 0.15;
      s += sine(lt, 250 + lt * 100) * riseEnv;
      s += sine(lt, 253 + lt * 103) * riseEnv; // beating/dissonance
    }

    const masterEnv = t < 0.02 ? t / 0.02 : t > duration - 0.3 ? (duration - t) / 0.3 : 1;
    samples[i] = s * masterEnv * 0.7;
  }
  return samples;
}

// Aghanim Shard: Magical crystal shattering + power absorb
function aghanimShard() {
  const duration = 3.0;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Crystal shatter (glass breaking effect)
    if (t < 0.8) {
      const shatterEnv = Math.exp(-t * 4);
      // Multiple high-freq components for "glass"
      s += sine(t, 3000 + Math.random() * 500 * (t < 0.1 ? 1 : 0)) * shatterEnv * 0.15;
      s += sine(t, 4200) * shatterEnv * 0.12;
      s += sine(t, 5800) * shatterEnv * 0.08;
      s += noise() * Math.exp(-t * 12) * 0.25; // initial crack
    }

    // Magic absorb sound (rising whoosh into body)
    if (t >= 0.3 && t < 2.0) {
      const lt = t - 0.3;
      const absorbFreq = 400 + 1500 * Math.pow(lt / 1.7, 1.5);
      const absorbEnv = Math.sin(Math.PI * lt / 1.7) * 0.3;
      s += sine(lt, absorbFreq) * absorbEnv;
      s += sine(lt, absorbFreq * 1.5) * absorbEnv * 0.3;
    }

    // Power confirmation "ding"
    if (t >= 1.8 && t < 2.8) {
      const lt = t - 1.8;
      const dingEnv = Math.exp(-lt * 3);
      s += sine(lt, 2000) * dingEnv * 0.35;
      s += sine(lt, 3000) * dingEnv * 0.15;
      s += sine(lt, 4000) * dingEnv * 0.08;
    }

    const masterEnv = t < 0.01 ? t / 0.01 : t > duration - 0.2 ? (duration - t) / 0.2 : 1;
    samples[i] = s * masterEnv * 0.7;
  }
  return samples;
}

// Siege Creep: Heavy march / mechanical stomp
function siegeCreep() {
  const duration = 2.5;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Heavy stomps (march rhythm)
    const stomps = [
      { start: 0.0, dur: 0.3 },
      { start: 0.5, dur: 0.3 },
      { start: 1.0, dur: 0.3 },
      { start: 1.4, dur: 0.4 },
    ];

    for (const st of stomps) {
      if (t >= st.start && t < st.start + st.dur) {
        const lt = t - st.start;
        const stompEnv = Math.exp(-lt * 10);
        s += sine(lt, 80 * Math.exp(-lt * 5)) * stompEnv * 0.5;
        s += noise() * Math.exp(-lt * 25) * 0.3;
        // Mechanical rattle
        s += sine(lt, 600 + noise() * 100) * Math.exp(-lt * 15) * 0.15;
      }
    }

    // Catapult/trebuchet creak and launch
    if (t >= 1.6 && t < 2.3) {
      const lt = t - 1.6;
      // Creaking wood
      const creakFreq = 300 + 200 * Math.sin(lt * 20);
      const creakEnv = Math.sin(Math.PI * lt / 0.7) * 0.2;
      s += triangle(lt, creakFreq) * creakEnv;
      // Launch whoosh
      if (lt > 0.3) {
        const launchLt = lt - 0.3;
        s += noise() * Math.exp(-launchLt * 5) * 0.2;
      }
    }

    const masterEnv = t < 0.01 ? t / 0.01 : t > duration - 0.2 ? (duration - t) / 0.2 : 1;
    samples[i] = s * masterEnv * 0.75;
  }
  return samples;
}

// Flagbearer Creep: Military horn + flag flapping
function flagbearerCreep() {
  const duration = 2.5;
  const len = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float64Array(len);

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    let s = 0;

    // Military bugle call (short charge melody)
    const bugle = [
      { start: 0.0, freq: 700, dur: 0.2 },
      { start: 0.2, freq: 700, dur: 0.15 },
      { start: 0.35, freq: 930, dur: 0.2 },
      { start: 0.55, freq: 1170, dur: 0.3 },
      { start: 0.85, freq: 930, dur: 0.2 },
      { start: 1.05, freq: 1170, dur: 0.5 },
    ];

    for (const n of bugle) {
      if (t >= n.start && t < n.start + n.dur) {
        const lt = t - n.start;
        const noteEnv = envelope(lt, 0.02, 0.05, 0.85, 0.08, n.dur);
        s += sine(lt, n.freq) * noteEnv * 0.35;
        s += sine(lt, n.freq * 2) * noteEnv * 0.15;
        s += sine(lt, n.freq * 3) * noteEnv * 0.05;
      }
    }

    // Flag flapping noise
    if (t >= 1.4 && t < 2.3) {
      const lt = t - 1.4;
      const flapRate = 6;
      const flap = Math.abs(Math.sin(lt * flapRate * Math.PI));
      const flapEnv = Math.sin(Math.PI * lt / 0.9) * 0.1;
      s += noise() * flap * flapEnv;
    }

    const masterEnv = t < 0.02 ? t / 0.02 : t > duration - 0.2 ? (duration - t) / 0.2 : 1;
    samples[i] = s * masterEnv * 0.7;
  }
  return samples;
}

// --- MAIN ---
console.log('Generating cartoon sound effects...\n');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

writeWav('bounty-rune.wav', bountyRune());
writeWav('water-rune.wav', waterRune());
writeWav('power-rune.wav', powerRune());
writeWav('wisdom-rune.wav', wisdomRune());
writeWav('lotus-rune.wav', lotusRune());
writeWav('night.wav', nightSound());
writeWav('day.wav', daySound());
writeWav('neutral-camp.wav', neutralCamp());
writeWav('tormentor.wav', tormentor());
writeWav('aghanim-shard.wav', aghanimShard());
writeWav('siege-creep.wav', siegeCreep());
writeWav('flagbearer-creep.wav', flagbearerCreep());

console.log('\n✅ All sounds generated!');
