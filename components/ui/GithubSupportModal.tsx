"use client";

import { AnimatePresence, motion } from "framer-motion";

interface GithubSupportModalProps {
  isOpen: boolean;
  onDontShowAgain: () => void;
  onGithub: () => void;
  onClose: () => void;
}

export default function GithubSupportModal({
  isOpen,
  onDontShowAgain,
  onGithub,
  onClose,
}: GithubSupportModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.58)",
            backdropFilter: "blur(4px)",
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "460px",
              borderRadius: "14px",
              border: "1px solid var(--border-strong)",
              background: "#000000",
              boxShadow: "0 16px 48px rgba(0,0,0,0.38)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "17px", color: "var(--text-primary)" }}>
                Hey from Halku
              </h3>
              <button
                onClick={onClose}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "18px",
                  lineHeight: 1,
                }}
                aria-label="Close popup"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "18px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <p style={{ marginTop: 0 }}>
Hey! Agar tumhe Halku pasand aaya, toh GitHub pe ek star dekar support kar sakte ho 😊⭐              </p>
              
            </div>

            <div
              style={{
                padding: "14px 18px",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={onDontShowAgain}
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
                Don't show again
              </button>

              <button
                onClick={onGithub}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(239,68,68,0.45)",
                  background: "#111",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <img
                  src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                  alt=""
                  aria-hidden
                  width={16}
                  height={16}
                  style={{ display: "block", borderRadius: "50%" }}
                />
                GitHub
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
