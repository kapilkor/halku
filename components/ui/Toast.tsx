"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

export interface ToastProps {
  message: string;
  visible: boolean;
  type?: "success" | "error" | "info";
  onDismiss?: () => void;
  durationMs?: number;
}

export default function Toast({
  message,
  visible,
  type = "success",
  onDismiss,
  durationMs = 2800,
}: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible && onDismiss) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(onDismiss, durationMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onDismiss, durationMs]);

  const accent =
    type === "success"
      ? { border: "rgba(34,211,165,0.4)", bg: "rgba(34,211,165,0.08)", icon: "✓" }
      : type === "error"
      ? { border: "rgba(248,113,113,0.4)", bg: "rgba(248,113,113,0.08)", icon: "✕" }
      : { border: "rgba(139,92,246,0.4)",  bg: "rgba(139,92,246,0.08)",  icon: "ℹ" };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="halku-toast"
          role="alert"
          aria-live="assertive"
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
          style={{
            position: "fixed",
            bottom: "104px",      // above mascot (72px + 24px gap + 8px)
            right: "24px",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 16px",
            borderRadius: "10px",
            border: `1px solid ${accent.border}`,
            background: `var(--bg-elevated)`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accent.border}`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            fontSize: "13px",
            color: "var(--text-primary)",
            maxWidth: "280px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={onDismiss}
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: accent.bg,
              border: `1px solid ${accent.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "11px",
              fontWeight: 700,
              flexShrink: 0,
              color: accent.border.slice(5, -4), // extract rgb from rgba
            }}
          >
            {accent.icon}
          </span>
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
