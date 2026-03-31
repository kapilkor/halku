"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import SoundToggle from "@/components/ui/SoundToggle";

interface ToolbarProps {
  onRun:     () => void;
  onReset:   () => void;
  onShare:   () => void;
  onClear:   () => void;
  onShowDocs?: () => void;
  isRunning?: boolean;
}

// ─── Small ghost button helper ────────────────────────────────────────────────

function GhostBtn({
  id,
  onClick,
  title,
  children,
}: {
  id: string;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      title={title}
      style={{
        padding: "5px 11px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-subtle)",
        background: "transparent",
        color: "var(--text-secondary)",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.color       = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.color       = "var(--text-secondary)";
      }}
    >
      {children}
    </button>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      style={{ display: "inline-block", fontSize: 13 }}
      aria-hidden
    >
      ◌
    </motion.span>
  );
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

export default function Toolbar({
  onRun,
  onReset,
  onShare,
  onClear,
  onShowDocs,
  isRunning,
}: ToolbarProps) {
  return (
    <motion.header
      id="halku-toolbar"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "space-between",
        gap:             "12px",
        padding:         "0 14px",
        height:          "52px",
        background:      "var(--bg-secondary)",
        borderBottom:    "1px solid var(--border-subtle)",
        flexShrink:      0,
      }}
    >
      {/* ── Brand ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <Image
style={{
width: 36,
height: 36,
borderRadius: "8px",

display: "flex",
alignItems: "center",
justifyContent: "center",
fontSize: 14,
boxShadow: "0 0 12px rgba(34,197,94,0.5)",
}}
src="/logo/logo.png"
alt="Halku Logo"
width={36}
height={36}
/>
        <span
          style={{
            fontWeight:    700,
            fontSize:      "24px",
            letterSpacing: "-0.01em",
            color:         "var(--text-primary)",
          }}
        >
          
          Halku 
        </span>
        <span
          style={{
            fontSize:  "24px",
            fontWeight: 500,
            color:     "var(--text-muted)",
            padding:   "2px 8px",
            borderRadius: 99,
            border:    "1px solid var(--border-subtle)",
            marginLeft: 2,
          }}
        >
          playground
        </span>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Sound toggle */}
        <SoundToggle />

        {/* Separator */}
        <div style={{ width: 1, height: 20, background: "var(--border-subtle)", margin: "0 2px" }} />

        {/* Docs */}
        {onShowDocs && (
          <GhostBtn id="halku-docs-btn" onClick={onShowDocs} title="View HalkuLang Documentation">
            <span style={{ marginRight: 4 }}>📖</span>Docs
          </GhostBtn>
        )}

        {/* Clear console */}
        <GhostBtn id="halku-clear-btn" onClick={onClear} title="Clear console output">
          Clear
        </GhostBtn>

        {/* Reset code */}
        <GhostBtn id="halku-reset-btn" onClick={onReset} title="Reset to default code">
          Reset
        </GhostBtn>

        {/* Share */}
        <GhostBtn id="halku-share-btn" onClick={onShare} title="Copy shareable link to clipboard">
          <span style={{ marginRight: 4 }}>🔗</span>Share
        </GhostBtn>

        {/* Separator */}
        <div style={{ width: 1, height: 20, background: "var(--border-subtle)", margin: "0 2px" }} />

        {/* Run */}
        <motion.button
          id="halku-run-btn"
          onClick={onRun}
          disabled={isRunning}
          whileTap={{ scale: 0.95 }}
          whileHover={isRunning ? {} : { scale: 1.03 }}
          title="Run code (Ctrl+Enter)"
          aria-label={isRunning ? "Running code…" : "Run code"}
          style={{
            padding:       "6px 18px",
            borderRadius:  "var(--radius-sm)",
            border:        "none",
            background:    isRunning
              ? "rgba(22,163,74,0.4)"
              : "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
            color:         "#fff",
            fontSize:      "14px",
            fontWeight:    700,
            cursor:        isRunning ? "not-allowed" : "pointer",
            boxShadow:     isRunning ? "none" : "0 0 16px rgba(34,197,94,0.45)",
            display:       "flex",
            alignItems:    "center",
            gap:           "7px",
            transition:    "background 0.2s, box-shadow 0.2s",
            minWidth:      "82px",
            justifyContent:"center",
          }}
        >
          {isRunning ? (
            <>
              <Spinner />
              Running
            </>
          ) : (
            <>
              <span aria-hidden style={{ fontSize: 11 }}>▶</span>
              Run
              <kbd
                style={{
                  fontSize:   "10px",
                  opacity:    0.65,
                  padding:    "1px 5px",
                  borderRadius: 4,
                  border:     "1px solid rgba(255,255,255,0.25)",
                  fontFamily: "var(--font-jb-mono)",
                }}
              >
                ⌃↵
              </kbd>
            </>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
