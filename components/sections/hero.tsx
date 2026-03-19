"use client";

import Image from "next/image";
import LightRays from '@/components/light-rays';
import Waveform from '@/components/waveform';
import { useAudio } from "@/context/audio-context";

const Hero = () => {
  const { isPlaying, activeSource, toggleLocal } = useAudio();
  const isPlayingLocalTrack = isPlaying && activeSource === "local";

  return (
    <section className="relative min-h-screen w-full bg-black text-white overflow-hidden pt-10 md:pt-30 pb-30 px-4">
      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-20 scale-100"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        {/* Overlay para contraste */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Luz Atmosférica (Refatorada para ficar dentro do Hero) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
        <LightRays
          raysOrigin="top-center"
          raysColor="#FFFFFF"
          raysSpeed={0.5}
          lightSpread={2}
          rayLength={5}
          followMouse={true}
          mouseInfluence={0}
          noiseAmount={0}
          distortion={0.02}
          pulsating={false}
          fadeDistance={1.5}
          saturation={0}
        />
      </div>

      {/* Hero Content (Z-Index fix) */}
      <div className="relative z-10 flex flex-col items-center h-full pt-12 text-center">
        {/* Interaction Badge (Disco Giratório) */}
        <button 
          onClick={toggleLocal}
          className="mb-8 flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-1.5 pr-5 py-1.5 transition-all hover:bg-white/10 group cursor-pointer"
        >
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Spinning Disc */}
            <div 
              className="relative w-full h-full rounded-full overflow-hidden animate-[spin_8s_linear_infinite] shadow-xl ring-1 ring-white/20"
              style={{ animationPlayState: isPlayingLocalTrack ? 'running' : 'paused' }}
            >
              <Image 
                src="/rafa-gibli.jpeg" 
                alt="Rafa Record" 
                fill 
                sizes="40px"
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.4)_100%)]"></div>
            </div>
            
            <div className="absolute w-2.5 h-2.5 bg-black rounded-full border border-white/40 z-20 shadow-inner"></div>
            <div className="absolute w-1 h-1 bg-white/20 rounded-full z-30"></div>
            
            <div className={`absolute inset-0 flex items-center justify-center z-40 transition-opacity bg-black/20 rounded-full ${isPlayingLocalTrack ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
              {isPlayingLocalTrack ? (
                <div className="w-3 h-3 flex gap-0.5">
                  <div className="w-1 h-full bg-white"></div>
                  <div className="w-1 h-full bg-white"></div>
                </div>
              ) : (
                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-10 border-l-white border-b-[6px] border-b-transparent ml-1"></div>
              )}
            </div>
          </div>
          
          <span className="font-medium tracking-tight text-white/80 group-hover:text-white transition-colors">
            Tatuado Está (Dueto)
          </span>
        </button>

        {/* Headline */}
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[1.1] mb-8 font-outfit">
          A voz que marca <br />
          <span className="text-red-500/80">os seus momentos</span>
        </h1>

        {/* Subtitle */}
        <p className="text-md md:text-lg text-white/50 max-w-xl mb-12 font-medium">
          Agenda aberta para shows, casamentos e eventos corporativos. <br />
          Explore as músicas, confira as datas e peça seu orçamento.
        </p>

        {/* CTA */}
        <div className="flex flex-col md:flex-row gap-4 ">
          <a href="#contato" className="px-8 py-4 bg-red-500 text-white rounded-full font-bold text-md hover:scale-105 transition-transform flex items-center justify-center">
            Pedir Orçamento
          </a>
          <a href="#agenda" className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-md hover:bg-white/10 transition-colors flex items-center justify-center">
            Ver Agenda
          </a>
        </div>

        {/* Milestone */}
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-white/50">
          Mais de 20 anos levando emoção através da música
        </p>

        {/* Waveform Visualization (Dynamic) */}
        <Waveform 
          count={50} 
          speed={1} 
          color="bg-white/40" 
          opacity={0.5} 
          className="mt-24" 
          isPaused={!isPlayingLocalTrack}
        />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-brand-dark to-transparent z-10" />
    </section>
  );
};

export default Hero;
