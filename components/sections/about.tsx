'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

const features = [
  {
    num: '1',
    title: 'VISÃO',
    text: 'Todo show começa com uma intenção clara. Transformo ideias simples na mais pura emoção, garantindo uma performance autêntica e inesquecível para o público.',
  },
  {
    num: '2',
    title: 'ARTE',
    text: 'Os detalhes importam. Do repertório meticuloso à execução final com a banda, encaro cada música com a precisão e o cuidado que ela merece.',
  },
  {
    num: '3',
    title: 'CONFIANÇA',
    text: 'Uma entrega perfeita exige parceria. Comunicação aberta, pontualidade e o compromisso inabalável de sempre entregar além do prometido.',
  },
  {
    num: '4',
    title: 'ENERGIA',
    text: 'A música deve mover as pessoas. Meu foco é criar apresentações que contagiam todos ao redor, construindo momentos de pura conexão e alegria.',
  },
];

function FeatureItem({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
      className="relative flex flex-col items-center text-center w-full"
    >
      {/* Marca d'água do Número */}
      <span className="absolute -top-[50px] md:-top-[60px] left-1/2 -translate-x-1/2 text-[120px] md:text-[150px] font-black text-white/10 select-none leading-none z-0 font-outfit pointer-events-none">
        {num}
      </span>

      {/* Título e Texto */}
      <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white mb-4 relative z-10 font-outfit">
        {title}
      </h3>
      <p className="text-white/50 text-sm leading-relaxed relative z-10 font-sans max-w-[280px]">
        {text}
      </p>
    </motion.div>
  );
}

import SectionHeader from '@/components/section-header';

export default function About() {
  return (
    <section className="relative py-24 md:py-32 px-6 md:px-10 bg-brand-dark overflow-hidden flex flex-col justify-center" id="sobre-mim">

      <div className="absolute top-0 left-0 w-full h-12 bg-linear-to-t from-transparent to-black/30 z-10" />
      
      {/* Header Centralizado */}
      <SectionHeader
        titlePart1="RAFA"
        titlePart2="BRAGA"
        subtitle="A essência e a paixão por trás de cada show."
        className="mb-16 md:mb-24 relative z-10"
      />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 lg:gap-12 items-center">
        
        {/* Coluna 1: Items 1 e 3 */}
        <div className="flex flex-col gap-20 md:gap-32 order-2 md:order-1 items-center justify-center">
          <FeatureItem num={features[0].num} title={features[0].title} text={features[0].text} />
          <FeatureItem num={features[2].num} title={features[2].title} text={features[2].text} />
        </div>

        {/* Coluna 2: A foto central esticada */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
          className="order-1 md:order-2 w-full h-[500px] md:h-[650px] relative rounded-[24px] overflow-hidden shadow-2xl ring-1 ring-white/10"
        >
          {/* Sombra sutil interna */}
          <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/60 z-10 pointer-events-none" />
          
          <Image
            src="/rafa-braga.jpeg"
            alt="Rafa Braga"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </motion.div>

        {/* Coluna 3: Items 2 e 4 */}
        <div className="flex flex-col gap-20 md:gap-32 order-3 md:order-3 items-center justify-center">
          <FeatureItem num={features[1].num} title={features[1].title} text={features[1].text} />
          <FeatureItem num={features[3].num} title={features[3].title} text={features[3].text} />
        </div>

      </div>
    </section>
  );
}
