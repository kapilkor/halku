"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface FirstVisitDocsModalProps {
  isOpen: boolean;
  onReadDocs: () => void;
  onSkip: () => void;
}

export default function FirstVisitDocsModal({
  isOpen,
  onReadDocs,
  onSkip,
}: FirstVisitDocsModalProps) {
  const readDocsRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      readDocsRef.current?.focus();
    }, 20);

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onSkip();
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onEsc);
    };
  }, [isOpen, onSkip]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onSkip}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,0.56)",
            backdropFilter: "blur(4px)",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Halku quick guidance"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "var(--bg-panel)",
              border: "1px solid var(--border-strong)",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 18px 52px rgba(0,0,0,0.38)",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontWeight: 700,
                fontSize: "17px",
              }}
            >
              Welcome To Halku
            </div>

            <div style={{ padding: "16px 18px", color: "var(--text-secondary)", lineHeight: 1.65 }}>
              Hey! New here? Take a quick look at the docs to understand how Halku works.
            </div>

            <div
              style={{
                padding: "14px 18px",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={onSkip}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-subtle)",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Got it
              </button>

              <button
                ref={readDocsRef}
                onClick={onReadDocs}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(34,197,94,0.4)",
                  background: "#166534",
                  color: "#ffffff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Read Docs
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
