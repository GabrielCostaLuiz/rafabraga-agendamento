'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

interface BentoItem {
  title: string;
  description: string;
  image: string;
  gridClass: string;
  cta?: string;
}

const services: BentoItem[] = [
  {
    title: 'Samba & Pagode ao Vivo',
    description:
      'O melhor do samba e pagode com a energia e carisma únicos do Rafa Braga. Shows completos com banda, repertório personalizado e muita interação com o público.',
    image: '/services/samba-show.png',
    gridClass: 'md:col-span-2 md:row-span-2',
    cta: 'Agendar Show',
  },
  {
    title: 'Casamentos',
    description:
      'Do acústico na cerimônia à festa completa. Transformamos seu sonho em melodia.',
    image: '/services/casamento.png',
    gridClass: 'md:col-span-1 md:row-span-1',
    cta: 'Saiba Mais',
  },
  {
    title: 'Estrutura Premium',
    description:
      'Som e iluminação de alta tecnologia. Cuidamos de toda a parte técnica.',
    image: '/services/estrutura.png',
    gridClass: 'md:col-span-1 md:row-span-1',
    cta: 'Ver Equipagem',
  },
  {
    title: 'Eventos Corporativos',
    description:
      'Profissionalismo e descontração para confraternizações, convenções e festas empresariais.',
    image: '/services/corporativo.png',
    gridClass: 'md:col-span-1 md:row-span-1',
    cta: 'Contratar',
  },
];

const stats = [
  { value: '+500', label: 'Shows Realizados' },
  { value: '+20', label: 'Anos de Palco' },
  { value: '+200', label: 'Casamentos' },
  { value: '+50', label: 'Empresas Atendidas' },
];

function BentoCard({ item, index }: { item: BentoItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`group relative overflow-hidden rounded-3xl ${item.gridClass} min-h-[380px] md:min-h-0 cursor-pointer`}
    >
      {/* Imagem de fundo */}
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] md:group-hover:scale-110"
      />

      {/* Overlay gradiente - Mais escuro no bottom para legibilidade da fonte */}
      <div className="absolute inset-0 bg-black/20 md:bg-transparent transition-colors duration-500 md:group-hover:bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 h-4/5 md:h-2/3 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-90 transition-opacity duration-500" />

      {/* Conteúdo */}
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end z-10">
        
        {/* Título — Fica embaixo em repouso. Quando a descrição expande, ele é empurrado pra cima naturalmente */}
        <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight font-outfit text-white drop-shadow-lg">
          {item.title}
        </h3>

        {/* CSS Trick para Animação de Altura (0 to Auto) */}
        <div className="grid grid-rows-[1fr] md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">
          <div className="overflow-hidden">
            {/* O padding top aqui afasta a descrição do título */}
            <div className="pt-3 md:pt-4 flex flex-col gap-4">
              <p className="text-white/80 text-sm md:text-base leading-relaxed font-sans max-w-md md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 md:delay-100">
                {item.description}
              </p>
              
              {item.cta && (
                <span className="self-start text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-red-400 flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 md:delay-150">
                  {item.cta}
                  <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
                    <path
                      d="M15.354 4.354a.5.5 0 000-.708L12.172.464a.5.5 0 10-.708.708L14.293 4l-2.829 2.828a.5.5 0 10.708.708l3.182-3.182zM0 4.5h15v-1H0v1z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Borda sutil */}
      <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all duration-500 z-20" />
    </motion.div>
  );
}

function StatsBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="relative flex flex-col justify-center overflow-hidden rounded-3xl md:col-span-2 h-full bg-linear-to-br from-red-500/10 via-brand-dark to-brand-dark ring-1 ring-inset ring-white/5 p-8 md:p-10"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <span className="text-4xl md:text-5xl font-black font-outfit text-white mb-1">
              {stat.value}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 font-sans">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

import SectionHeader from '@/components/section-header';

export default function BentoServices() {
  return (
    <section className="relative py-24 px-6 md:px-20" id="o-que-faco">
      
      {/* Header Centralizado */}
      <SectionHeader
        titlePart1="O QUE"
        titlePart2="EU FAÇO"
        subtitle="Da cerimônia ao pagode de mesa: Música para momentos únicos."
        className="mb-16 relative z-10"
      />

      {/* Bento Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[250px] mb-12">
        {services.map((item, i) => (
          <BentoCard key={i} item={item} index={i} />
        ))}
        <StatsBlock />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-12 bg-linear-to-t from-black/30 to-transparent z-10" />
    </section>
  );
}
