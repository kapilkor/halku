/**
 * soundManager.ts
 *
 * Programmatic sound engine built on Web Audio API.
 * Uses Howler for its caching/volume model — but since we have no
 * audio file assets, primary sounds are generated via AudioContext
 * oscillators, with Howler used as the on/off gate via soundOn state.
 *
 * Sound keys:
 *   click   — short hi-hat tick (button press)
 *   pop     — bubble pop (thought bubble appears)
 *   success — ascending minor-third arpeggio (run success)
 *   fail    — descending buzz (run error / error)
 */

import { Howl } from "howler";

// ─── Sound Definitions ────────────────────────────────────────────────────────

const TYPING_SOUNDS = [
  "/sound/typing/mixkit-mechanical-typewriter-hit-1365.ogg",
  "/sound/typing/mixkit-mechanical-typewriter-single-hit-1382.ogg",
  "/sound/typing/mixkit-single-hit-on-typewriter-1380.ogg",
  "/sound/typing/mixkit-typewriter-hard-hit-1367.ogg",
  "/sound/typing/mixkit-typewriter-single-mechanical-hit-1384.ogg",
  "/sound/typing/mixkit-typewriter-soft-click-1125.ogg",
  "/sound/typing/mixkit-typewriter-soft-hit-1366.ogg",
  "/sound/typing/mixkit-vintage-typewriter-hit-1369.ogg",
];

let typingSoundPool: Howl[] = [];

type SoundKey = "click" | "pop" | "success" | "fail" | "keypress";

const SOUNDS: Record<SoundKey, () => void> = {
  click: () => playGeneratedSound("click"),
  pop: () => playGeneratedSound("pop"),
  success: () => playGeneratedSound("success"),
  fail: () => playGeneratedSound("fail"),
  keypress: () => {
    if (typingSoundPool.length === 0) return;
    const sound = typingSoundPool[Math.floor(Math.random() * typingSoundPool.length)];
    sound.play();
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

let _enabled = true;

/** Call once on app boot — reads persisted preference and loads sounds */
export function initSound(): void {
  if (typeof window === "undefined") return;

  const stored = localStorage.getItem("halku-sound");
  _enabled = stored !== "0"; // Default to true unless explicitly set to "0"
  Howler.mute(!_enabled);

  // Pre-load typing sounds into a pool
  typingSoundPool = TYPING_SOUNDS.map(
    (src) => new Howl({ src: [src], volume: 0.4 })
  );
}

export function setSoundEnabled(on: boolean): void {
  _enabled = on;
  if (typeof window !== "undefined") {
    localStorage.setItem("halku-sound", on ? "1" : "0");
  }
  Howler.mute(!on);
}

export function isSoundEnabled(): boolean {
  return _enabled;
}

export function playSound(key: SoundKey): void {
  if (!_enabled) return;
  try {
    SOUNDS[key]?.();
  } catch {
    // ignore errors silently
  }
}

// ─── Generated Sounds Engine (for UI feedback) ──────────────────────────────

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (_ctx.state === "suspended") {
    _ctx.resume().catch(() => {});
  }
  return _ctx;
}

type OscType = OscillatorType;
interface ToneDesc {
  freq: number;
  type: OscType;
  startAt: number;
  duration: number;
  gainPeak: number;
}

function playTones(tones: ToneDesc[], masterGain = 0.18): void {
  const ctx = getCtx();
  if (!ctx) return;

  const master = ctx.createGain();
  master.gain.value = masterGain;
  master.connect(ctx.destination);

  for (const t of tones) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env);
    env.connect(master);

    osc.type = t.type;
    osc.frequency.value = t.freq;

    const start = ctx.currentTime + t.startAt;
    const end = start + t.duration;

    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(t.gainPeak, start + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.start(start);
    osc.stop(end + 0.01);
  }
}

const GENERATED_SOUNDS = {
  click: () =>
    playTones(
      [
        { freq: 1200, type: "square", startAt: 0, duration: 0.04, gainPeak: 0.9 },
        { freq: 900, type: "square", startAt: 0.015, duration: 0.03, gainPeak: 0.4 },
      ],
      0.09
    ),
  pop: () =>
    playTones(
      [
        { freq: 520, type: "sine", startAt: 0, duration: 0.06, gainPeak: 1 },
        { freq: 780, type: "sine", startAt: 0.03, duration: 0.05, gainPeak: 0.6 },
      ],
      0.14
    ),
  success: () =>
    playTones(
      [
        { freq: 523, type: "sine", startAt: 0, duration: 0.12, gainPeak: 1 },
        { freq: 659, type: "sine", startAt: 0.09, duration: 0.12, gainPeak: 0.9 },
        { freq: 784, type: "sine", startAt: 0.18, duration: 0.18, gainPeak: 0.8 },
      ],
      0.2
    ),
  fail: () =>
    playTones(
      [
        { freq: 320, type: "sawtooth", startAt: 0, duration: 0.14, gainPeak: 1 },
        { freq: 220, type: "sawtooth", startAt: 0.1, duration: 0.14, gainPeak: 0.8 },
        { freq: 160, type: "sawtooth", startAt: 0.2, duration: 0.18, gainPeak: 0.6 },
      ],
      0.12
    ),
};

function playGeneratedSound(key: keyof typeof GENERATED_SOUNDS) {
  if (!_enabled) return;
  try {
    GENERATED_SOUNDS[key]?.();
  } catch {
    // ignore errors
  }
}
