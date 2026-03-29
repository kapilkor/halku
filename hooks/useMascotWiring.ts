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
    console.log('useMascotWiring: subscribing to editor store');
    const unsub = useEditorStore.subscribe((state, prev) => {
      // ── CODE_CHANGE (debounced 800ms) ──────────────────────────────────────
      if (state.code !== prev.code) {
        if (codeTimer.current) clearTimeout(codeTimer.current);
        codeTimer.current = setTimeout(() => {
          console.log('useMascotWiring: dispatching CODE_CHANGE');
          dispatch("CODE_CHANGE");
        }, 800);
      }

      // ── RUN_START ──────────────────────────────────────────────────────────
      if (state.isRunning && !prev.isRunning) {
        console.log('useMascotWiring: dispatching RUN_START');
        dispatch("RUN_START");
        prevRunning.current = true;
      }

      // ── RUN_SUCCESS / RUN_ERROR ────────────────────────────────────────────
      if (!state.isRunning && prev.isRunning) {
        prevRunning.current = false;
        if (state.hasError) {
          console.log('useMascotWiring: dispatching RUN_ERROR');
          dispatch("RUN_ERROR");
        } else if (state.lastRunResult !== null) {
          console.log('useMascotWiring: dispatching RUN_SUCCESS');
          dispatch("RUN_SUCCESS");
        }
      }
    });

    return () => {
      console.log('useMascotWiring: unsubscribing from editor store');
      unsub();
      if (codeTimer.current) clearTimeout(codeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  void prevCode; // suppress unused-var lint
}
