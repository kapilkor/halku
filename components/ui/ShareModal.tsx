"use client";

import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { playSound } from "@/lib/soundManager";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  onCopy: () => void;
}

export default function ShareModal({ isOpen, onClose, url, onCopy }: ShareModalProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      playSound("pop");
      onCopy();
      onClose();
    } catch {
      // Handle error if needed
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            padding: "20px",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bg-panel)",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "16px", color: "var(--text-primary)" }}>
                Share Code
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "4px",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", gap: "24px", alignItems: "center" }}>
              <div
                style={{
                  padding: "16px",
                  background: "#ffffff",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <QRCodeSVG value={url} size={200} level="M" />
              </div>

              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Shareable Link
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    readOnly
                    value={url}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-subtle)",
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      fontSize: "12px",
                      fontFamily: "var(--font-jb-mono)",
                      outline: "none",
                    }}
                    onClick={(e) => e.currentTarget.select()}
                  />
                  <button
                    onClick={handleCopy}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "var(--radius-sm)",
                      border: "none",
                      background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
                      flexShrink: 0,
                    }}
                  >
                    <span>📋</span> Copy
                  </button>
                </div>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}