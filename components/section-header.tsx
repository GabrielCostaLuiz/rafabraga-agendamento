import React from 'react';

interface SectionHeaderProps {
  titlePart1: string;
  titlePart2: string;
  subtitle: string;
  barColorClass?: string;
  highlightColorClass?: string;
  className?: string;
}

export default function SectionHeader({
  titlePart1,
  titlePart2,
  subtitle,
  barColorClass = "bg-red-500",
  highlightColorClass = "text-red-500/80",
  className = "mb-16 relative z-10",
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className={`w-12 h-1 mb-6 ${barColorClass}`} />
      <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tight mb-4 leading-none font-outfit">
        {titlePart1} <br />
        <span className={highlightColorClass}>{titlePart2}</span>
      </h2>
      <p className="text-white/40 max-w-lg text-sm md:text-[1rem] leading-relaxed uppercase tracking-[0.2em] font-sans px-4">
        {subtitle}
      </p>
    </div>
  );
}
