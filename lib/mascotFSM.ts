/**
 * mascotFSM.ts
 * ─────────────────────────────────────────────────────────────────
 * Finite State Machine for the Halku mascot (Hal the Hulk).
 *
 * States (4):   idle | thinking | happy | sad
 * Events (6):   PAGE_LOAD | CODE_CHANGE | RUN_START |
 *               RUN_SUCCESS | RUN_ERROR | HOVER
 * Plus internal: IDLE_TICK (from idle timer)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type MascotState = "idle" | "thinking" | "happy" | "sad";

export type MascotEvent =
  | "PAGE_LOAD"
  | "CODE_CHANGE"
  | "RUN_START"
  | "RUN_SUCCESS"
  | "RUN_ERROR"
  | "HOVER"
  | "IDLE_TICK";

export interface FSMOutput {
  nextState: MascotState;
  message: string;
}

// ─── Message pools ────────────────────────────────────────────────────────────

const MESSAGES: Record<MascotState, Record<MascotEvent, string[]>> = {
  idle: {
    PAGE_LOAD:   ["Hey! I'm Hal 💪 Let's smash some code!", "Welcome to Halku! HULK WATCHIN' 👀"],
    CODE_CHANGE: ["Oooh, something's changing…", "Typing away, I see 🎹"],
    RUN_START:   ["HERE WE GOOOO! 🚀", "Executing… HULK IS READY!"],
    RUN_SUCCESS: ["HULK SMASH 💪✅", "Clean run! PUNY BUGS CAN'T STOP YOU 🔥"],
    RUN_ERROR:   ["Uh oh… 🐛 Let's fix that.", "A bug appeared! HULK NOT WORRIED."],
    HOVER:       ["Oh hi there 👋", "Need help? HULK IS RIGHT HERE!"],
    IDLE_TICK:   ["Still thinking? Take your time 💭", "Psst… try print('hello') 👇",
                  "Pro tip: use fn instead of function!", "Don't forget — let! = const 😉"],
  },
  thinking: {
    PAGE_LOAD:   ["Loading up…", "Getting ready…"],
    CODE_CHANGE: ["Hmm, interesting edit…", "I see what you're doing 🤔"],
    RUN_START:   ["Here it goes! 🚀", "Sending to the worker…"],
    RUN_SUCCESS: ["Worked! That's what I thought 💡", "Correct! 🎉"],
    RUN_ERROR:   ["Told ya 😅 — let's debug!", "Oops… I had a feeling."],
    HOVER:       ["Deep in thought… oh hey!", "Almost had it! 🤔"],
    IDLE_TICK:   ["Still pondering…", "Don't rush genius 🧠"],
  },
  happy: {
    PAGE_LOAD:   ["Great to see you! 😄", "Let's code something awesome!"],
    CODE_CHANGE: ["Oh nice change! Keep going!", "I like where this is heading 👍"],
    RUN_START:   ["Executing! Can't wait to see! 🤩", "Go go go! 🚀"],
    RUN_SUCCESS: ["YESSS!! 🎊 Let's gooo!", "Perfect run! You're amazing!"],
    RUN_ERROR:   ["Aww no… 😢 Let's fix it!", "Don't worry — bugs are friends!"],
    HOVER:       ["Hey superstar! 😄", "You're doing great!"],
    IDLE_TICK:   ["Still vibing? 😊", "Life is good when code runs ✅"],
  },
  sad: {
    PAGE_LOAD:   ["Let's try again…", "No giving up! 💪"],
    CODE_CHANGE: ["Trying something new? Good idea!", "Let's see if this works…"],
    RUN_START:   ["Okay… let's try this…", "Maybe this time? 🤞"],
    RUN_SUCCESS: ["IT WORKS!! 🎉 I knew you could!", "See? You figured it out!"],
    RUN_ERROR:   ["Still broken… 😭 Keep going!", "Another error… we'll get there."],
    HOVER:       ["Oh, you noticed me 🥺", "I believe in you… mostly."],
    IDLE_TICK:   ["Maybe try a different approach?", "Even the best coders hit bugs 🐞"],
  },
};

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Transition table ─────────────────────────────────────────────────────────
//
// [currentState][event] → nextState
//
type TransitionTable = Record<MascotState, Partial<Record<MascotEvent, MascotState>>>;

const TRANSITIONS: TransitionTable = {
  idle: {
    PAGE_LOAD:   "idle",
    CODE_CHANGE: "thinking",
    RUN_START:   "thinking",
    RUN_SUCCESS: "happy",
    RUN_ERROR:   "sad",
    HOVER:       "idle",
    IDLE_TICK:   "idle",
  },
  thinking: {
    PAGE_LOAD:   "idle",
    CODE_CHANGE: "thinking",
    RUN_START:   "thinking",
    RUN_SUCCESS: "happy",
    RUN_ERROR:   "sad",
    HOVER:       "thinking",
    IDLE_TICK:   "thinking",
  },
  happy: {
    PAGE_LOAD:   "idle",
    CODE_CHANGE: "thinking",
    RUN_START:   "thinking",
    RUN_SUCCESS: "happy",
    RUN_ERROR:   "sad",
    HOVER:       "happy",
    IDLE_TICK:   "idle",   // drifts back to idle after a while
  },
  sad: {
    PAGE_LOAD:   "idle",
    CODE_CHANGE: "thinking",
    RUN_START:   "thinking",
    RUN_SUCCESS: "happy",
    RUN_ERROR:   "sad",
    HOVER:       "sad",
    IDLE_TICK:   "idle",   // recovers to idle after idle tick
  },
};

// ─── FSM step function ────────────────────────────────────────────────────────

export function fsmStep(current: MascotState, event: MascotEvent): FSMOutput {
  const nextState = TRANSITIONS[current][event] ?? current;
  const message = pick(MESSAGES[current][event] ?? MESSAGES[nextState][event] ?? ["…"]);
  return { nextState, message };
}
