'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useAudio } from '@/context/audio-context';

declare global {
  interface Window {
    onSpotifyIframeApiReady: (IFrameAPI: any) => void;
  }
}

const ARTISTS = [
  { id: '5XxPfh8njv8xZ2QIUd9H7t', label: 'Rafa Braga' },
  { id: '4ogPXT65SJ6PjoyRXAtkHe', label: 'Rafa Braga & Sentimento Maior' },
];

import SectionHeader from '@/components/section-header';

const MARQUEE_TOP = [
  'OUÇA AGORA', '—', 'LISTEN', '—', 'SIGA NO SPOTIFY', '—', 'STREAM', '—',
  'OUÇA AGORA', '—', 'LISTEN', '—', 'SIGA NO SPOTIFY', '—', 'STREAM', '—',
];

const MARQUEE_BOTTOM = [
  'MÚSICA', '✦', 'ARTE', '✦', 'FLOW', '✦', 'CULTURA', '✦', 'BEATS', '✦',
  'MÚSICA', '✦', 'ARTE', '✦', 'FLOW', '✦', 'CULTURA', '✦', 'BEATS', '✦',
];

export default function SpotifySection() {
  const { isPlaying, activeSource, pauseLocal, setSpotifyController, setSpotifyPlayingStatus } = useAudio();
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  const controllersRef = useRef<any[]>([]);

  useEffect(() => {
    const initSpotify = (IFrameAPI: any) => {
      ARTISTS.forEach((artist, index) => {
        const element = document.getElementById(`spotify-artist-${index}`);
        if (!element) return;

        // Limpa o container antes de criar (evita duplicatas em re-renders)
        element.innerHTML = '';

        const options = {
          width: '100%',
          height: '370',
          uri: `spotify:artist:${artist.id}`,
          theme: '0',
        };

        const callback = (EmbedController: any) => {
          controllersRef.current[index] = EmbedController;
          
          if (index === 0) {
            setSpotifyController(EmbedController);
          }

          let wasSpotifyPlaying = false;

          EmbedController.addListener('playback_update', (e: any) => {
            const isSpotifyPlayingNow = e.data && !e.data.isPaused;

            if (!wasSpotifyPlaying && isSpotifyPlayingNow) {
              pauseLocal();
              setSpotifyController(EmbedController);
              controllersRef.current.forEach((ctrl, i) => {
                if (i !== index && ctrl) ctrl.pause();
              });
            }

            if (isSpotifyPlayingNow || wasSpotifyPlaying) {
              wasSpotifyPlaying = isSpotifyPlayingNow;
              setSpotifyPlayingStatus(isSpotifyPlayingNow);
            }
          });
        };

        IFrameAPI.createController(element, options, callback);
      });
    };

    // Caso a API já tenha sido carregada anteriormente
    if (typeof (window as any).SpotifyIFrameApi !== 'undefined') {
      initSpotify((window as any).SpotifyIFrameApi);
    } else {
      window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
        (window as any).SpotifyIFrameApi = IFrameAPI;
        initSpotify(IFrameAPI);
      };
    }

    if (!document.getElementById('spotify-iframe-api')) {
      const script = document.createElement('script');
      script.id = 'spotify-iframe-api';
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [pauseLocal, setSpotifyController, setSpotifyPlayingStatus]);

  useEffect(() => {
    if (activeSource === 'local' && isPlaying) {
      controllersRef.current.forEach(ctrl => ctrl?.pause());
    }
  }, [activeSource, isPlaying]);

  return (
    <section className="relative bg-black/30 overflow-hidden" id="spotify">
      <style>{`
        @keyframes marquee-fwd {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-rev {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .mq-fwd { animation: marquee-fwd 18s linear infinite; }
        .mq-rev { animation: marquee-rev 22s linear infinite; }
      `}</style>

      {/* ── MARQUEE TOP ── */}
      <div className="w-full overflow-hidden bg-[#1DB954] py-3">
        <div className="flex whitespace-nowrap">
          {[0, 1].map(k => (
            <div key={k} className="mq-fwd flex shrink-0 items-center gap-8 pr-8">
              {MARQUEE_TOP.map((w, i) => (
                <span
                  key={i}
                  className="text-black text-[11px] font-bold uppercase tracking-[0.35em] font-sans"
                >
                  {w}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTEÚDO ORIGINAL ── */}
      <div className="py-24 px-6 md:px-20 relative">

        {/* Luz de fundo ambiental */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#1DB954]/10 blur-[150px] rounded-[100%] pointer-events-none" />

        {/* Header da Seção */}
        <SectionHeader
          titlePart1="OUÇA NO"
          titlePart2="SPOTIFY"
          subtitle="Meus maiores sucessos e melhores momentos musicais na palma da sua mão."
          barColorClass="bg-[#1DB954]"
          highlightColorClass="text-[#1DB954]"
          className="mb-16 relative z-10"
        />

        {/* Container do Player - Grid para 2 artistas */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
          {ARTISTS.map((artist, idx) => (
            <div>
               <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.25, 1, 0.5, 1] }}
              className="rounded-[24px] p-2 bg-white/5 ring-1 ring-white/10 backdrop-blur-md shadow-2xl"
            >
              <div className="w-full bg-black/50 rounded-[16px] overflow-hidden min-h-[370px]">
                <div 
                  id={`spotify-artist-${idx}`}
                  className="w-full h-[370px]"
                />
              </div>
            </motion.div>

              <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 relative z-10"
        >
  
            <a
              key={ARTISTS[idx].id}
              href={`https://open.spotify.com/artist/${ARTISTS[idx].id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/5 text-white/80 border border-white/10 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#1DB954] hover:text-black hover:border-[#1DB954] hover:scale-105 active:scale-95 transition-all outline-none flex items-center justify-center gap-2"
            >
              Seguir
            </a>
        </motion.div>
            </div>
           
          ))}
        </div>


      </div>

      {/* ── MARQUEE BOTTOM ── */}
      <div className="w-full overflow-hidden border-t border-white/5 py-4">
        <div className="flex whitespace-nowrap">
          {[0, 1].map(k => (
            <div key={k} className="mq-rev flex shrink-0 items-center gap-10 pr-10">
              {MARQUEE_BOTTOM.map((w, i) => (
                <span
                  key={i}
                  className="text-white/10 text-[11px] uppercase tracking-[0.5em] font-sans"
                >
                  {w}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}