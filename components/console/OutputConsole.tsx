"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { OutputLine } from "@/lib/outputTypes";

// ─── Colour palette per type ─────────────────────────────────────────────────
const TYPE_STYLES: Record<
  OutputLine["type"],
  { color: string; border: string; bg: string; badge: string }
> = {
  log: {
    color: "var(--text-primary)",
    border: "var(--hulk-green)",
    bg: "rgba(34, 197, 94, 0.05)",
    badge: "LOG",
  },
  warn: {
    color: "var(--yellow)",
    border: "var(--yellow)",
    bg: "rgba(251,191,36,0.05)",
    badge: "WARN",
  },
  error: {
    color: "var(--red)",
    border: "var(--red)",
    bg: "rgba(248,113,113,0.06)",
    badge: "ERR",
  },
  info: {
    color: "var(--blue)",
    border: "var(--blue)",
    bg: "rgba(96,165,250,0.05)",
    badge: "INFO",
  },
};

// ─── ConsoleLine ─────────────────────────────────────────────────────────────

interface ConsoleLineProps {
  line: OutputLine;
  index: number;
}

export const ConsoleLine = memo(function ConsoleLine({
  line,
  index,
}: ConsoleLineProps) {
  console.log('ConsoleLine: rendering line', { line, index });
  const s = TYPE_STYLES[line.type];
  const time = new Date(line.timestamp);
  const hh = time.getHours().toString().padStart(2, "0");
  const mm = time.getMinutes().toString().padStart(2, "0");
  const ss = time.getSeconds().toString().padStart(2, "0");
  const ms = time.getMilliseconds().toString().padStart(3, "0");
  const timeStr = `${hh}:${mm}:${ss}.${ms}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.3) }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        padding: "5px 10px",
        marginBottom: "2px",
        borderRadius: "6px",
        borderLeft: `2px solid ${s.border}`,
        background: s.bg,
        color: s.color,
        fontFamily: "var(--font-jb-mono), monospace",
        fontSize: "14px",
        lineHeight: 1.6,
        wordBreak: "break-all",
        whiteSpace: "pre-wrap",
      }}
      role="listitem"
    >
      {/* Timestamp */}
      <span
        title={`Logged at ${timeStr}`}
        style={{
          flexShrink: 0,
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--text-muted)",
          marginTop: "3px",
          fontVariantNumeric: "tabular-nums",
          userSelect: "none",
        }}
      >
        {timeStr}
      </span>

      {/* Badge */}
      <span
        aria-label={line.type}
        style={{
          flexShrink: 0,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          padding: "2px 5px",
          borderRadius: "4px",
          border: `1px solid ${s.border}`,
          color: s.border,
          opacity: 0.8,
          marginTop: "2px",
          userSelect: "none",
        }}
      >
        {s.badge}
      </span>

      {/* Content */}
      <span style={{ flex: 1, minWidth: 0 }}>{line.text}</span>
    </motion.div>
  );
});

// ─── OutputConsole ────────────────────────────────────────────────────────────

interface OutputConsoleProps {
  lines: OutputLine[];
  isRunning: boolean;
  hasError: boolean;
  durationMs?: number | null;
  onClear: () => void;
}

export default function OutputConsole({
  lines,
  isRunning,
  hasError,
  durationMs,
  onClear,
}: OutputConsoleProps) {
  const statusDot = isRunning
    ? { color: "var(--yellow)", glow: "rgba(251,191,36,0.5)" }
    : hasError
    ? { color: "var(--red)", glow: "rgba(248,113,113,0.5)" }
    : lines.length > 0
    ? { color: "var(--green)", glow: "rgba(34,211,165,0.5)" }
    : { color: "var(--text-muted)", glow: "transparent" };

  return (
    <section
      id="halku-console-panel"
      aria-label="Console output"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-secondary)",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "8px 14px",
          borderBottom: "1px solid var(--border-subtle)",
          fontSize: "24px",
          fontWeight: 700,
          color: "var(--text-muted)",
          lineHeight: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <motion.span
            animate={
              isRunning
                ? { opacity: [1, 0.3, 1] }
                : { opacity: 1 }
            }
            transition={
              isRunning ? { repeat: Infinity, duration: 0.9 } : {}
            }
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: statusDot.color,
              boxShadow: `0 0 6px ${statusDot.glow}`,
              display: "inline-block",
            }}
          />
          Console
          {lines.length > 0 && (
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "1px 6px",
                borderRadius: 99,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              {lines.length}
            </span>
          )}
        </span>

        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Duration badge */}
          {durationMs != null && !isRunning && (
            <span
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--text-muted)",
                fontFamily: "var(--font-jb-mono)",
              }}
            >
              {durationMs < 1 ? "<1" : Math.round(durationMs)}ms
            </span>
          )}

          {/* Clear button */}
          {lines.length > 0 && !isRunning && (
            <button
              id="halku-clear-console"
              onClick={onClear}
              title="Clear console output"
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-muted)",
                background: "transparent",
                border: "1px solid transparent",
                borderRadius: 4,
                cursor: "pointer",
                padding: "2px 7px",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              Clear
            </button>
          )}
        </span>
      </div>

      {/* ── Output lines ── */}
      <div
        id="halku-console-output"
        role="log"
        aria-live="polite"
        aria-label="Console messages"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px 6px",
        }}
      >
        {lines.length === 0 && !isRunning && (
          <p
            style={{
              color: "var(--text-muted)",
              fontStyle: "italic",
              fontFamily: "var(--font-jb-mono)",
              fontSize: "14px",
              fontWeight: 500,
              padding: "8px 14px",
            }}
          >
            Press{" "}
            <kbd
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                padding: "1px 5px",
                borderRadius: 4,
                border: "1px solid var(--border-subtle)",
                fontStyle: "normal",
                color: "var(--text-secondary)",
              }}
            >
              Run
            </kbd>{" "}
            to see output here.
          </p>
        )}

        {isRunning && lines.length === 0 && (
          <p
            style={{
              color: "var(--yellow)",
              fontFamily: "var(--font-jb-mono)",
              fontSize: "14px",
              fontWeight: 500,
              padding: "8px 14px",
            }}
          >
            Executing…
          </p>
        )}

        <div role="list">
          {lines.map((line, i) => (
            <ConsoleLine key={line.id} line={line} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
