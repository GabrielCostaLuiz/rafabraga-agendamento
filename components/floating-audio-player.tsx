"use client";

import { useAudio } from "@/context/audio-context";
import { motion, AnimatePresence } from "motion/react";
import Waveform from "./waveform";
import { useEffect, useState } from "react";

export default function FloatingAudioPlayer() {
  const { isPlaying, togglePlay, activeSource } = useAudio();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className={`flex items-center gap-3 pr-4 p-2 rounded-full backdrop-blur-md shadow-2xl ring-1 transition-all ${
            isPlaying 
              ? 'bg-red-600/20 ring-red-500/50 text-white' 
              : 'bg-black/50 ring-white/10 text-white/50 hover:bg-black/80 hover:text-white'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPlaying ? 'bg-red-600' : 'bg-white/10'}`}>
            {isPlaying ? (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </div>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-xs font-bold uppercase tracking-wider">{isPlaying ? 'Tocando Agora' : 'Pausado'}</span>
            <span className="text-[10px] opacity-70">
              {activeSource === "spotify" ? "Tocando do Spotify" : "Tatuado Está (Dueto)"}
            </span>
          </div>
          
          {isPlaying && (
            <div className="ml-2 w-12 hidden sm:block">
              <Waveform height={20} gap={2} count={12} isPaused={!isPlaying} color={activeSource === 'spotify' ? 'bg-[#1DB954]' : 'bg-red-500'} />
            </div>
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
