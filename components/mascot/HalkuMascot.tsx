"use client";

import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useMascotStore } from "@/store/mascotStore";
import ThoughtBubble from "./ThoughtBubble";
import HulkAvatar from "./HulkAvatar";
import type { MascotState } from "@/lib/mascotFSM";
import { playSound } from "@/lib/soundManager";

// ─── Glow colours per state ───────────────────────────────────────────────────

const STATE_GLOW: Record<MascotState, string> = {
  idle:     "rgba(34,197,94,0.45)",
  thinking: "rgba(251,191,36,0.45)",
  happy:    "rgba(34,211,165,0.65)",
  sad:      "rgba(248,113,113,0.45)",
};

const STATE_BORDER: Record<MascotState, string> = {
  idle:     "rgba(34,197,94,0.4)",
  thinking: "rgba(251,191,36,0.4)",
  happy:    "rgba(34,197,94,0.7)",
  sad:      "rgba(248,113,113,0.55)",
};

// ─── Shake keyframes (rapid-click easter egg) ─────────────────────────────────
const SHAKE_KEYFRAMES = {
  x:      [0, -10, 12, -12, 9, -6, 4, -2, 0],
  rotate: [0, -6,   6,  -5, 4, -3, 2,  0, 0],
};

const RAPID_CLICK_THRESHOLD = 5;
const RAPID_CLICK_WINDOW_MS = 1500;
const COOLDOWN_MS           = 3000;

// ─── Component ────────────────────────────────────────────────────────────────

export default function HalkuMascot() {
  const { state, message, visible, dispatch, _startIdleTimer, hide } =
    useMascotStore();

  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [hovered, setHovered]             = useState(false);
  const [shaking, setShaking]             = useState(false);
  const [coolingDown, setCoolingDown]     = useState(false);
  const [powerUp, setPowerUp]             = useState(false);

  const avatarControls = useAnimation();

  const clickTimestamps = useRef<number[]>([]);
  const cooldownTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevState       = useRef<MascotState>(state);

  // ── Bootstrap ───────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch("PAGE_LOAD");
    _startIdleTimer();
    const t = setTimeout(() => setBubbleVisible(true), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Show bubble for 5s on message change ─────────────────────────────────
  useEffect(() => {
    setBubbleVisible(true);
    const t = setTimeout(() => setBubbleVisible(false), 5000);
    return () => clearTimeout(t);
  }, [message]);

  // ── Power-up flash on RUN_SUCCESS (happy) ────────────────────────────────
  useEffect(() => {
    if (state === "happy" && prevState.current !== "happy") {
      setPowerUp(true);
      const t = setTimeout(() => setPowerUp(false), 600);
      prevState.current = state;
      return () => clearTimeout(t);
    }
    prevState.current = state;
  }, [state]);

  if (!visible) return null;

  // ── Rapid-click handler ───────────────────────────────────────────────────
  const handleClick = () => {
    if (coolingDown) return;

    const now = Date.now();
    clickTimestamps.current.push(now);
    clickTimestamps.current = clickTimestamps.current.filter(
      (ts) => now - ts < RAPID_CLICK_WINDOW_MS
    );

    if (clickTimestamps.current.length >= RAPID_CLICK_THRESHOLD) {
      clickTimestamps.current = [];
      setShaking(true);
      setCoolingDown(true);

      playSound("fail");

      avatarControls.start({
        ...SHAKE_KEYFRAMES,
        transition: { duration: 0.6, ease: "easeInOut" },
      }).then(() => {
        setShaking(false);
        dispatch("HOVER");
      });

      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
      cooldownTimer.current = setTimeout(() => setCoolingDown(false), COOLDOWN_MS);
    } else {
      setBubbleVisible(true);
      dispatch("HOVER");
      playSound("pop");
    }
  };

  return (
    <div
      id="halku-mascot"
      role="complementary"
      aria-label="Hal the Hulk mascot"
      style={{
        position:      "fixed",
        bottom:        "24px",
        right:         "24px",
        zIndex:        9999,
        display:       "flex",
        flexDirection: "column",
        alignItems:    "flex-end",
        userSelect:    "none",
      }}
    >
      {/* Thought bubble */}
      <div style={{ position: "relative" }}>
        <ThoughtBubble message={message} visible={bubbleVisible || hovered} />

        {/* Avatar wrapper */}
        <motion.div
          id="halku-mascot-avatar"
          animate={avatarControls}
          onHoverStart={() => { setHovered(true); dispatch("HOVER"); }}
          onHoverEnd={() => setHovered(false)}
          whileHover={coolingDown ? {} : { scale: 1.1, rotate: -4 }}
          whileTap={coolingDown ? {} : { scale: 0.9 }}
          onClick={handleClick}
          style={{
            cursor:         coolingDown ? "not-allowed" : "pointer",
            width:          80,
            height:         80,
            borderRadius:   "50%",
            background:     powerUp
              ? "radial-gradient(circle, rgba(34,197,94,0.3) 0%, rgba(22,163,74,0.1) 100%)"
              : "var(--bg-elevated)",
            border:         `2px solid ${shaking ? "rgba(248,113,113,0.7)" : STATE_BORDER[state]}`,
            boxShadow:      powerUp
              ? `0 0 0 4px rgba(34,197,94,0.5), 0 0 40px rgba(34,197,94,0.4), 0 8px 32px rgba(0,0,0,0.5)`
              : `0 0 0 3px ${shaking ? "rgba(248,113,113,0.4)" : STATE_GLOW[state]}, 0 8px 32px rgba(0,0,0,0.5)`,
            overflow:       "hidden",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            transition:     "box-shadow 0.3s ease, border-color 0.3s, background 0.3s",
            position:       "relative",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              style={{
                position:       "absolute",
                inset:          0,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
            >
              <HulkAvatar />
            </motion.div>
          </AnimatePresence>

          {/* Cooldown overlay */}
          {coolingDown && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position:       "absolute",
                inset:          0,
                borderRadius:   "50%",
                background:     "rgba(248,113,113,0.15)",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       "24px",
                pointerEvents:  "none",
              }}
            >
              😵
            </motion.div>
          )}

          {/* Power-up flash on success */}
          {powerUp && (
            <motion.div
              initial={{ opacity: 0.9, scale: 0.8 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{
                position:     "absolute",
                inset:        0,
                borderRadius: "50%",
                background:   "radial-gradient(circle, rgba(34,197,94,0.7) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          )}
        </motion.div>

        {/* State dot */}
        <motion.span
          layoutId="mascot-state-dot"
          style={{
            position:     "absolute",
            bottom:       2,
            right:        2,
            width:        12,
            height:       12,
            borderRadius: "50%",
            background:   STATE_GLOW[state].replace(/0\.\d+\)/, "1)"),
            border:       "2px solid var(--bg-panel)",
            boxShadow:    `0 0 8px ${STATE_GLOW[state]}`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Dismiss */}
      <button
        id="halku-mascot-dismiss"
        onClick={hide}
        title="Hide Hal"
        aria-label="Dismiss mascot"
        style={{
          marginTop:     4,
          fontSize:      "10px",
          color:         "var(--text-muted)",
          background:    "transparent",
          border:        "none",
          cursor:        "pointer",
          textAlign:     "center",
          width:         "100%",
          opacity:       hovered ? 1 : 0,
          transition:    "opacity 0.2s",
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        hide
      </button>
    </div>
  );
}
