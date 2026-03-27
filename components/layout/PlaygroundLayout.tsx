"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Toolbar from "@/components/layout/Toolbar";
import OutputConsole from "@/components/console/OutputConsole";
import Toast from "@/components/ui/Toast";
import { useEditorStore } from "@/store/editorStore";
import { useMascotWiring } from "@/hooks/useMascotWiring";
import { useKonamiCode } from "@/hooks/useKonamiCode";
import { useRunCount } from "@/hooks/useRunCount";
import { encodeShareUrl, readShareFromUrl, clearShareParam } from "@/lib/shareCode";
import { playSound, initSound } from "@/lib/soundManager";
import { useMascotStore } from "@/store/mascotStore";
import { HALKULANG_DEFAULT } from "@/lang/halkuLang";
import type { MascotState } from "@/lib/mascotFSM";
import DocsModal from "@/components/ui/DocsModal";
import ShareModal from "@/components/ui/ShareModal";

// ─── Sound mapping ────────────────────────────────────────────────────────────
const STATE_SOUND: Partial<Record<MascotState, Parameters<typeof playSound>[0]>> = {
  happy:    "success",
  sad:      "fail",
  thinking: "click",
};

// ─── Lazy-loaded browser components ──────────────────────────────────────────
const HalkuEditor = dynamic(() => import("@/components/editor/HalkuEditor"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height:         "100%",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        color:          "var(--text-muted)",
        fontFamily:     "var(--font-jb-mono)",
        fontSize:       13,
      }}
    >
      Loading editor…
    </div>
  ),
});

const HalkuMascot = dynamic(() => import("@/components/mascot/HalkuMascot"), {
  ssr: false,
});

// ─── Toast state ─────────────────────────────────────────────────────────────
interface ToastState {
  message: string;
  type:    "success" | "error" | "info";
  visible: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PlaygroundLayout() {
  const {
    runCode, resetCode, code, setCode,
    output, isRunning, hasError, lastRunResult, clearOutput,
    detectedLanguage,
  } = useEditorStore();

  const mascotDispatch = useMascotStore((s) => s.dispatch);

  const [toast, setToast] = useState<ToastState>({
    message: "",
    type:    "success",
    visible: false,
  });

  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "success") =>
      setToast({ message, type, visible: true }),
    []
  );
  const hideToast = useCallback(
    () => setToast((t) => ({ ...t, visible: false })),
    []
  );

  // ── Init sound ─────────────────────────────────────────────────────────────
  useEffect(() => { initSound(); }, []);

  // ── Read share URL on first load ───────────────────────────────────────────
  useEffect(() => {
    const shared = readShareFromUrl();
    if (shared) {
      setCode(shared);
      clearShareParam();
      showToast("Shared code loaded! ✨", "info");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mascot wiring ──────────────────────────────────────────────────────────
  useMascotWiring();

  // ── Run count + milestones ─────────────────────────────────────────────────
  const { increment: incrementRunCount } = useRunCount({
    onMilestone: (_, msg) => {
      showToast(msg, "success");
      playSound("success");
      mascotDispatch("RUN_SUCCESS");
    },
  });

  // ── Sound on run complete ──────────────────────────────────────────────────
  const prevRunning = useRef(false);
  useEffect(() => {
    if (prevRunning.current && !isRunning) {
      // Run just finished
      if (lastRunResult) {
        const key = hasError ? STATE_SOUND.sad : STATE_SOUND.happy;
        if (key) playSound(key);
        if (!hasError) incrementRunCount();
      }
    }
    prevRunning.current = isRunning;
  }, [isRunning, hasError, lastRunResult, incrementRunCount]);

  // ── Konami code Easter egg ─────────────────────────────────────────────────
  const fireKonami = useCallback(async () => {
    // Dynamic import to keep confetti out of initial bundle
    const confetti = (await import("canvas-confetti")).default;

    const duration = 3000;
    const end      = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle:         60,
        spread:        55,
        origin:        { x: 0 },
        colors:        ["#7c3aed", "#a78bfa", "#22d3a5", "#fbbf24"],
      });
      confetti({
        particleCount: 6,
        angle:         120,
        spread:        55,
        origin:        { x: 1 },
        colors:        ["#7c3aed", "#a78bfa", "#22d3a5", "#fbbf24"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
    playSound("success");
    showToast("🎉 KONAMI CODE! You found the Easter egg!", "success");
    mascotDispatch("RUN_SUCCESS"); // make mascot happy
  }, [showToast, mascotDispatch]);

  useKonamiCode(fireKonami);

  // ── Ctrl+Enter ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) {
          playSound("click");
          runCode();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRunning, runCode]);

  // ── Action handlers ────────────────────────────────────────────────────────
  const handleRun = useCallback(() => {
    if (!isRunning) {
      playSound("click");
      runCode();
    }
  }, [isRunning, runCode]);

  const handleShare = useCallback(() => {
    const result = encodeShareUrl(code);
    setShareUrl(result.url);

    if (result.warned) {
      showToast(
        "⚠️ Link is long (>800 chars). It may not work in all browsers.",
        "error"
      );
    }

    playSound("click");
    setIsShareOpen(true);
  }, [code, showToast]);

  const handleClear = useCallback(() => {
    clearOutput();
    playSound("click");
  }, [clearOutput]);

  const handleReset = useCallback(() => {
    resetCode();
    playSound("click");
  }, [resetCode]);

  // Load HalkuLang example
  const handleTryHalkuLang = useCallback(() => {
    setCode(HALKULANG_DEFAULT);
    playSound("pop");
    showToast("HalkuLang example loaded! 🕉️", "info");
  }, [setCode, showToast]);

  return (
    <div
      id="halku-playground"
      style={{
        display:       "flex",
        flexDirection: "column",
        height:        "100vh",
        overflow:      "hidden",
        background:    "var(--bg-primary)",
      }}
    >
      {/* Toolbar */}
      <Toolbar
        onRun={handleRun}
        onReset={handleReset}
        onShare={handleShare}
        onClear={handleClear}
        onShowDocs={() => setIsDocsOpen(true)}
        isRunning={isRunning}
      />

      {/* Editor + Console */}
      <div
        id="halku-split"
        style={{
          display:             "grid",
          gridTemplateColumns: "1fr 1fr",
          flex:                1,
          minHeight:           0,
          gap:                 "1px",
          background:          "var(--border-subtle)",
        }}
      >
        {/* Editor */}
        <motion.section
          id="halku-editor-panel"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-label="Code editor"
          style={{
            display:       "flex",
            flexDirection: "column",
            background:    "var(--bg-panel)",
            overflow:      "hidden",
          }}
        >
          <div
            style={{
              padding:       "8px 14px",
              borderBottom:  "1px solid var(--border-subtle)",
              fontSize:      "11px",
              fontWeight:    600,
              color:         "var(--text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              display:       "flex",
              alignItems:    "center",
              gap:           6,
              flexShrink:    0,
              userSelect:    "none",
            }}
          >
            <span
              style={{
                width:        8,
                height:       8,
                borderRadius: "50%",
                background:   detectedLanguage === 'halkuLang' ? "#f59e0b" : "var(--accent-light)",
                boxShadow:    detectedLanguage === 'halkuLang' ? "0 0 6px rgba(245,158,11,0.6)" : "0 0 6px var(--accent-glow)",
                transition:   "background 0.3s, box-shadow 0.3s",
              }}
            />
            {detectedLanguage === 'halkuLang' ? 'HalkuLang' : 'Halku'}
            <span
              style={{
                fontSize:   "10px",
                padding:    "1px 6px",
                borderRadius: 99,
                border:     `1px solid ${detectedLanguage === 'halkuLang' ? 'rgba(245,158,11,0.4)' : 'var(--border-subtle)'}`,
                color:      detectedLanguage === 'halkuLang' ? "#f59e0b" : "var(--text-muted)",
                fontWeight: 400,
                fontFamily: "var(--font-jb-mono)",
                transition: "all 0.3s",
              }}
            >
              {detectedLanguage === 'halkuLang' ? 'hindi-js' : '.hk'}
            </span>

            {/* Try HalkuLang shortcut */}
            {detectedLanguage !== 'halkuLang' && (
              <button
                id="halku-try-halkuLang-btn"
                onClick={handleTryHalkuLang}
                title="Load HalkuLang example (Hindi-JS hybrid)"
                style={{
                  marginLeft:    "auto",
                  fontSize:      "10px",
                  padding:       "2px 8px",
                  borderRadius:  99,
                  border:        "1px solid rgba(245,158,11,0.4)",
                  background:    "rgba(245,158,11,0.08)",
                  color:         "#f59e0b",
                  cursor:        "pointer",
                  fontWeight:    500,
                  letterSpacing: "0.04em",
                  whiteSpace:    "nowrap",
                  textTransform: "none",
                }}
              >
                Try HalkuLang 🕉️
              </button>
            )}

          </div>

          <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
            <HalkuEditor />
          </div>
        </motion.section>

        {/* Console */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ minHeight: 0, overflow: "hidden" }}
        >
          <OutputConsole
            lines={output}
            isRunning={isRunning}
            hasError={hasError}
            durationMs={lastRunResult?.durationMs ?? null}
            onClear={handleClear}
          />
        </motion.div>
      </div>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={hideToast}
      />

      {/* Docs Modal */}
      <DocsModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={shareUrl}
        onCopy={() => showToast("Link copied to clipboard! 🔗", "success")}
      />

      {/* Mascot */}
      <HalkuMascot />

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          #halku-split {
            grid-template-columns: 1fr !important;
            grid-template-rows: 50vh 1fr;
          }
          #halku-mascot {
            bottom: 12px;
            right:  12px;
          }
          #halku-toast {
            bottom:    90px;
            right:     12px;
            left:      12px;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
