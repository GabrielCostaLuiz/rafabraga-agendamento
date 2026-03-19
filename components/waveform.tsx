"use client";

import React, { useEffect, useState } from 'react';

interface WaveformProps {
  count?: number;
  speed?: number; // 1 is normal, >1 is fast, <1 is slow
  color?: string;
  gap?: number;
  opacity?: number;
  className?: string;
  height?: number | string;
  isPaused?: boolean;
}

const Waveform: React.FC<WaveformProps> = ({
  count = 50,
  speed = 1,
  color = "bg-white",
  gap = 1.5,
  opacity = 0.3,
  className = "",
  height = "5rem",
  isPaused = false
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div 
        className={`flex items-center justify-center w-full max-w-2xl mx-auto ${className}`}
        style={{ 
          height: typeof height === 'number' ? `${height}px` : height, 
          gap: `${gap}px`, 
          opacity: 0 
        }}
      >
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center justify-center w-full max-w-2xl mx-auto ${className}`}
      style={{ 
        height: typeof height === 'number' ? `${height}px` : height,
        gap: `${gap}px`,
        opacity 
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waveform-pulse {
          0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
          50% { transform: scaleY(1); opacity: 1; }
        }
        .animate-waveform-bar {
          animation: waveform-pulse var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          transform-origin: center;
        }
      `}} />
      {[...Array(count)].map((_, i) => {
        const noise = Math.random() * 30;
        const wave = Math.abs(Math.sin(i * 0.2)) * 50;
        const baseH = 20 + wave + noise;
        const duration = (1.5 / speed) + (Math.random() * (0.5 / speed));
        
        return (
          <div 
            key={i} 
            className={`w-3 rounded-full animate-waveform-bar ${color}`} 
            style={{ 
              height: `${baseH}%`,
              '--duration': `${duration}s`,
              '--delay': `${i * 0.04}s`,
              animationPlayState: isPaused ? 'paused' : 'running'
            } as any}
          ></div>
        );
      })}
    </div>
  );
};

export default Waveform;
