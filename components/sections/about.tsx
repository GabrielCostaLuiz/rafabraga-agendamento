'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { useRef } from 'react';
import SectionHeader from '@/components/section-header';
import { FaWhatsapp } from 'react-icons/fa6';
import { RAFA_BRAGA_DATA } from '@/lib/constants';

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.0, 1.08]);

  const waLink = `https://wa.me/${RAFA_BRAGA_DATA.whatsapp.number}?text=${encodeURIComponent(RAFA_BRAGA_DATA.whatsapp.message)}`;

  return (
    <section
      ref={sectionRef}
      id="sobre-mim"
      className="relative py-24 md:py-36 px-6 md:px-16 bg-brand-dark overflow-hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;1,300&display=swap');

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-12px) rotate(1deg); }
        }
        .float-deco { animation: float-slow 7s ease-in-out infinite; }

        .feature-card:hover .feature-num { opacity: 1; }
        .feature-card:hover .feature-bar { width: 100%; }
      `}</style>

      {/* ── Background details ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-red-600/6 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[300px] bg-red-600/5 blur-[120px] rounded-full" />
        <div
          className="absolute top-[8%] right-[4%] text-[20vw] font-black text-white/[0.025] select-none leading-none pointer-events-none font-outfit"
          aria-hidden
        >
          RB
        </div>
      </div>

      {/* ── Section Header ── */}
      <SectionHeader
        titlePart1="RAFA"
        titlePart2="BRAGA"
        subtitle={RAFA_BRAGA_DATA.aboutSubtitle}
        className="mb-20 md:mb-28 relative z-10"
      />

      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_380px_1fr] gap-12 lg:gap-16 items-start">

        {/* ── Col 1 ── */}
        <div className="flex flex-col gap-10 lg:pt-16 order-2 lg:order-1">
          {[RAFA_BRAGA_DATA.features[0], RAFA_BRAGA_DATA.features[2]].map((f, idx) => (
            <FeatureCard key={f.num} feature={f} delay={idx * 0.1} direction="right" />
          ))}
        </div>

        {/* ── Col 2: Photo ── */}
        <motion.div
          ref={imageRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="order-1 lg:order-2 w-full relative"
        >
          <div className="absolute -inset-[6px] rounded-[28px] border border-white/6 z-0" />
          <div className="absolute -inset-[14px] rounded-[34px] border border-white/3 z-0" />

          <div className="relative w-full h-[480px] md:h-[620px] rounded-[22px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/10 z-10">
            <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
              <Image
                src="/rafa-braga.jpeg"
                alt="Rafa Braga"
                fill
                sizes="(max-width: 768px) 100vw, 380px"
                className="object-cover"
                priority
              />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 z-10 pointer-events-none" />

            {/* Photo Contact info overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-8">
              

               <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-1"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Cantor
                  </p>
                  <p className="text-white font-black text-xl font-outfit leading-none">{RAFA_BRAGA_DATA.name}</p>
                </div>

             
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Col 3 ── */}
        <div className="flex flex-col gap-10 lg:pt-16 order-3">
          {[RAFA_BRAGA_DATA.features[1], RAFA_BRAGA_DATA.features[3]].map((f, idx) => (
            <FeatureCard key={f.num} feature={f} delay={idx * 0.1} direction="left" />
          ))}
        </div>

      </div>

      {/* ── Bottom stats bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-7xl mx-auto mt-20 md:mt-28 relative z-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden ring-1 ring-white/8">
          {RAFA_BRAGA_DATA.stats.slice(0, 4).map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 * i }}
              className="flex flex-col items-center justify-center py-8 px-4 bg-brand-dark text-center"
            >
              <span className="text-3xl md:text-4xl font-black text-white font-outfit leading-none mb-2">
                {stat.value}
              </span>
              <span className="text-[10px] text-white/35 uppercase tracking-[0.3em]"
                style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function FeatureCard({
  feature,
  delay,
  direction,
}: {
  feature: { num: string; title: string; text: string };
  delay: number;
  direction: 'left' | 'right';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === 'right' ? 24 : -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="feature-card group relative p-6 rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 overflow-hidden cursor-default"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <span className="feature-num absolute top-3 right-4 text-[64px] font-black text-white/[0.05] group-hover:text-white/10 transition-colors duration-300 leading-none select-none font-outfit pointer-events-none">
        {feature.num}
      </span>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-5 bg-red-600 rounded-full shrink-0" />
          <h3 className="text-base font-black uppercase tracking-[0.2em] text-white font-outfit">
            {feature.title}
          </h3>
        </div>

        <div className="h-[1px] bg-white/8 mb-4 overflow-hidden rounded-full">
          <div
            className="feature-bar h-full bg-gradient-to-r from-red-600/60 to-red-500/20 transition-all duration-700 ease-out"
            style={{ width: '30%' }}
          />
        </div>

        <p className="text-white/45 text-sm leading-relaxed"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
          {feature.text}
        </p>
      </div>
    </motion.div>
  );
}