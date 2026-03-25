'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SectionHeader from '@/components/section-header';

export interface Show {
  _id?: string;
  date: string;
  weekday: string;
  month: string;
  title: string;
  venue: string;
  city: string;
  time: string;
}

function getMapsUrl(venue: string, city: string) {
  // Remove TUDO que estiver entre parênteses para garantir que o Google Maps não se perca
  const cleanVenue = venue.replace(/\s*\(.*?\)/g, "").trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cleanVenue}, ${city}`)}`;
}

export default function Agenda() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchShows() {
      try {
        const response = await fetch('/api/agenda', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          // Only show events marked as visible on the site
          setShows(data.filter((s: Show & { showOnSite?: boolean }) => s.showOnSite !== false));
        }
      } catch (error) {
        console.error("Erro ao carregar agenda:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchShows();
  }, []);

  // Se não estiver expandido, mostra apenas os 5 primeiros
  const displayedShows = isExpanded ? shows : shows.slice(0, 5);

  return (
    <section className="relative py-24 px-6 md:px-20" id="agenda">
      {/* Header da Seção */}
   
       <SectionHeader
        titlePart1="PRÓXIMOS"
        titlePart2="SHOWS"
        subtitle="Acompanhe onde será a próxima resenha"
        className="mb-16 relative z-10"
      />

      {isLoading ? (
        /* Skeleton Loading State */
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-8 py-8 border-b border-white/5 animate-pulse">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-10 h-3 bg-white/5 rounded" />
                <div className="w-16 h-12 bg-white/10 rounded-lg" />
                <div className="w-10 h-3 bg-red-500/10 rounded" />
              </div>
              <div className="flex-1">
                <div className="w-1/3 h-6 bg-white/10 rounded mb-4" />
                <div className="w-1/2 h-4 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : shows.length === 0 ? (
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24 bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-3xl backdrop-blur-md">
          <svg className="w-16 h-16 text-white/10 mb-6 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <h3 className="text-2xl font-bold text-white mb-2 font-outfit uppercase tracking-tighter">Agenda Fechada</h3>
          <p className="text-white/40 text-center max-w-sm text-sm font-medium">Não há shows públicos confirmados para os próximos dias. Fique de olho ou peça um orçamento para o seu evento!</p>
        </div>
      ) : (
        <>
          {/* Lista de Shows */}
          <div className="max-w-4xl mx-auto flex flex-col">
            <AnimatePresence>
          {displayedShows.map((show, i) => (
            <motion.div
              key={show.title + show.date}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
              className="overflow-hidden"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i < 5 ? i * 0.1 : 0, ease: [0.25, 1, 0.5, 1] }}
                className="group py-6 md:py-8 border-b border-white/5 hover:border-white/15 transition-colors cursor-pointer"
              >
                {/* Layout Mobile: empilhado / Desktop: horizontal */}
                <div className="flex items-center gap-4 md:gap-8">
                  {/* Data */}
                  <div className="flex items-center gap-4 md:gap-6 shrink-0">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 font-sans">
                        {show.weekday}
                      </span>
                      <span className="text-3xl md:text-5xl font-black leading-none font-outfit text-white group-hover:text-red-500 transition-colors">
                        {show.date}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-red-500/80 font-sans">
                        {show.month}
                      </span>
                    </div>

                    {/* Separador vertical */}
                    <div className="hidden md:block w-px h-14 bg-white/10 group-hover:bg-red-500/30 transition-colors" />
                  </div>

                  {/* Info + Hora + Local */}
                  <div className="flex-1 min-w-0">
                    {/* Título + Hora (desktop) */}
                    <div className="flex items-start md:items-center justify-between gap-2">
                      <h3 className="text-base md:text-xl font-bold uppercase tracking-tight text-white group-hover:text-white/90 transition-colors font-outfit">
                        {show.title}
                      </h3>
                    
                    </div>

                    {/* Local */}
                    <div className="flex items-center gap-2 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20 shrink-0">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-white/40 text-xs md:text-sm font-sans truncate">
                        {show.venue} — {show.city}
                      </span>
                    </div>

                    {/* Mobile: Hora + Ver Local */}
                    <div className="flex items-center gap-3 mt-3 md:hidden">
                      <span className="text-white/30 text-xs font-bold font-sans">
                        {show.time}
                      </span>
                      <a
                        href={getMapsUrl(show.venue, show.city)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-white/5 text-white/60 border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Ver Local
                      </a>
                    </div>
                  </div>

                  {/* Desktop: Ver Local */}
                  <div className="flex flex-col items-center gap-2">
                      <span className="hidden md:block text-white/30 text-sm font-bold font-sans shrink-0">
                        Horário: {show.time}
                      </span>
                        <a
                    href={getMapsUrl(show.venue, show.city)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border bg-white/5 text-white/60 border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Ver Local
                  </a>
                  </div>
                
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

          {/* CTA */}
          {shows.length > 5 && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center mt-14"
            >
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all outline-none"
              >
                {isExpanded ? 'Ver Menos' : 'Ver Agenda Completa'}
              </button>
            </motion.div>
          )}
        </>
      )}
    </section>
  );
}
