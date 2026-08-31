'use client';

import { useEffect, useState } from 'react';
import { createClient, type User } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function PlayerAccount() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username: string; xp: number; battles_won: number; pixels_claimed: number; country_flag: string } | null>(null);
  const [email, setEmail] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(true);

  const loadProfile = async (u: User) => {
    const { data } = await supabase.from('player_profiles').select('username,xp,battles_won,pixels_claimed,country_flag').eq('player_id', u.id).maybeSingle();
    setProfile(data ?? null);
  };

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      let { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        const result = await supabase.auth.signInAnonymously({ options: { data: { username: `Player-${Math.random().toString(36).slice(2, 8).toUpperCase()}` } } });
        session = result.data.session;
      }
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user);
      }
      setBusy(false);
    };
    boot();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) await loadProfile(session.user);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`profile-${user.id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'player_profiles', filter: `player_id=eq.${user.id}` }, payload => setProfile(payload.new as any)).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const saveAccount = async () => {
    if (!email.includes('@')) { setMessage('Enter a valid email address.'); return; }
    setMessage('Sending verification link…');
    const { error } = await supabase.auth.updateUser({ email });
    if (error) setMessage(error.message);
    else setMessage('Check your email. Your progress stays attached to this account.');
  };

  const level = Math.floor((profile?.xp ?? 0) / 100) + 1;
  const next = level * 100;
  const permanent = user ? !user.is_anonymous : false;

  if (busy) return null;

  return <>
    <div style={{ position:'fixed', top:12, left:12, zIndex:10000, display:'flex', alignItems:'center', gap:8, background:'rgba(10,10,18,.92)', border:'1px solid rgba(255,255,255,.16)', borderRadius:14, padding:'8px 10px', color:'#fff', boxShadow:'0 8px 30px rgba(0,0,0,.35)', backdropFilter:'blur(12px)' }}>
      <span style={{fontSize:18}}>👤</span>
      <div style={{lineHeight:1.05}}><strong style={{fontSize:12}}>{profile?.username ?? 'Player'}</strong><div style={{fontSize:10,color:'#c4b5fd'}}>LVL {level} · {profile?.xp ?? 0} XP</div></div>
      {!permanent && <button onClick={()=>setShowSave(true)} style={{border:0,borderRadius:9,padding:'7px 9px',fontSize:11,fontWeight:900,cursor:'pointer',background:'#f59e0b',color:'#111827'}}>SAVE PROGRESS</button>}
    </div>
    {showSave && <div style={{position:'fixed',inset:0,zIndex:11000,display:'grid',placeItems:'center',padding:20,background:'rgba(0,0,0,.72)'}}>
      <div style={{width:'min(440px,100%)',background:'#11111b',border:'1px solid #3b3b50',borderRadius:22,padding:24,color:'#fff',boxShadow:'0 25px 80px rgba(0,0,0,.6)'}}>
        <div style={{fontSize:34}}>🛡️</div><h2 style={{margin:'8px 0'}}>Save your progress</h2>
        <p style={{color:'#b8b8c7',lineHeight:1.5}}>Your current progress is attached to a temporary account. Add your email now so you can recover your player, XP, battles and pixels on another device.</p>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" style={{width:'100%',boxSizing:'border-box',padding:13,borderRadius:12,border:'1px solid #3b3b50',background:'#09090f',color:'#fff',margin:'10px 0'}} />
        <button onClick={saveAccount} style={{width:'100%',padding:13,border:0,borderRadius:12,fontWeight:900,background:'#a855f7',color:'#fff',cursor:'pointer'}}>SECURE MY ACCOUNT</button>
        <button onClick={()=>setShowSave(false)} style={{width:'100%',padding:10,border:0,background:'transparent',color:'#9ca3af',cursor:'pointer'}}>Maybe later</button>
        {message && <div style={{marginTop:8,fontSize:13,color:'#d8b4fe'}}>{message}</div>}
      </div>
    </div>}
  </>;
}
