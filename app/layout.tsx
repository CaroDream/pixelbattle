import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://pixelbattle-nine.vercel.app'),
  title: 'Pixel Battle — Claim. Battle. Dominate.',
  description: 'Claim your pixel on the global grid. Battle other players. Dominate the map. The ultimate pixel territory war.',
  keywords: ['pixel', 'battle', 'game', 'territory', 'online', 'multiplayer', 'grid', 'pixel art'],
  openGraph: {
    title: 'Pixel Battle — Claim. Battle. Dominate.',
    description: 'Claim your pixel on the global grid. The ultimate pixel territory war!',
    url: 'https://pixelbattle-nine.vercel.app', 
    siteName: 'Pixel Battle',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pixel Battle — Claim. Battle. Dominate.',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixel Battle — Claim. Battle. Dominate.',
    description: 'Claim your pixel on the global grid!',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
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
      <body>{children}</body>
    </html>
  );
}