import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const names: Record<string,string> = { gb:'🇬🇧 UK', us:'🇺🇸 USA', pl:'🇵🇱 POLAND', de:'🇩🇪 GERMANY', fr:'🇫🇷 FRANCE', es:'🇪🇸 SPAIN', it:'🇮🇹 ITALY', nl:'🇳🇱 NETHERLANDS' };

export default async function TeamsPage(){
  const {data}=await supabase.from('Pixels').select('country_flag');
  const counts=new Map<string,number>(); for(const r of data??[]){const c=r.country_flag||'global'; counts.set(c,(counts.get(c)||0)+1);}
  const rows=[...counts.entries()].sort((a,b)=>b[1]-a[1]);
  return <main style={{minHeight:'100vh',background:'#09090b',color:'#fff',padding:'32px 18px',fontFamily:'Arial,sans-serif'}}><div style={{maxWidth:900,margin:'0 auto'}}>
    <a href="/" style={{color:'#a855f7',textDecoration:'none',fontWeight:800}}>← BACK TO BATTLE</a>
    <h1 style={{fontSize:'clamp(38px,8vw,68px)',margin:'28px 0 6px',fontWeight:900}}>COUNTRY WAR</h1>
    <p style={{fontSize:18,color:'#a1a1aa'}}>Pick a side. Recruit your friends. Take the map.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:14,marginTop:28}}>{rows.length?rows.map(([c,n],i)=><div key={c} style={{padding:20,borderRadius:18,background:'#18181b',border:'1px solid #27272a'}}><div style={{fontSize:14,color:'#71717a'}}>RANK #{i+1}</div><h2 style={{margin:'7px 0'}}>{names[c]||'🌍 GLOBAL'}</h2><div style={{fontSize:28,fontWeight:900}}>{n.toLocaleString()} px</div><div style={{height:7,background:'#27272a',borderRadius:9,marginTop:12}}><div style={{height:'100%',width:`${Math.min(100,n/Math.max(...rows.map(x=>x[1]))*100)}%`,background:'#a855f7',borderRadius:9}}/></div></div>):<div style={{padding:24,borderRadius:18,background:'#18181b'}}>No territory has been claimed yet. Be the founding player.</div>}</div>
    <div style={{marginTop:24,padding:22,borderRadius:18,background:'#18181b',border:'1px solid #27272a'}}><h2>⚔️ HOW COUNTRY WARS WORK</h2><p style={{color:'#a1a1aa',lineHeight:1.6}}>Every claimed pixel strengthens its country. Bring friends onto the same side and push your flag up the global ranking.</p></div>
  </div></main>
}
