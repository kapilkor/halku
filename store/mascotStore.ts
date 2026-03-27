import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { fsmStep, MascotState, MascotEvent } from "@/lib/mascotFSM";

// ─── Idle timer constants ──────────────────────────────────────────────────────
const IDLE_INITIAL_DELAY_MS = 25_000;  // first nudge after 25s of silence
const IDLE_REPEAT_MS        = 60_000;  // repeat every 60s
const IDLE_MAX_TRIGGERS     = 4;       // stop after 4 nudges

// ─── Store interface ───────────────────────────────────────────────────────────

export interface MascotStore {
  // ── State ──
  state:    MascotState;
  message:  string;
  visible:  boolean;
  soundOn:  boolean;

  // ── Idle internals ──
  _idleCount:    number;
  _idleTimer:    ReturnType<typeof setTimeout> | null;
  _activityTimer:ReturnType<typeof setTimeout> | null;

  // ── Actions ──
  dispatch:    (event: MascotEvent) => void;
  toggleSound: () => void;
  hide:        () => void;
  show:        () => void;

  // ── Idle system ──
  _startIdleTimer:   () => void;
  _stopIdleTimer:    () => void;
  _resetOnActivity:  () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMascotStore = create<MascotStore>()(
  devtools(
    (set, get) => ({
      // ── Initial state ──
      state:          "idle",
      message:        "Hey! I'm Hal 💪 Let's smash some code!",
      visible:        true,
      soundOn:        false,
      _idleCount:     0,
      _idleTimer:     null,
      _activityTimer: null,

      // ── Dispatch FSM event ─────────────────────────────────────────────────
      dispatch: (event: MascotEvent) => {
        const { state: current, _resetOnActivity } = get();
        const { nextState, message } = fsmStep(current, event);

        set({ state: nextState, message, visible: true }, false, `mascot/${event}`);

        // Any real user event resets the idle countdown
        if (event !== "IDLE_TICK") {
          _resetOnActivity();
        }
      },

      // ── Idle timer system ──────────────────────────────────────────────────
      _startIdleTimer: () => {
        const { _stopIdleTimer, dispatch } = get();
        _stopIdleTimer();

        const fire = () => {
          const { _idleCount, soundOn } = get();
          if (_idleCount >= IDLE_MAX_TRIGGERS) return;

          dispatch("IDLE_TICK");
          set((s) => ({ _idleCount: s._idleCount + 1 }), false, "mascot/idleIncrement");

          // Schedule next repeat
          const timer = setTimeout(fire, IDLE_REPEAT_MS);
          set({ _idleTimer: timer }, false, "mascot/idleTimer");
          void soundOn; // reserved for sound system
        };

        const initial = setTimeout(() => {
          fire();
        }, IDLE_INITIAL_DELAY_MS);

        set({ _idleTimer: initial, _idleCount: 0 }, false, "mascot/idleStart");
      },

      _stopIdleTimer: () => {
        const { _idleTimer } = get();
        if (_idleTimer) clearTimeout(_idleTimer);
        set({ _idleTimer: null }, false, "mascot/idleStop");
      },

      // Reset idle countdown when the user is active
      _resetOnActivity: () => {
        const { _activityTimer, _startIdleTimer } = get();
        if (_activityTimer) clearTimeout(_activityTimer);

        // Debounce: restart idle watch 2s after last activity
        const t = setTimeout(() => {
          _startIdleTimer();
        }, 2000);

        set({ _activityTimer: t, _idleCount: 0 }, false, "mascot/activityReset");
      },

      // ── UI helpers ─────────────────────────────────────────────────────────
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn }), false, "mascot/toggleSound"),
      hide:        () => set({ visible: false }, false, "mascot/hide"),
      show:        () => set({ visible: true  }, false, "mascot/show"),
    }),
    { name: "MascotStore (Halku)" }
  )
);
