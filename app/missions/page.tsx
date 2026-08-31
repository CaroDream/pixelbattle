'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const missions = [
  { id:'claim', title:'CLAIM 10 PIXELS', reward:50, icon:'🎯' },
  { id:'return', title:'COME BACK TOMORROW', reward:25, icon:'🔥' },
  { id:'share', title:'SHARE THE BATTLE', reward:100, icon:'📣' },
];

export default function MissionsPage() {
  const [done,setDone] = useState<Record<string,boolean>>({});
  const [xp,setXp] = useState(0);
  const [ready,setReady] = useState(false);
  const [error,setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError('Your player account is still loading. Refresh and try again.'); return; }
      const [{ data: profile }, { data: completed }] = await Promise.all([
        supabase.from('player_profiles').select('xp').eq('player_id',user.id).maybeSingle(),
        supabase.from('mission_completions').select('mission_id').eq('player_id',user.id).eq('mission_date',new Date().toISOString().slice(0,10)),
      ]);
      if (!mounted) return;
      setXp(profile?.xp ?? 0);
      setDone(Object.fromEntries((completed ?? []).map(row => [row.mission_id,true])));
      setReady(true);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const complete = async (missionId:string,reward:number) => {
    setError('');
    const { data, error: rpcError } = await supabase.rpc('complete_mission',{p_mission_id:missionId,p_reward_xp:reward});
    if (rpcError) { setError('Could not save this mission. Please try again.'); return; }
    const result = data as {awarded?:boolean};
    if (result?.awarded) { setDone(prev=>({...prev,[missionId]:true})); setXp(prev=>prev+reward); }
    if (missionId==='share') {
      await navigator.clipboard?.writeText('https://pixelbattle-nine.vercel.app');
    }
  };

  const todayXp = missions.reduce((n,m)=>n+(done[m.id]?m.reward:0),0);
  const level = Math.floor(xp/100)+1;

  return <main style={{minHeight:'100vh',background:'#10101a',color:'#fff',padding:'80px 18px 40px',fontFamily:'Arial,sans-serif'}}><div style={{maxWidth:850,margin:'0 auto'}}>
    <a href="/" style={{color:'#fbbf24',textDecoration:'none',fontWeight:800}}>← BACK TO BATTLE</a>
    <h1 style={{fontSize:'clamp(40px,8vw,70px)',margin:'28px 0 6px',fontWeight:900,letterSpacing:'-2px'}}>DAILY MISSIONS</h1>
    <p style={{color:'#b9b9c8',fontSize:18}}>Small objectives. Permanent progress. Come back tomorrow.</p>
    <div style={{margin:'28px 0',padding:22,borderRadius:20,background:'linear-gradient(135deg,#1d1730,#14141f)',border:'1px solid #4c3b72'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><b style={{fontSize:22}}>⚡ {xp} XP · LEVEL {level}</b><span style={{color:'#fbbf24'}}>+{todayXp} XP today</span></div>
      <div style={{height:9,background:'#29293a',borderRadius:9,marginTop:14,overflow:'hidden'}}><div style={{height:'100%',width:`${xp%100}%`,background:'linear-gradient(90deg,#f59e0b,#fbbf24)',borderRadius:9}}/></div>
      <small style={{display:'block',marginTop:8,color:'#8f8fa2'}}>{100-(xp%100)} XP to next level</small>
    </div>
    {!ready && !error && <p style={{color:'#9ca3af'}}>Loading your saved progress…</p>}
    {error && <div style={{padding:14,borderRadius:12,background:'#32171d',border:'1px solid #7f1d1d',color:'#fecaca',marginBottom:12}}>{error}</div>}
    {missions.map(m=><div key={m.id} style={{display:'flex',alignItems:'center',gap:16,padding:20,margin:'12px 0',borderRadius:18,background:done[m.id]?'#142217':'#181824',border:`1px solid ${done[m.id]?'#365314':'#303047'}`}}><span style={{fontSize:30}}>{m.icon}</span><div style={{flex:1}}><b>{m.title}</b><div style={{color:'#a8a8b8',marginTop:5}}>Reward: +{m.reward} XP · saved to your account</div></div><button disabled={!ready || done[m.id]} onClick={()=>complete(m.id,m.reward)} style={{border:0,borderRadius:12,padding:'11px 16px',fontWeight:800,background:done[m.id]?'#365314':'#f59e0b',color:done[m.id]?'#fff':'#111827',cursor:done[m.id]?'default':'pointer'}}>{done[m.id]?'DONE ✓':'COMPLETE'}</button></div>)}
    <div style={{marginTop:24,color:'#77778a',fontSize:13}}>Progress is stored server-side against your PixelBattle account — not in browser local storage.</div>
  </div></main>;
}
