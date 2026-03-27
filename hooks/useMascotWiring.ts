"use client";

/**
 * useMascotWiring.ts
 *
 * Connects editorStore events → mascotStore dispatches.
 * Call once at the PlaygroundLayout level.
 *
 * Wired events:
 *   CODE_CHANGE  — debounced 800ms after editor changes
 *   RUN_START    — when isRunning flips true
 *   RUN_SUCCESS  — when run completes with no error
 *   RUN_ERROR    — when run completes with hasError
 */

import { useEffect, useRef } from "react";
import { useMascotStore } from "@/store/mascotStore";
import { useEditorStore } from "@/store/editorStore";

export function useMascotWiring() {
  const dispatch = useMascotStore((s) => s.dispatch);

  // Track previous isRunning to detect transitions
  const prevRunning = useRef(false);
  const prevCode    = useRef<string | null>(null);
  const codeTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to editorStore selectively
  useEffect(() => {
    const unsub = useEditorStore.subscribe((state, prev) => {
      // ── CODE_CHANGE (debounced 800ms) ──────────────────────────────────────
      if (state.code !== prev.code) {
        if (codeTimer.current) clearTimeout(codeTimer.current);
        codeTimer.current = setTimeout(() => {
          dispatch("CODE_CHANGE");
        }, 800);
      }

      // ── RUN_START ──────────────────────────────────────────────────────────
      if (state.isRunning && !prev.isRunning) {
        dispatch("RUN_START");
        prevRunning.current = true;
      }

      // ── RUN_SUCCESS / RUN_ERROR ────────────────────────────────────────────
      if (!state.isRunning && prev.isRunning) {
        prevRunning.current = false;
        if (state.hasError) {
          dispatch("RUN_ERROR");
        } else if (state.lastRunResult !== null) {
          dispatch("RUN_SUCCESS");
        }
      }
    });

    return () => {
      unsub();
      if (codeTimer.current) clearTimeout(codeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  void prevCode; // suppress unused-var lint
}
