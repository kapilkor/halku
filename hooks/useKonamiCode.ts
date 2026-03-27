"use client";

/**
 * useKonamiCode.ts
 *
 * Listens for ↑ ↑ ↓ ↓ ← → ← → B A
 * Calls onSuccess() when the full sequence is entered.
 * Sequence must complete within 3 seconds of the first key.
 */

import { useEffect, useRef } from "react";

const SEQUENCE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a",
];

const TIMEOUT_MS = 3000;

export function useKonamiCode(onSuccess: () => void) {
  const progress  = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const expected = SEQUENCE[progress.current];
      const pressed  = e.key;

      // Reset timer on every keypress
      if (resetTimer.current) clearTimeout(resetTimer.current);

      if (pressed === expected) {
        progress.current += 1;

        if (progress.current === SEQUENCE.length) {
          progress.current = 0;
          onSuccess();
          return;
        }

        // Auto-reset if no key in 3s
        resetTimer.current = setTimeout(() => {
          progress.current = 0;
        }, TIMEOUT_MS);
      } else {
        // Wrong key — reset from scratch (but allow re-check from start)
        progress.current = pressed === SEQUENCE[0] ? 1 : 0;
        if (progress.current > 0) {
          resetTimer.current = setTimeout(() => {
            progress.current = 0;
          }, TIMEOUT_MS);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [onSuccess]);
}
