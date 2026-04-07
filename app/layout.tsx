import { Outfit, Montserrat, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rafa Braga | Samba, Pagode & Eventos Premium",
  description: "Cantor, compositor e instrumentista. Leve a melhor experiência de Samba e Pagode para seu casamento, festa corporativa ou evento. Confira a agenda oficial e peça seu orçamento.",
  keywords: ["Rafa Braga", "Samba", "Pagode", "Evento Corporativo", "Casamento", "Música ao vivo", "São Paulo"],
  authors: [{ name: "Rafa Braga" }],
  openGraph: {
    title: "Rafa Braga | Samba & Pagode de Alto Nível",
    description: "A voz que marca os seus momentos. Shows, casamentos e eventos com o melhor do samba e pagode.",
    url: "https://rafabraga.com.br", // Ajustar para o domínio real se souber
    siteName: "Rafa Braga Oficial",
    images: [
      {
        url: "/rafa-gibli.jpeg",
        width: 1200,
        height: 630,
        alt: "Rafa Braga - Cantor de Samba e Pagode",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rafa Braga | Samba & Pagode",
    description: "Leve a emoção do samba para o seu evento.",
    images: ["/rafa-gibli.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${montserrat.variable} ${dmSans.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://open.spotify.com" />
      </head>
      <meta name="apple-mobile-web-app-title" content="Rafa Braga" />
      <body className="min-h-full flex flex-col font-montserrat" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
