'use client';
import { useEffect, useMemo, useState } from 'react';

const missions = [
  { id:'claim', title:'CLAIM 10 PIXELS', reward:50, icon:'🎯' },
  { id:'return', title:'COME BACK TOMORROW', reward:25, icon:'🔥' },
  { id:'share', title:'SHARE THE BATTLE', reward:100, icon:'📣' },
];

export default function MissionsPage() {
  const today = new Date().toISOString().slice(0,10);
  const [done,setDone] = useState<Record<string,boolean>>({});
  useEffect(() => { try { setDone(JSON.parse(localStorage.getItem(`pixelbattle-missions-${today}`) || '{}')); } catch {} }, [today]);
  const xp = useMemo(() => missions.reduce((n,m)=>n+(done[m.id]?m.reward:0),0),[done]);
  const complete = (id:string) => {
    const next={...done,[id]:true}; setDone(next); localStorage.setItem(`pixelbattle-missions-${today}`,JSON.stringify(next));
    if(id==='share') navigator.clipboard?.writeText('https://pixelbattle-nine.vercel.app');
  };
  return <main style={{minHeight:'100vh',background:'#09090b',color:'#fff',padding:'32px 18px',fontFamily:'Arial,sans-serif'}}><div style={{maxWidth:850,margin:'0 auto'}}>
    <a href="/" style={{color:'#a855f7',textDecoration:'none',fontWeight:800}}>← BACK TO BATTLE</a>
    <h1 style={{fontSize:'clamp(40px,8vw,70px)',margin:'28px 0 6px',fontWeight:900}}>DAILY MISSIONS</h1>
    <p style={{color:'#a1a1aa',fontSize:18}}>Complete today's objectives and build your streak.</p>
    <div style={{margin:'28px 0',padding:22,borderRadius:20,background:'#18181b',border:'1px solid #27272a'}}><b style={{fontSize:22}}>⚡ {xp} XP earned today</b><div style={{height:8,background:'#27272a',borderRadius:9,marginTop:14}}><div style={{height:'100%',width:`${Math.round(xp/175*100)}%`,maxWidth:'100%',background:'#a855f7',borderRadius:9}}/></div></div>
    {missions.map(m=><div key={m.id} style={{display:'flex',alignItems:'center',gap:16,padding:20,margin:'12px 0',borderRadius:18,background:done[m.id]?'#172012':'#18181b',border:`1px solid ${done[m.id]?'#365314':'#27272a'}`}}><span style={{fontSize:30}}>{m.icon}</span><div style={{flex:1}}><b>{m.title}</b><div style={{color:'#a1a1aa',marginTop:5}}>Reward: +{m.reward} XP</div></div><button disabled={done[m.id]} onClick={()=>complete(m.id)} style={{border:0,borderRadius:12,padding:'11px 16px',fontWeight:800,background:done[m.id]?'#365314':'#a855f7',color:'#fff'}}>{done[m.id]?'DONE ✓':'COMPLETE'}</button></div>)}
  </div></main>;
}
