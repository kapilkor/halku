"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ThoughtBubbleProps {
  message: string;
  visible: boolean;
  /** On mobile the bubble can't go right — flip to left anchor */
  mobileLeft?: boolean;
}

export default function ThoughtBubble({
  message,
  visible,
  mobileLeft,
}: ThoughtBubbleProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={message}
          role="status"
          aria-live="polite"
          aria-label={`Hal says: ${message}`}
          initial={{ opacity: 0, scale: 0.7, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 4 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          style={{
            position:        "absolute",
            bottom:          "calc(100% + 12px)",
            right:           0,
            width:           "max-content",
            maxWidth:        "210px",
            transformOrigin: "bottom right",
            // On very small viewports, slide left instead of clipping
            ...(mobileLeft
              ? { right: "auto", left: 0, transformOrigin: "bottom left" }
              : {}),
          }}
        >
          {/* Cloud */}
          <div
            style={{
              position:       "relative",
              background:     "var(--bg-elevated)",
              border:         "1px solid var(--border-strong)",
              borderRadius:   "14px",
              padding:        "10px 14px",
              fontSize:       "12px",
              lineHeight:     1.5,
              color:          "var(--text-primary)",
              boxShadow:
                "0 4px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(139,92,246,0.15)",
              backdropFilter:       "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {message}

            {/* Tail — right side by default, left side when mobileLeft */}
            {!mobileLeft ? (
              <>
                <span
                  aria-hidden
                  style={{
                    position:    "absolute",
                    bottom:      "-8px",
                    right:       "22px",
                    width:       0,
                    height:      0,
                    borderLeft:  "7px solid transparent",
                    borderRight: "0 solid transparent",
                    borderTop:   "8px solid var(--border-strong)",
                  }}
                />
                <span
                  aria-hidden
                  style={{
                    position:    "absolute",
                    bottom:      "-6px",
                    right:       "23px",
                    width:       0,
                    height:      0,
                    borderLeft:  "6px solid transparent",
                    borderRight: "0 solid transparent",
                    borderTop:   "7px solid var(--bg-elevated)",
                  }}
                />
              </>
            ) : (
              <>
                <span
                  aria-hidden
                  style={{
                    position:    "absolute",
                    bottom:      "-8px",
                    left:        "22px",
                    width:       0,
                    height:      0,
                    borderLeft:  "0 solid transparent",
                    borderRight: "7px solid transparent",
                    borderTop:   "8px solid var(--border-strong)",
                  }}
                />
                <span
                  aria-hidden
                  style={{
                    position:    "absolute",
                    bottom:      "-6px",
                    left:        "23px",
                    width:       0,
                    height:      0,
                    borderLeft:  "0 solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop:   "7px solid var(--bg-elevated)",
                  }}
                />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
