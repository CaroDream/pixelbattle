import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const flags: Record<string, string> = { gb: '🇬🇧', us: '🇺🇸', pl: '🇵🇱', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', it: '🇮🇹', nl: '🇳🇱', ca: '🇨🇦', au: '🇦🇺' };

export default async function LeaderboardPage() {
  const { data } = await supabase.from('Pixels').select('owner_name,country_flag');
  const countries = new Map<string, number>();
  const players = new Map<string, { country: string; pixels: number }>();
  for (const row of data ?? []) {
    const country = row.country_flag || 'global';
    countries.set(country, (countries.get(country) ?? 0) + 1);
    if (row.owner_name) {
      const p = players.get(row.owner_name) ?? { country, pixels: 0 };
      p.pixels += 1;
      players.set(row.owner_name, p);
    }
  }
  const countryRows = [...countries.entries()].sort((a,b) => b[1]-a[1]).slice(0, 20);
  const playerRows = [...players.entries()].sort((a,b) => b[1].pixels-a[1].pixels).slice(0, 20);

  return (
    <main style={{ minHeight:'100vh', background:'#09090b', color:'#fff', padding:'32px 18px', fontFamily:'Arial,sans-serif' }}>
      <div style={{ maxWidth:1000, margin:'0 auto' }}>
        <a href="/" style={{ color:'#a855f7', textDecoration:'none', fontWeight:800 }}>← BACK TO BATTLE</a>
        <h1 style={{ fontSize:'clamp(36px,7vw,64px)', margin:'28px 0 8px', fontWeight:900 }}>LEADERBOARD</h1>
        <p style={{ color:'#a1a1aa', fontSize:18 }}>Who controls the battlefield right now?</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20, marginTop:28 }}>
          <section style={{ background:'#18181b', border:'1px solid #27272a', borderRadius:20, padding:22 }}>
            <h2 style={{ marginTop:0 }}>🌍 COUNTRIES</h2>
            {countryRows.length === 0 && <p style={{ color:'#71717a' }}>The war has not started yet. Be first.</p>}
            {countryRows.map(([country,count],i) => <div key={country} style={{ display:'flex', justifyContent:'space-between', padding:'13px 0', borderBottom:'1px solid #27272a' }}><span><b>#{i+1}</b> &nbsp;{flags[country] ?? '🌍'} {country.toUpperCase()}</span><strong>{count.toLocaleString()}</strong></div>)}
          </section>
          <section style={{ background:'#18181b', border:'1px solid #27272a', borderRadius:20, padding:22 }}>
            <h2 style={{ marginTop:0 }}>👑 PLAYERS</h2>
            {playerRows.length === 0 && <p style={{ color:'#71717a' }}>No ranked players yet. Claim a pixel to enter.</p>}
            {playerRows.map(([name,p],i) => <div key={name} style={{ display:'flex', justifyContent:'space-between', padding:'13px 0', borderBottom:'1px solid #27272a' }}><span><b>#{i+1}</b> &nbsp;{name}</span><strong>{p.pixels.toLocaleString()} px</strong></div>)}
          </section>
        </div>
        <div style={{ marginTop:24, padding:22, borderRadius:20, background:'linear-gradient(135deg,#3b0764,#18181b)', border:'1px solid #7e22ce' }}>
          <h2 style={{ margin:'0 0 8px' }}>⚔️ YOUR COUNTRY NEEDS YOU</h2>
          <p style={{ color:'#d4d4d8' }}>Claim territory, recruit friends and push your country up the table.</p>
          <a href="/" style={{ display:'inline-block', marginTop:8, background:'#a855f7', color:'#fff', padding:'12px 18px', borderRadius:12, textDecoration:'none', fontWeight:800 }}>JOIN THE BATTLE →</a>
        </div>
      </div>
    </main>
  );
}
