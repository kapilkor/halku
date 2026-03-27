"use client";

import { useEffect, useState } from "react";
import { setSoundEnabled, isSoundEnabled, initSound } from "@/lib/soundManager";

interface SoundToggleProps {
  className?: string;
}

export default function SoundToggle({ className }: SoundToggleProps) {
  const [on, setOn] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    initSound();
    setOn(isSoundEnabled());
  }, []);

  const toggle = () => {
    const next = !on;
    setSoundEnabled(next);
    setOn(next);
  };

  return (
    <button
      id="halku-sound-toggle"
      onClick={toggle}
      title={on ? "Mute sounds" : "Enable sounds"}
      aria-label={on ? "Mute sounds" : "Enable sounds"}
      aria-pressed={on}
      className={className}
      style={{
        padding: "6px 10px",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border-subtle)",
        background: on ? "rgba(34,197,94,0.12)" : "transparent",
        color: on ? "#4ade80" : "var(--text-muted)",
        borderColor: on ? "rgba(34,197,94,0.4)" : "var(--border-subtle)",
        fontSize: "15px",
        lineHeight: 1,
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = on ? "rgba(34,197,94,0.6)" : "var(--border-strong)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = on
          ? "rgba(34,197,94,0.4)"
          : "var(--border-subtle)";
        e.currentTarget.style.color = on
          ? "#4ade80"
          : "var(--text-muted)";
      }}
    >
      {on ? "🔊" : "🔇"}
    </button>
  );
}
