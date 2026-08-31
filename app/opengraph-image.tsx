import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Pixel Battle — The Global Pixel Territory War';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '70px', background: '#09090b', color: 'white',
        fontFamily: 'Arial',
      }}>
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 800, color: '#a855f7', marginBottom: 24 }}>
          ⚔️ PIXELBATTLE
        </div>
        <div style={{ display: 'flex', fontSize: 70, fontWeight: 900, lineHeight: 1.05 }}>
          CLAIM. BATTLE. DOMINATE.
        </div>
        <div style={{ display: 'flex', fontSize: 34, color: '#d4d4d8', marginTop: 28 }}>
          The global pixel territory war.
        </div>
        <div style={{ display: 'flex', marginTop: 48, fontSize: 24, color: '#a1a1aa' }}>
          Claim your territory • Defend your pixels • Climb the leaderboard
        </div>
      </div>
    ),
    { ...size }
  );
}
