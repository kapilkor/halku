import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditorStore } from "@/store/editorStore";

const MAPPABLE_KEYWORDS = [
  { label: "Print", target: "sun re", defaultPlaceholder: "bol re" },
  { label: "Variable", target: "maan le", defaultPlaceholder: "rakh le" },
  { label: "Loop", target: "jab tak re", defaultPlaceholder: "ghuma jab tak" },
  { label: "If", target: "bhai agar", defaultPlaceholder: "agar bhai" },
  { label: "Else", target: "nahi toh", defaultPlaceholder: "warna" },
];

export default function CustomMappingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const customMapping = useEditorStore((s) => s.customMapping);
  const setCustomMapping = useEditorStore((s) => s.setCustomMapping);

  // Keep local drafting state so we can apply them en-masse
  const [localMappings, setLocalMappings] = React.useState<Record<string, string>>({});
  
  // Custom rows logic (if user wants to add an extra english word -> halku word)
  // Mapping standard: keys are user words, values are halku default words
  
  // When modal boots, clone the global store into local
  React.useEffect(() => {
    if (isOpen) {
      setLocalMappings({ ...customMapping });
    }
  }, [isOpen, customMapping]);

  if (!isOpen) return null;

  const handleSave = () => {
    // 1. Wipe old mapping, save everything newly structured
    // Validation check: clean trailing spaces and don't save empty user targets.
    const cleanMapping: Record<string, string> = {};
    Object.entries(localMappings).forEach(([userWord, halkuTarget]) => {
      const u = userWord.trim();
      const h = halkuTarget.trim();
      if (u && h) {
        cleanMapping[u] = h;
      }
    });

    setCustomMapping(cleanMapping);
    onClose();
  };

  const setTargetWord = (targetHalkuWord: string, newUserWord: string) => {
    // We must find the OLD entry for this target, remove it, and add the new one.
    const updated = { ...localMappings };
    
    // Find if something already points to targetHalkuWord
    const oldEntryKey = Object.entries(updated).find(([_, t]) => t === targetHalkuWord)?.[0];
    if (oldEntryKey) {
      delete updated[oldEntryKey];
    }

    if (newUserWord.trim()) {
      updated[newUserWord] = targetHalkuWord;
    }
    
    setLocalMappings(updated);
  };

  // Render logic...
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position:       "fixed",
            inset:          0,
            zIndex:         9999,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            padding:        "20px",
            background:     "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            style={{
              background:    "var(--bg-primary)",
              border:        "1px solid var(--border-strong)",
              borderRadius:  "var(--radius-lg)",
              width:         "100%",
              maxWidth:      "520px",
              maxHeight:     "85vh",
              display:       "flex",
              flexDirection: "column",
              boxShadow:     "0 20px 40px rgba(0,0,0,0.5)",
              overflow:      "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding:      "16px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "space-between",
                background:   "var(--bg-secondary)",
              }}
            >
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>
                  Configure Custom Keywords
                </h2>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>
                  Map your own custom words to HalkuLang native keywords.
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {MAPPABLE_KEYWORDS.map((kw) => {
                  const currentWord = Object.entries(localMappings).find(([_, target]) => target === kw.target)?.[0] || "";
                  
                  return (
                    <div key={kw.target} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>
                        {kw.label} <span style={{opacity: 0.5}}>({kw.target})</span>
                      </label>
                      <input
                        type="text"
                        placeholder={kw.defaultPlaceholder}
                        value={currentWord}
                        onChange={(e) => setTargetWord(kw.target, e.target.value)}
                        style={{
                          background: "var(--bg-secondary)",
                          border: "1px solid var(--border-subtle)",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          color: "var(--text-primary)",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              
              <div style={{ marginTop: "10px", padding: "12px", background: "rgba(239, 68, 68, 0.05)", borderRadius: "6px", border: "1px dashed rgba(239,68,68,0.2)"}}>
                <button
                  onClick={() => setLocalMappings({})}
                  style={{
                    color: "var(--text-danger, #ef4444)",
                    background: "transparent",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                   Reset all to defaults
                </button>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 20px",
                borderTop: "1px solid var(--border-subtle)",
                background: "var(--bg-secondary)",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-strong)",
                  background: "transparent",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  background: "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Save Keywords
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}