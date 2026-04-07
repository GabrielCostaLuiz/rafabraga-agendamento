"use client";

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";

interface AudioContextType {
  activeSource: "local" | "spotify";
  isPlaying: boolean; // Is EITHER playing?
  togglePlay: () => void; // Global toggle
  toggleLocal: () => void; // Specific local toggle
  pauseLocal: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setSpotifyController: (controller: any) => void;
  setSpotifyPlayingStatus: (isPlaying: boolean) => void;
  spotifyData: any; // Optional track info
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const STORAGE_KEY = "rb_audio_state";

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlayingLocal, setIsPlayingLocal] = useState(false);
  const [isPlayingSpotify, setIsPlayingSpotify] = useState(false);
  const [activeSource, setActiveSource] = useState<"local" | "spotify">("local");
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const spotifyControllerRef = useRef<any>(null);
  
  // Computed state
  const isPlaying = isPlayingLocal || isPlayingSpotify;



  const setSpotifyController = useCallback((controller: any) => {
    spotifyControllerRef.current = controller;
  }, []);

  const setSpotifyPlayingStatus = useCallback((playing: boolean) => {
    setIsPlayingSpotify(playing);
    if (playing) {
      setActiveSource("spotify");
      // Pause local if priority is Spotify
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlayingLocal(false);
      }
    }
  }, []);

  const pauseLocal = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPlayingLocal(false);
      localStorage.setItem(STORAGE_KEY, "false");
    }
  }, []);

  const toggleLocal = useCallback(() => {
    if (!audioRef.current) return;
    
    if (isPlayingLocal) {
      pauseLocal();
    } else {
      // Pause spotify if it's currently the active player
      if (activeSource === "spotify" && isPlayingSpotify && spotifyControllerRef.current) {
        if (typeof spotifyControllerRef.current.pause === 'function') {
          spotifyControllerRef.current.pause();
        } else if (typeof spotifyControllerRef.current.togglePlay === 'function') {
          spotifyControllerRef.current.togglePlay();
        }
      }
      
      audioRef.current.play().then(() => {
        setIsPlayingLocal(true);
        setActiveSource("local");
        localStorage.setItem(STORAGE_KEY, "true");
      }).catch((e) => console.warn("Audio play blocked:", e));
    }
  }, [isPlayingLocal, activeSource, isPlayingSpotify, pauseLocal]);

  const togglePlay = useCallback(() => {
    // Determine target based on active source
    if (activeSource === "spotify") {
      if (spotifyControllerRef.current) {
        spotifyControllerRef.current.togglePlay();
        // State updates rely on 'playback_update' listener in spotify component
      } else {
        // Fallback to local if spotify controller disappeared
        setActiveSource("local");
      }
    } else {
      if (!audioRef.current) return;
      if (isPlayingLocal) {
        audioRef.current.pause();
        setIsPlayingLocal(false);
        localStorage.setItem(STORAGE_KEY, "false");
      } else {
        audioRef.current.play().then(() => {
          setIsPlayingLocal(true);
          localStorage.setItem(STORAGE_KEY, "true");
        }).catch((e) => console.warn("Audio play blocked:", e));
      }
    }
  }, [activeSource, isPlayingLocal]);

  return (
    <AudioContext.Provider value={{
      isPlaying,
      activeSource,
      togglePlay,
      toggleLocal,
      pauseLocal,
      audioRef,
      setSpotifyController,
      setSpotifyPlayingStatus,
      spotifyData: null
    }}>
      {children}
      <audio
        ref={audioRef}
        src="/Tatuado Está (Dueto) - Radio Edit_spotdown.org.mp3"
        loop
        preload="auto"
        onEnded={() => setIsPlayingLocal(false)}
      />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};
