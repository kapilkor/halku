"use client";

import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { useEditorStore } from "@/store/editorStore";
import { useTypingSound } from "@/hooks/useTypingSound";

// Extend oneDark with Halku (Hulk green) overrides
const halkuTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "transparent",
      height: "100%",
      fontSize: "16px",
    },
    ".cm-content": {
      fontFamily:
        "var(--font-jb-mono), 'Fira Code', 'Cascadia Code', monospace",
      padding: "24px 0",
      lineHeight: "1.6",
      caretColor: "#22c55e",
      maxWidth: "1100px",
      margin: "0 auto",
    },
    ".cm-cursor": {
      borderLeftColor: "#22c55e",
      borderLeftWidth: "2px",
    },
    ".cm-gutters": {
      backgroundColor: "transparent",
      borderRight: "1px solid rgba(34,197,94,0.12)",
      color: "#4a5568",
      paddingRight: "8px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(34,197,94,0.08)",
      color: "#4ade80",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(34,197,94,0.05)",
    },
    ".cm-selectionBackground": {
      backgroundColor: "rgba(34,197,94,0.18) !important",
    },
    ".cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(34,197,94,0.24) !important",
    },
    ".cm-searchMatch": {
      backgroundColor: "rgba(251,191,36,0.2)",
      outline: "1px solid rgba(251,191,36,0.5)",
    },
    ".cm-lineNumbers": {
      minWidth: "40px",
    },
    ".cm-scroller": {
      padding: "0 24px",
      overflow: "auto",
    },
    "&.cm-focused": {
      outline: "none",
    },
  },
  { dark: true }
);


export default function HalkuEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const { code, setCode } = useEditorStore();

  console.log('HalkuEditor: initial code', code);

  // 🎹 Typing sound — attaches to the editor container
  useTypingSound(containerRef);

  useEffect(() => {
    if (!containerRef.current) return;
    console.log('HalkuEditor: useEffect setup');

    const startState = EditorState.create({
      doc: code,
      extensions: [
        basicSetup,
        javascript({ typescript: false, jsx: false }),
        oneDark,
        halkuTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newCode = update.state.doc.toString();
            console.log('HalkuEditor: code changed', newCode);
            setCode(newCode);
          }
        }),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      console.log('HalkuEditor: useEffect cleanup');
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external code changes (e.g. reset) without recreating the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== code) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: code },
      });
    }
  }, [code]);

  return (
    <div
      ref={containerRef}
      id="halku-editor"
      className="size-full overflow-hidden"
      aria-label="HalkuLang / JavaScript code editor"
    />
  );
}
