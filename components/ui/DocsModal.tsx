"use client";

import { motion, AnimatePresence } from "framer-motion";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocsModal({ isOpen, onClose }: DocsModalProps) {
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
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "var(--bg-panel)",
                zIndex: 10,
              }}
            >
              <h2 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)" }}>
                📖 HalkuLang Documentation
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

            <div style={{ padding: "20px", color: "var(--text-secondary)", lineHeight: 1.6, fontSize: "14px" }}>
              <p>
                <strong>HalkuLang</strong> is a dynamically typed toy programming language written in TypeScript.
                It is designed to feel natural, conversational, and easy to learn using Hindi-English hybrid keywords.
              </p>
              
              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>General</h3>
              <p>Every HalkuLang program starts with <strong>hi halku</strong> and must end with <strong>bye halku</strong>. Anything outside of this block will be ignored.</p>
              <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`This will be ignored

hi halku
  // Write your code here
bye halku

This too will be ignored`}</pre>

              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Variables</h3>
              <p>Variables are declared using <strong>maan le</strong>.</p>
              <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`hi halku
  maan le a = 10;
  maan le b = "hello";
  maan le c = 5;

  a = a + 1;
  b = "world";
  c *= 2;

  sun re a;
  sun re b;
  sun re c;
bye halku`}</pre>

              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Types</h3>
              <p>HalkuLang supports numbers, strings, null, and booleans.</p>
              <ul style={{ paddingLeft: "20px", marginTop: 0 }}>
                <li><code>sach</code> → true</li>
                <li><code>jhoot</code> → false</li>
                <li><code>nalla</code> → null</li>
              </ul>
              <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`hi halku
  maan le a = 10;
  maan le b = 20 + (5 * 2);
  maan le c = "text";
  maan le d = 'ok';
  maan le e = nalla;
  maan le f = sach;
  maan le g = jhoot;

  sun re a, b, c, d, e, f, g;
bye halku`}</pre>

              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Output</h3>
              <p>Use <strong>sun re</strong> to print values to the console.</p>
              <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`hi halku
  sun re "Hello World";

  maan le a = 10;

  {
    maan le b = 20;
    sun re a + b;
  }

  sun re 5, "ok", nalla, sach, jhoot;
bye halku`}</pre>

              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Conditionals</h3>
              <p>HalkuLang supports if-else-if ladder using:</p>
              <ul style={{ paddingLeft: "20px", marginTop: 0 }}>
                <li><code>bhai agar</code> → if</li>
                <li><code>nahi toh agar</code> → else if</li>
                <li><code>nahi toh</code> → else</li>
              </ul>
              <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`hi halku
  maan le a = 10;

  bhai agar (a < 5) {
    sun re "a is small";
  } nahi toh agar (a < 15) {
    sun re "a is medium";
  } nahi toh {
    sun re "a is large";
  }
bye halku`}</pre>

              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Loops</h3>
              <p>Use <strong>jab tak re</strong> for while loops.</p>
              <ul style={{ paddingLeft: "20px", marginTop: 0 }}>
                <li><code>bas kar re</code> → break</li>
                <li><code>agla dekh re</code> → continue</li>
              </ul>
              <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`hi halku
  maan le i = 0;

  jab tak re (i < 5) {

    badha re i;

    bhai agar (i == 3) {
      agla dekh re;
    }

    bhai agar (i == 4) {
      bas kar re;
    }

    sun re i;
  }

  sun re "done";
bye halku`}</pre>

              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>For Loop</h3>
              <p>Use <strong>iske liye</strong> for for-loops.</p>
              <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`hi halku
  iske liye (maan le i = 0; i < 5; badha re i) {
    sun re i;
  }
bye halku`}</pre>

              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Functions</h3>
              <p>Functions are declared using <strong>function</strong> and return values using <strong>de re</strong>.</p>
              <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`hi halku
  function add(a, b) {
    de re a + b;
  }

  maan le result = add(2, 3);
  sun re result;
bye halku`}</pre>

              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Increment / Decrement</h3>
              <ul style={{ paddingLeft: "20px", marginTop: 0 }}>
                <li><code>badha re x</code> → increment</li>
                <li><code>ghata re x</code> → decrement</li>
              </ul>
              <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`hi halku
  maan le x = 5;

  badha re x;
  sun re x;

  ghata re x;
  sun re x;
bye halku`}</pre>

              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Notes</h3>
              <ul style={{ paddingLeft: "20px", marginTop: 0 }}>
                <li>HalkuLang is dynamically typed</li>
                <li>Semicolons <code>;</code> are recommended</li>
                <li>Code is block-scoped using <code>{`{ }`}</code></li>
                <li>Keywords are designed to feel natural and conversational</li>
              </ul>

              <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Example Program</h3>
              <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`hi halku
  sun re "Start";

  maan le a = 3;
  maan le b = 0;

  jab tak re (b < 5) {
    sun re b;

    bhai agar (b == a) {
      sun re "equal hai";
    }

    badha re b;
  }

  sun re "End";
bye halku`}</pre>
            </div>
            
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--border-subtle)",
                textAlign: "right",
                background: "var(--bg-secondary)"
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: "6px 16px",
                  background: "var(--text-primary)",
                  color: "var(--bg-primary)",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontWeight: 600,
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