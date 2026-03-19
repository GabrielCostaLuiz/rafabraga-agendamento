'use client';

import { useTransform, motion, useScroll, MotionValue } from 'motion/react';
import { useRef } from 'react';
import Image from 'next/image';

const projects = [
  {
    title: 'Samba & Pagode ao Vivo',
    description: 'O melhor do samba e pagode, com a energia e carisma únicos do Rafa Braga. Perfeito para festas que pedem alegria e interação.',
    src: '/samba-show.png',
    color: '#1a181b', // Tons escuros pra manter a elegância
  },
  {
    title: 'Momentos Inesquecíveis',
    description: 'Música ao vivo personalizada para casamentos. Do acústico na cerimônia à festa completa, transformamos seu sonho em melodia.',
    src: '/casamento.png',
    color: '#1f1c21',
  },
  {
    title: 'Eventos & Confraternizações',
    description: 'Profissionalismo e descontração para o seu evento corporativo. Adaptamos o repertório para o perfil e energia da sua empresa.',
    src: '/corporativo.png',
    color: '#252126',
  },
  {
    title: 'Estrutura Premium',
    description: 'Equipamentos de alta tecnologia em som e iluminação. Cuidamos de toda a parte técnica para você focar apenas em aproveitar.',
    src: '/estrutura.png',
    color: '#2a262c',
  },
];

export default function StackingCards() {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={container} className="relative mt-20">
      <div className="flex flex-col items-center mb-10 text-center px-6">
        <div className="w-12 h-1 bg-red-500 mb-6" />
        <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tight mb-4 leading-none font-outfit">
          O QUE <br />
          <span className="text-red-500/80">EU FAÇO</span>
        </h2>
        <p className="text-white/40 max-w-xl text-sm md:text-md uppercase tracking-[0.2em] font-sans">
          Da cerimônia ao pagode de mesa: Música ranhosa para momentos únicos.
        </p>
      </div>

      <section className="text-white w-full">
        {projects.map((project, i) => {
          const targetScale = 1 - (projects.length - i) * 0.05;
          return (
            <Card
              key={`p_${i}`}
              i={i}
              url={project.src}
              title={project.title}
              color={project.color}
              description={project.description}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </section>
    </div>
  );
}

interface CardProps {
  i: number;
  title: string;
  description: string;
  url: string;
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

export const Card: React.FC<CardProps> = ({
  i,
  title,
  description,
  url,
  color,
  progress,
  range,
  targetScale,
}) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="h-screen flex items-center justify-center sticky top-0"
    >
      <motion.div
        style={{
          backgroundColor: color,
          scale,
          top: `calc(-5vh + ${i * 20}px)`,
        }}
        className="flex flex-col relative h-[400px] md:h-[60vh] w-[90%] md:w-[70%] rounded-[30px] lg:p-12 sm:p-6 p-4 origin-top shadow-2xl border border-white/5"
      >
        <div className="flex flex-col md:flex-row h-full gap-8 md:gap-10">
          <div className="flex-1 md:w-[45%] flex flex-col justify-center">
            <h2 className="text-3xl md:text-[2.5rem] font-bold uppercase tracking-tighter mb-4 font-outfit">{title}</h2>
            <p className="text-white/70 text-sm md:text-lg leading-relaxed font-sans">
              {description}
            </p>
     
          </div>

          <div className="relative w-full md:w-[55%] h-[200px] md:h-full rounded-2xl overflow-hidden shadow-2xl">
            <motion.div
              className="w-full h-full"
              style={{ scale: imageScale }}
            >
              <Image 
                fill 
                src={url} 
                alt={title} 
                className="object-cover" 
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>


    </div>
  );
}
