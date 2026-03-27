"use client";

/**
 * useRunCount.ts
 *
 * Persists run count to localStorage and fires milestone callbacks
 * at 10 runs and 50 runs.
 *
 * Usage:
 *   const { runCount, increment } = useRunCount({ onMilestone });
 */

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "halku-run-count";
const MILESTONES  = [10, 50, 100, 500] as const;
type Milestone = (typeof MILESTONES)[number];

interface UseRunCountOptions {
  onMilestone: (count: Milestone, message: string) => void;
}

const MILESTONE_MESSAGES: Record<Milestone, string> = {
  10:  "10 runs! You're on a roll 🔥",
  50:  "50 runs! Absolute legend 🏆",
  100: "100 runs! Are you ever sleeping? 😂",
  500: "500 runs!! HULK PROUD OF YOU 💪💪💪",
};

export function useRunCount({ onMilestone }: UseRunCountOptions) {
  const [runCount, setRunCount] = useState(0);
  const firedRef = useRef<Set<number>>(new Set());

  // Hydrate from localStorage
  useEffect(() => {
    const stored = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    setRunCount(isNaN(stored) ? 0 : stored);
  }, []);

  const increment = useCallback(() => {
    setRunCount((prev) => {
      const next = prev + 1;
      localStorage.setItem(STORAGE_KEY, String(next));

      // Check milestones (fire each exactly once per session)
      for (const m of MILESTONES) {
        if (next === m && !firedRef.current.has(m)) {
          firedRef.current.add(m);
          // Defer to avoid calling setState inside setState
          setTimeout(() => onMilestone(m, MILESTONE_MESSAGES[m]), 300);
        }
      }

      return next;
    });
  }, [onMilestone]);

  return { runCount, increment };
}
