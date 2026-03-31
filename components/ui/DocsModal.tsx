"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------- UI COMPONENTS -------------------- */

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      style={{
        position: "relative",
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "14px",
        fontFamily: "var(--font-jb-mono)",
        fontSize: "13px",
        overflowX: "auto",
        marginTop: "10px",
      }}
    >
      <button
        onClick={copy}
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          fontSize: "11px",
          padding: "4px 8px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          background: copied ? "#16a34a" : "#222",
          color: "white",
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>

      <pre style={{ margin: 0, whiteSpace: "pre" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h3
        style={{
          color: "white",
          fontSize: "16px",
          marginBottom: "8px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "6px",
        }}
      >
        {title}
      </h3>
      <div style={{ fontSize: "14px", lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  );
}

/* -------------------- MAIN MODAL -------------------- */

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocsModal({ isOpen, onClose }: DocsModalProps) {
  const [isDesi, setIsDesi] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            padding: "20px",
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 20, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.95 }}
            style={{
              width: "100%",
              maxWidth: "720px",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#111",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                background: "#111",
                zIndex: 10,
              }}
            >
              <h2 style={{ margin: 0, color: "white" }}>
                📖 HalkuLang Docs
              </h2>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <a
                  href="https://github.com/kapilkor/halku"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    textDecoration: "none",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: "8px",
                    padding: "6px 10px",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <img
                    src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                    alt=""
                    aria-hidden
                    width={14}
                    height={14}
                    style={{ display: "block", borderRadius: "50%" }}
                  />
                  GitHub
                </a>

                <button onClick={onClose} style={{ cursor: "pointer" }}>
                  ✕
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div style={{ padding: "24px", color: "#c9d1d9" }}>
              {!isDesi ? (
                <>
                  <p style={{ marginBottom: "20px" }}>
                    HalkuLang is a JS-powered scripting language — no wrappers needed, just write and run.
                  </p>

                  <Section title="Variable Declaration">
                    <p>Use <code>maan le</code> to declare variables.</p>
                    <CodeBlock code={`maan le name = "Olivia";`} />
                  </Section>

                  <Section title="Print Output">
                    <p><code>sun re</code> works like console.log</p>
                    <CodeBlock code={`sun re "Hello World";`} />
                  </Section>

                  <Section title="While Loop">
                    <p>Loop using <code>jab tak re</code></p>
                    <CodeBlock
                      code={`maan le i = 0;
jab tak re (i < 3) {
  sun re i;
  badha re i;
}`}
                    />
                  </Section>

                  <Section title="Conditionals">
                    <CodeBlock
                      code={`bhai agar (x > 10) {
  sun re "Big";
} nahi toh {
  sun re "Small";
}`}
                    />
                  </Section>

                  <Section title="Functions">
                    <CodeBlock
                      code={`function add(a, b) {
  de re a + b;
}`}
                    />
                  </Section>
                </>
              ) : (
                <>
                  <Section title="Variable banana hai?">
                    <p><strong>maan le</strong> use karo</p>
                    <CodeBlock code={`maan le naam = "Olivia";`} />
                  </Section>

                  <Section title="Print karna hai?">
                    <CodeBlock code={`sun re "Hello bhai";`} />
                  </Section>
                </>
              )}
            </div>

            {/* FOOTER */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                textAlign: "right",
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  background: "white",
                  color: "black",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}