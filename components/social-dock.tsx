"use client";

import { RAFA_BRAGA_DATA } from '@/lib/constants';

const SocialDock = () => {
  const socials = RAFA_BRAGA_DATA.socials.filter(s => s.label !== 'WhatsApp');

  return (
    <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-60 hidden lg:flex flex-col gap-4 p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
      {socials.map((social) => (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300 group"
          aria-label={social.name}
        >
          {social.icon}
          {/* Tooltip opcional */}
          <span className="absolute left-16 bg-white text-black text-[10px] font-bold py-1 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest whitespace-nowrap">
            {social.name}
          </span>
        </a>
      ))}
    </aside>
  );
};

export default SocialDock;
