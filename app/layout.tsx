import type { Metadata } from 'next';
import './globals.css';
import './bright-mobile.css';
import PlayerAccount from './components/PlayerAccount';
import ChatEnhancements from './components/ChatEnhancements';

const BASE_URL = 'https://pixelbattle-nine.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: 'PixelBattle — The Global Pixel Territory War', template: '%s | PixelBattle' },
  description: 'Claim your territory on the global pixel battlefield. Compete with players and countries, climb the leaderboard and defend your pixels.',
  keywords: ['PixelBattle', 'pixel battle', 'pixel war', 'pixel territory war', 'online pixel game', 'territory game', 'multiplayer pixel game', 'pixel art game'],
  alternates: { canonical: BASE_URL },
  openGraph: { title: 'PixelBattle — The Global Pixel Territory War', description: 'Claim territory. Defend your pixels. Dominate the global battlefield.', url: BASE_URL, siteName: 'PixelBattle', images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'PixelBattle — The Global Pixel Territory War' }], locale: 'en_GB', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'PixelBattle — The Global Pixel Territory War', description: 'Claim territory. Defend your pixels. Dominate the global battlefield.', images: ['/opengraph-image'] },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico', apple: '/apple-icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><head>
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#f7fbff" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  </head><body>
    <PlayerAccount />
    <ChatEnhancements />
    {children}
    <nav aria-label="PixelBattle navigation" style={{position:'fixed',right:12,bottom:12,zIndex:9999,display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end',maxWidth:'calc(100vw - 24px)'}}>
      <a href="/teams" style={{background:'#ffffff',color:'#10243e',padding:'8px 11px',borderRadius:10,textDecoration:'none',fontSize:12,fontWeight:800,border:'1px solid #d8e7f5'}}>⚔️ WAR</a>
      <a href="#pixelbattle-chat" style={{background:'#1769ff',color:'#ffffff',padding:'8px 11px',borderRadius:10,textDecoration:'none',fontSize:12,fontWeight:900,border:'1px solid #1769ff'}}>💬 CHAT</a>
      <a href="/leaderboard" style={{background:'#ffffff',color:'#10243e',padding:'8px 11px',borderRadius:10,textDecoration:'none',fontSize:12,fontWeight:800,border:'1px solid #d8e7f5'}}>🏆 RANK</a>
      <a href="/missions" style={{background:'#ffffff',color:'#10243e',padding:'8px 11px',borderRadius:10,textDecoration:'none',fontSize:12,fontWeight:800,border:'1px solid #d8e7f5'}}>🎯 MISSIONS</a>
      <a href="/share" style={{background:'#ff7a18',color:'#ffffff',padding:'8px 11px',borderRadius:10,textDecoration:'none',fontSize:12,fontWeight:900,boxShadow:'0 4px 18px rgba(255,122,24,.25)'}}>📣 SHARE</a>
    </nav>
  </body></html>;
}
