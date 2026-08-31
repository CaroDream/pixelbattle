import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = 'https://pixelbattle-nine.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'PixelBattle — The Global Pixel Territory War',
    template: '%s | PixelBattle',
  },
  description: 'Claim your territory on the global pixel battlefield. Compete with players and countries, climb the leaderboard and defend your pixels.',
  keywords: ['PixelBattle', 'pixel battle', 'pixel war', 'pixel territory war', 'online pixel game', 'territory game', 'multiplayer pixel game', 'pixel art game'],
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: 'PixelBattle — The Global Pixel Territory War',
    description: 'Claim territory. Defend your pixels. Dominate the global battlefield.',
    url: BASE_URL,
    siteName: 'PixelBattle',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'PixelBattle — The Global Pixel Territory War' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PixelBattle — The Global Pixel Territory War',
    description: 'Claim territory. Defend your pixels. Dominate the global battlefield.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico', apple: '/apple-icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#a855f7" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        {children}
        <nav aria-label="PixelBattle navigation" style={{position:'fixed',right:12,bottom:12,zIndex:9999,display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end',maxWidth:'calc(100vw - 24px)'}}>
          <a href="/leaderboard" style={{background:'rgba(24,24,27,.94)',color:'#fff',padding:'8px 11px',borderRadius:10,textDecoration:'none',fontSize:12,fontWeight:800,border:'1px solid #3f3f46',backdropFilter:'blur(8px)'}}>🏆 RANK</a>
          <a href="/teams" style={{background:'rgba(24,24,27,.94)',color:'#fff',padding:'8px 11px',borderRadius:10,textDecoration:'none',fontSize:12,fontWeight:800,border:'1px solid #3f3f46',backdropFilter:'blur(8px)'}}>⚔️ WAR</a>
          <a href="/missions" style={{background:'rgba(24,24,27,.94)',color:'#fff',padding:'8px 11px',borderRadius:10,textDecoration:'none',fontSize:12,fontWeight:800,border:'1px solid #3f3f46',backdropFilter:'blur(8px)'}}>🎯 MISSIONS</a>
          <a href="/share" style={{background:'#a855f7',color:'#fff',padding:'8px 11px',borderRadius:10,textDecoration:'none',fontSize:12,fontWeight:900,boxShadow:'0 4px 18px rgba(168,85,247,.35)'}}>📣 SHARE</a>
        </nav>
      </body>
    </html>
  );
}