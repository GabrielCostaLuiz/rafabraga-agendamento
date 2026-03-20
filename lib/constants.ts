import { FaInstagram, FaTiktok, FaSpotify, FaYoutube, FaWhatsapp, FaFacebook } from 'react-icons/fa6';
import React from 'react';

export const RAFA_BRAGA_DATA = {
  name: 'RAFA BRAGA',
  tagline: 'Música ao vivo com alma, energia e carisma.',
  aboutSubtitle: 'Música com alma, paixão e uma energia que transcende o palco.',
  bentoSubtitle: 'Da cerimônia ao pagode de mesa: Música para momentos únicos.',
  whatsapp: {
    number: '5511996142927',
    message: 'Olá Rafa! Gostaria de saber mais sobre sua agenda e valores para shows.',
  },
  socials: [
    { 
      label: 'Instagram', 
      name: 'Instagram',
      href: 'https://www.instagram.com/rafabragacantor', 
      icon: React.createElement(FaInstagram, { size: 18 }) 
    },
    { 
      label: 'TikTok', 
      name: 'TikTok',
      href: 'https://www.tiktok.com/@rafabragacantor', 
      icon: React.createElement(FaTiktok, { size: 18 }) 
    },
    { 
      label: 'Spotify', 
      name: 'Spotify',
      href: 'https://open.spotify.com/artist/5XxPfh8njv8xZ2QIUd9H7t', 
      icon: React.createElement(FaSpotify, { size: 18 }) 
    },
    { 
      label: 'YouTube', 
      name: 'YouTube',
      href: 'https://www.youtube.com/@RafaBragaCantor', 
      icon: React.createElement(FaYoutube, { size: 18 }) 
    },
    { 
      label: 'Facebook', 
      name: 'Facebook',
      href: 'https://www.facebook.com/rafasentimento/', 
      icon: React.createElement(FaFacebook, { size: 18 }) 
    },
    { 
      label: 'WhatsApp', 
      name: 'WhatsApp',
      href: 'https://wa.me/5511996142927?text=Olá%20Rafa!%20Gostaria%20de%20saber%20mais%20sobre%20sua%20agenda%20e%20valores%20para%20shows.', 
      icon: React.createElement(FaWhatsapp, { size: 18 }) 
    },
  ],
  navLinks: [
    { label: 'Início', href: '#' },
    { label: 'Agenda', href: '#agenda' },
    { label: 'O que faço', href: '#o-que-faco' },
    { label: 'Spotify', href: '#spotify' },
    { label: 'Contato', href: '#contato' },
  ],
  features: [
    {
      num: '01',
      title: 'VISÃO',
      text: 'Todo show começa com uma intenção clara. Transformo ideias simples na mais pura emoção, garantindo uma performance autêntica e inesquecível.',
    },
    {
      num: '02',
      title: 'ARTE',
      text: 'Os detalhes importam. Do repertório meticuloso à execução final, encaro cada música com a precisão e o cuidado que ela merece.',
    },
    {
      num: '03',
      title: 'CONFIANÇA',
      text: 'Comunicação aberta, pontualidade e o compromisso inabalável de sempre entregar além do prometido.',
    },
    {
      num: '04',
      title: 'ENERGIA',
      text: 'A música deve mover as pessoas. Apresentações que contagiam, construindo momentos de pura conexão e alegria.',
    },
  ],
  stats: [
    // Para o About (4 itens)
    { value: '+500', label: 'Shows realizados' },
    { value: '+20', label: 'Anos de estrada' },
    { value: '100%', label: 'Comprometimento' },
    { value: '∞', label: 'Energia no palco' },
    // Para o Bento (4 itens)
    { value: '+500', label: 'Shows Realizados' },
    { value: '+20', label: 'Anos de estrada' },
    { value: '+80', label: 'Empresas Atendidas' },
    { value: '+1M', label: 'Público Alcançado' },
  ]
};
