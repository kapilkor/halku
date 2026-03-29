"use client";

import React from 'react';
import { useMascotStore } from '@/store/mascotStore';

const STATE_IMAGE_MAP: Record<string, string[]> = {
  idle: [
    '/hulk/idle/halku-idle-1.png',
    '/hulk/idle/halku-idle-2.png',
  ],
  thinking: [
    '/hulk/thinking/halku-thinking-1.png',
    '/hulk/thinking/halku-thinking-2.png',
  ],
  happy: [     // success state
    '/hulk/success/halku-success-1.png',
    '/hulk/success/halku-success-2.png',
  ],
  sad: [       // error state
    '/hulk/error/halku-error-1.png',
    '/hulk/error/halku-error-2.png',
  ],
};

export default function HulkAvatar() {
  const { state } = useMascotStore(); // your FSM state

  // Get images for current state
  const imageOptions = STATE_IMAGE_MAP[state] || STATE_IMAGE_MAP.idle;

  // Randomly pick one for more lively feel (or use index 0 for fixed)
  const currentImage = imageOptions[Math.floor(Math.random() * imageOptions.length)];

  return (
    <div className="relative flex items-center justify-center w-20 h-20"> {/* adjust size as needed */}
      <img
        src={currentImage}
        alt="Halku Mascot"
        className="w-full h-full object-contain drop-shadow-xl transition-all duration-300"
        style={{
          filter: state === 'happy' ? 'drop-shadow(0 0 15px #22c55e)' : 
                  state === 'sad' ? 'drop-shadow(0 0 15px #ef4444)' : 
                  state === 'thinking' ? 'drop-shadow(0 0 12px #eab308)' : 'none',
        }}
        onError={(e) => {
          // Fallback if image fails to load
          e.currentTarget.src = '/hulk/idle/halku-idle-1.png';
        }}
      />

      {/* Optional subtle animation based on state */}
      {state === 'happy' && (
        <div className="absolute -top-1 -right-1 text-2xl animate-bounce">✨</div>
      )}
      {state === 'sad' && (
        <div className="absolute -top-2 text-xl animate-pulse">💢</div>
      )}
    </div>
  );
}
