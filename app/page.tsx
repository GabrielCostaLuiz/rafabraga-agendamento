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
import Footer from "@/components/footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  
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
    },
    {
      node: "/logo-loop/johnsons_logo.png",
      title: "Johnsons"
    },
{
      node: "/logo-loop/long_logo.png",
      title: "Long Island"
    },{
      node: "/logo-loop/bar_logo.png",
      title: "Bar Mooca"
    },
  ];

  return (
    <AudioProvider>
      <div className="relative w-full bg-brand-dark text-white font-sans flex flex-col">
        {/* Dock Lateral Social */}
        <SocialDock />

        {/* Componente Header Unificado */}
        <Header
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
          <Agenda />

          {/* Seção Bento Grid — O que eu faço */}
          <BentoServices />

          {/* Seção do Spotify */}
          <SpotifySection />

          <About />

          <Contact/>
        
          <FloatingAudioPlayer />

          <Footer/>
        </main>
      </div>
    </AudioProvider>
  );
}

