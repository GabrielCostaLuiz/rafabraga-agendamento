"use client";

import React from 'react';

interface NavLink {
  label: string;
  href: string;
}

interface HeaderProps {
  logo?: string;
  leftLinks?: NavLink[];
  rightLinks?: NavLink[];
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  logo = "R—B",
  leftLinks = [
    { label: "sobre rb", href: "#" },
    { label: "spotify", href: "#" }
  ],
  rightLinks = [
    { label: "fotos", href: "#" },
    { label: "contato", href: "#" }
  ],
  className = ""
}) => {
  return (
    <header className={`absolute z-50 w-full px-6 md:px-16 py-6 md:py-10 uppercase text-[9px] md:text-[10px] tracking-[0.2em] font-medium text-white/50 ${className}`}>
      <nav className="flex justify-between items-center w-full max-w-7xl mx-auto">
        {/* Lado Esquerdo - Oculto/Simplificado em mobile se necessário */}
        <div className="hidden md:flex gap-8 lg:gap-16 flex-1 justify-start">
          {leftLinks.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        {/* Espaçador para manter o logo centralizado no mobile */}
        <div className="flex-1 md:hidden" />

        {/* Logo - Sempre centralizado */}
        <div className="flex-1 md:flex-none flex justify-center text-white text-lg font-bold tracking-normal">
          {logo}
        </div>

        {/* Lado Direito */}
        <div className="hidden md:flex gap-8 lg:gap-16 flex-1 justify-end">
          {rightLinks.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        {/* Espaçador para manter o logo centralizado no mobile */}
        <div className="flex-1 md:hidden" />
      </nav>
    </header>
  );
};

export default Header;
