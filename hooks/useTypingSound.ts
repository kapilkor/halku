"use client";

/**
 * useTypingSound.ts
 *
 * Plays a short mechanical "tak" sound on every keystroke inside the
 * CodeMirror editor container.
 *
 * Strategy:
 *  - We attach a "keydown" listener to the editor's DOM container.
 *  - Keys that don't produce characters (arrows, ctrl, shift, meta, fn…)
 *    are filtered so only real typing triggers sound.
 *  - The Web Audio oscillator in soundManager is already ~0 latency.
 *  - A minimum 25ms gap between sounds prevents audio pileup on key-repeat.
 *
 * Usage:
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   useTypingSound(containerRef);
 */

import { useEffect, useRef } from "react";
import { playSound, isSoundEnabled } from "@/lib/soundManager";

const SILENT_KEYS = new Set([
  "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab",
  "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "Home", "End", "PageUp", "PageDown",
  "F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12",
  "Insert", "Delete", "ContextMenu",
]);

const MIN_INTERVAL_MS = 25; // prevent rapid audio pileup on key-repeat

export function useTypingSound(containerRef: React.RefObject<HTMLElement | null>) {
  const lastSoundAt = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSoundEnabled()) return;
      
      // Skip modifier / navigation keys
      if (SILENT_KEYS.has(e.key)) return;
      // Ctrl/Cmd shortcuts (save, run, copy, etc.) — don't beep
      if (e.ctrlKey || e.metaKey) return;

      // Throttle to prevent audio pile-up from key-repeat
      const now = performance.now();
      if (now - lastSoundAt.current < MIN_INTERVAL_MS) return;
      lastSoundAt.current = now;

      playSound("keypress");
    };

    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [containerRef]);
}
