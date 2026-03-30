"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
                📖 HalkuLang Docs
              </h2>
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: !isDesi ? "var(--text-primary)" : "var(--text-muted)", fontWeight: !isDesi ? "bold" : "normal" }}>English</span>
                <button
                  onClick={() => setIsDesi(!isDesi)}
                  style={{
                    width: "40px",
                    height: "22px",
                    borderRadius: "11px",
                    background: isDesi ? "var(--border-strong)" : "var(--border-subtle)",
                    position: "relative",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.3s"
                  }}
                >
                  <motion.div
                    layout
                    initial={false}
                    animate={{ x: isDesi ? 18 : 2 }}
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "white",
                      position: "absolute",
                      top: "2px"
                    }}
                  />
                </button>
                <span style={{ fontSize: "12px", color: isDesi ? "var(--text-primary)" : "var(--text-muted)", fontWeight: isDesi ? "bold" : "normal" }}>Desi Vibe</span>
              </div>

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
              {!isDesi ? (
                <>
                  <p>
                    <strong>HalkuLang</strong> is a fun, beginner-friendly scripting language that mixes Hindi keywords with English-style syntax. It feels natural for Hindi-speaking developers while keeping the logic simple and JavaScript-like.
                  </p>
                  <p><strong>Core Philosophy:</strong> Code should feel like speaking &mdash; mix <code>maan le</code>, <code>sun re</code>, <code>bhai agar</code> with normal expressions.</p>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Variable Declaration</h3>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nmaan le variableName = value;\nbye halku`}</pre>
                  <p><code>maan le</code> &rarr; declare a variable (like let in JavaScript)</p>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Output / Print</h3>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nsun re expression;\nbye halku`}</pre>
                  <p><code>sun re</code> &rarr; print to console (like console.log)</p>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Data Types</h3>
                  <ul style={{ paddingLeft: "20px", marginTop: 0 }}>
                    <li><code>sach</code> &rarr; true</li>
                    <li><code>jhoot</code> &rarr; false</li>
                    <li><code>nalla</code> &rarr; null</li>
                  </ul>
                  <p><strong>Arithmetic & String Operations:</strong> You can freely use <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, <code>+</code> for string concatenation, etc.</p>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>While Loop</h3>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\njab tak re (condition) {\n  // code\n}\nbye halku`}</pre>
                  <p><code>jab tak re</code> &rarr; while</p>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Increment</h3>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nbadha re variable;     // variable = variable + 1\nbye halku`}</pre>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Conditionals (if-else)</h3>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nbhai agar (condition) {\n  // code\n} nahi toh agar (condition) {\n  // code\n} nahi toh {\n  // else\n}\nbye halku`}</pre>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Functions</h3>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nfunction functionName(parameters) {\n  // code\n  de re returnValue;     // return statement\n}\nbye halku`}</pre>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Example: Full Program</h3>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nmaan le naam = "Pranav";\nmaan le surname = "Kshirsagar";\nsun re naam + " " + surname;\n\nmaan le ginti = 0;\njab tak re (ginti < 3) {\n  sun re "Count = " + ginti;\n  badha re ginti;\n}\n\nfunction factorial(n) {\n  bhai agar (n <= 1) {\n    de re 1;\n  }\n  de re n * factorial(n - 1);\n}\n\nsun re "5! = " + factorial(5);\nbye halku`}</pre>
                </>
              ) : (
                <>
                  <p>
                    <strong>Bhai, yeh raha HalkuLang ka full documentation, bilkul simple bhasha mein:</strong>
                  </p>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Variable banana hai?</h3>
                  <p>&rarr; <strong>maan le</strong> bol ke variable banao!</p>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nmaan le a = "Pranav";\nmaan le b = "kshirsagar";\nmaan le age = 22;\nmaan le sach_hai = sach;\nmaan le khali_hai = nalla;\nbye halku`}</pre>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Kuch print karna hai?</h3>
                  <p>&rarr; <strong>sun re</strong> bol do!</p>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nsun re "Hello World";\nsun re a + " " + b;\nsun re "Mera naam " + a + " hai";\nbye halku`}</pre>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Loop chalana hai?</h3>
                  <p>&rarr; <strong>jab tak re</strong> use karo</p>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nmaan le count = 0;\njab tak re (count < 5) {\n  sun re "Halku count = " + count;\n  badha re count;\n}\nbye halku`}</pre>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Condition lagana hai?</h3>
                  <p>&rarr; <strong>bhai agar ... nahi toh agar ... nahi toh</strong></p>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nmaan le marks = 85;\n\nbhai agar (marks >= 90) {\n  sun re "Topper!";\n} nahi toh agar (marks >= 60) {\n  sun re "Pass ho gaya bhai";\n} nahi toh {\n  sun re "Better luck next time";\n}\nbye halku`}</pre>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Function banana hai?</h3>
                  <p>&rarr; Normal function likho aur <strong>de re</strong> se return karo</p>
                  <pre style={{ background: "var(--bg-secondary)", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-subtle)", fontFamily: "var(--font-jb-mono)", whiteSpace: "pre-wrap" }}>{`halku\nfunction add(x, y) {\n  de re x + y;\n}\n\nfunction factorial(n) {\n  bhai agar (n <= 1) {\n    de re 1;\n  }\n  de re n * factorial(n - 1);\n}\n\nsun re "3 + 5 = " + add(3, 5);\nsun re "5 ka factorial = " + factorial(5);\nbye halku`}</pre>

                  <h3 style={{ color: "var(--text-primary)", marginTop: "1.5rem", marginBottom: "8px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "4px" }}>Special Keywords Summary:</h3>
                  <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", marginTop: "10px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border-strong)" }}>
                        <th style={{ padding: "8px" }}>Halku Keyword</th>
                        <th style={{ padding: "8px" }}>Matlab (English)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>maan le</code></td>
                        <td style={{ padding: "8px" }}>let / declare variable</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>sun re</code></td>
                        <td style={{ padding: "8px" }}>console.log / print</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>sach</code></td>
                        <td style={{ padding: "8px" }}>true</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>jhoot</code></td>
                        <td style={{ padding: "8px" }}>false</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>nalla</code></td>
                        <td style={{ padding: "8px" }}>null</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>jab tak re</code></td>
                        <td style={{ padding: "8px" }}>while</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>badha re</code></td>
                        <td style={{ padding: "8px" }}>variable++ (increment)</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>bhai agar</code></td>
                        <td style={{ padding: "8px" }}>if</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>nahi toh agar</code></td>
                        <td style={{ padding: "8px" }}>else if</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>nahi toh</code></td>
                        <td style={{ padding: "8px" }}>else</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "8px" }}><code>de re</code></td>
                        <td style={{ padding: "8px" }}>return</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p style={{ marginTop: "20px", fontWeight: "bold", textAlign: "center", color: "var(--text-primary)" }}>
                    Ab tu apna code Halku style mein likh aur maza le bhai! 🚀
                  </p>
                </>
              )}
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