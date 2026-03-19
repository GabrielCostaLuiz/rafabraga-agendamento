import Hero from "@/components/sections/hero";
import Agenda from "@/components/sections/agenda";
import Header from "@/components/header";
import BentoServices from "@/components/sections/bento-services";
import SpotifySection from "@/components/sections/spotify-section";
import About from "@/components/sections/about";
import Contact from "@/components/sections/contact";
import SocialDock from "@/components/social-dock";
import { AudioProvider } from "@/context/audio-context";
import LogoLoop from "@/components/logo-loop";
import FloatingAudioPlayer from "@/components/floating-audio-player";
import { getShows } from "@/app/actions/agenda";

export default async function Home() {
  const shows = await getShows();
  
  const logos = [
    {
      node: "/logo-loop/beco_logo.png",
      title: "Beco Alfas",
    },
    {
      node: "/logo-loop/ollie_logo.png",
      title: "Ollie Beautify",
    },
    {
      node: "/logo-loop/quintal_logo.png",
      title: "Quintal do Espeto",
    },
    {
      node: "/logo-loop/palmeiras_logo.png",
      title: "Palmeiras"
    }
  ];

  return (
    <AudioProvider>
      <div className="relative w-full bg-brand-dark text-white font-sans flex flex-col">
        {/* Dock Lateral Social */}
        <SocialDock />

        {/* Componente Header Unificado */}
        <Header
          logo="R—B"
          leftLinks={[
            { label: "agenda", href: "#agenda" },
            { label: "O que faço", href: "#o-que-faco" },
          ]}
          rightLinks={[
            { label: "spotify", href: "#spotify" },
            { label: "contato", href: "#contato" },
          ]}
        />

        {/* Hero Section Modularizada */}
        <main className="flex-1">
          <Hero />

          <div className="pt-20 pb-10 bg-brand-dark container mx-auto">
            <LogoLoop
              logos={logos}
              speed={100}
              direction="left"
              logoHeight={60}
              gap={60}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="var(--brand-dark)"
              ariaLabel="Technology partners"
            />
          </div>

          {/* Seção de Agenda — Próximos Shows */}
          <Agenda shows={shows} />

          {/* Seção Bento Grid — O que eu faço */}
          <BentoServices />

          {/* Seção do Spotify */}
          <SpotifySection />

          <About />

          <Contact/>
        
          <FloatingAudioPlayer />

          {/* Footer Refinado */}
          <footer className="pt-20 pb-10 px-6 bg-brand-dark flex flex-col items-center border-t border-white/5 mt-auto">
             <h2 className="text-[12vw] leading-none uppercase font-black text-center bg-linear-to-b from-white to-white/10 bg-clip-text text-transparent mb-12 font-outfit select-none">
               RAFA BRAGA
             </h2>
             
             <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl gap-6 border-t border-white/10 pt-8 mt-4">
               <div className="text-white/40 text-xs sm:text-sm font-medium tracking-widest uppercase text-center md:text-left">
                 © {new Date().getFullYear()} Rafa Braga. Todos os direitos reservados.
               </div>
               
               <a 
                 href="https://gabrielcostaluiz.com.br" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="group flex items-center justify-center md:justify-end gap-2 text-white/40 hover:text-white transition-colors text-xs sm:text-sm font-medium tracking-[0.2em] uppercase"
               >
                 <span>Desenvolvido por</span>
                 <span className="text-red-500 font-bold group-hover:text-red-400 transition-colors">Gabriel Costa Luiz</span>
               </a>
             </div>
          </footer>
        </main>
      </div>
    </AudioProvider>
  );
}

