"use client";

import { motion } from "framer-motion";
import type { MascotState } from "@/lib/mascotFSM";

interface HulkAvatarProps {
  state: MascotState;
  size?: number;
}

const BROW_LEFT: Record<MascotState, string> = {
  idle:     "M 75 85 Q 85 80 95 87",     
  thinking: "M 75 80 Q 85 75 95 82",     
  happy:    "M 75 85 Q 85 80 95 85",     
  sad:      "M 75 88 Q 85 82 95 85",     
};

const BROW_RIGHT: Record<MascotState, string> = {
  idle:     "M 125 85 Q 115 80 105 87",
  thinking: "M 125 85 Q 115 85 105 85",  
  happy:    "M 125 85 Q 115 80 105 85",
  sad:      "M 125 88 Q 115 82 105 85",
};

const MOUTH: Record<MascotState, React.ReactNode> = {
  idle: (
    <g>
      <rect x="85" y="110" width="30" height="10" rx="3" fill="#fff" stroke="#111" strokeWidth="2" />
      <line x1="85" y1="115" x2="115" y2="115" stroke="#111" strokeWidth="2" />
      <line x1="95" y1="110" x2="95" y2="120" stroke="#111" strokeWidth="2" />
      <line x1="105" y1="110" x2="105" y2="120" stroke="#111" strokeWidth="2" />
    </g>
  ),
  thinking: (
    <path d="M 90 115 Q 100 115 110 110" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
  ),
  happy: (
    <path d="M 80 110 Q 100 130 120 110 Z" fill="#fff" stroke="#111" strokeWidth="2" />
  ),
  sad: (
    <path d="M 85 118 Q 100 108 115 118" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
  ),
};

const SKIN_COLOR = "#22c55e"; 
const SKIN_SHADOW = "#16a34a";
const SKIN_HIGHLIGHT = "#4ade80";
const PANTS_COLOR = "#334155";

export default function HulkAvatar({ state, size = 120 }: HulkAvatarProps) {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      aria-label={`Chibi Hulk is ${state}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <filter id="sticker-border" x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="DILATED" />
          <feFlood floodColor="#ffffff" result="WHITE" />
          <feComposite in="WHITE" in2="DILATED" operator="in" result="OUTLINE" />
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(34,197,94,0.4)" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <radialGradient id="muscleGrad" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={SKIN_HIGHLIGHT} />
          <stop offset="60%" stopColor={SKIN_COLOR} />
          <stop offset="100%" stopColor={SKIN_SHADOW} />
        </radialGradient>
      </defs>

      <g filter="url(#sticker-border)">
        <ellipse cx="60" cy="110" rx="35" ry="40" fill="url(#muscleGrad)" stroke="#111" strokeWidth="3" transform="rotate(-15 60 110)" />
        <ellipse cx="140" cy="110" rx="35" ry="40" fill="url(#muscleGrad)" stroke="#111" strokeWidth="3" transform="rotate(15 140 110)" />
        
        <path d="M 60 100 Q 100 160 140 100 L 130 150 Q 100 170 70 150 Z" fill="url(#muscleGrad)" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        
        <path d="M 65 145 L 135 145 L 140 180 L 120 170 L 100 185 L 80 170 L 60 180 Z" fill={PANTS_COLOR} stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        
        <path d="M 75 110 Q 100 125 125 110" fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
        <path d="M 100 115 L 100 145" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
        <path d="M 85 135 Q 100 145 115 135" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />

        <path d="M 65 65 C 65 30 135 30 135 65 C 145 95 125 130 100 130 C 75 130 55 95 65 65 Z" fill="url(#muscleGrad)" stroke="#111" strokeWidth="3" />
        
        <path d="M 55 55 Q 80 10 100 20 Q 120 10 145 55 Q 155 45 130 25 Q 140 20 115 15 Q 100 5 85 15 Q 60 20 70 25 Q 45 45 55 55 Z" fill="#1f2937" stroke="#111" strokeWidth="3" strokeLinejoin="round" />
        <path d="M 60 45 L 75 60 L 80 40 L 95 65 L 105 45 L 115 65 L 125 45 L 130 60 L 140 45" fill="#1f2937" />

        <path d="M 75 90 L 90 95 L 85 92 Z" fill="#fff" stroke="#111" strokeWidth="2" />
        <circle cx="85" cy="94" r="2" fill="#ef4444" />
        
        <path d="M 125 90 L 110 95 L 115 92 Z" fill="#fff" stroke="#111" strokeWidth="2" />
        <circle cx="115" cy="94" r="2" fill="#ef4444" />

        <motion.path
          d={BROW_LEFT[state]}
          fill="none"
          stroke="#111"
          strokeWidth="5"
          strokeLinecap="round"
          animate={{ d: BROW_LEFT[state] }}
        />
        <motion.path
          d={BROW_RIGHT[state]}
          fill="none"
          stroke="#111"
          strokeWidth="5"
          strokeLinecap="round"
          animate={{ d: BROW_RIGHT[state] }}
        />

        {MOUTH[state]}

        <circle cx="50" cy="140" r="26" fill="url(#muscleGrad)" stroke="#111" strokeWidth="3" />
        <path d="M 35 130 Q 30 140 40 150" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 45 125 Q 40 140 55 155" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 58 128 Q 55 140 65 150" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        
        <circle cx="150" cy="140" r="26" fill="url(#muscleGrad)" stroke="#111" strokeWidth="3" />
        <path d="M 165 130 Q 170 140 160 150" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 155 125 Q 160 140 145 155" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 142 128 Q 145 140 135 150" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </motion.svg>
  );
}
