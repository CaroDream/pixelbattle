export const metadata = { title: 'How to Play PixelBattle — Global Pixel Territory War', description: 'Learn how to claim pixels, build territory, compete for the leaderboard and recruit your country in PixelBattle.' };

export default function HowToPlay(){return <main style={{minHeight:'100vh',background:'#09090b',color:'#fff',padding:'32px 18px',fontFamily:'Arial,sans-serif'}}><article style={{maxWidth:850,margin:'0 auto',lineHeight:1.65}}>
<a href="/" style={{color:'#a855f7',textDecoration:'none',fontWeight:800}}>← PLAY PIXELBATTLE</a>
<h1 style={{fontSize:'clamp(38px,8vw,68px)',lineHeight:1,margin:'28px 0 14px',fontWeight:900}}>THE GLOBAL PIXEL TERRITORY WAR</h1>
<p style={{fontSize:21,color:'#d4d4d8'}}>PixelBattle is a simple idea: claim territory, defend your side and make your mark on a shared global battlefield.</p>
{[['1. CLAIM','Choose a pixel on the global grid and make it yours.'],['2. BUILD','Every pixel adds to your territory and your country’s total.'],['3. COMPETE','Watch the leaderboard and fight for a higher position.'],['4. RECRUIT','Send your battle link to friends and grow your side.'],['5. RETURN','Daily missions, rankings and live territory changes give you a reason to come back.']].map(([h,p])=><section key={h} style={{marginTop:24,padding:22,borderRadius:18,background:'#18181b',border:'1px solid #27272a'}}><h2 style={{marginTop:0}}>{h}</h2><p style={{marginBottom:0,color:'#a1a1aa'}}>{p}</p></section>)}
<div style={{marginTop:28}}><a href="/leaderboard" style={{display:'inline-block',padding:'13px 18px',borderRadius:12,background:'#a855f7',color:'#fff',fontWeight:800,textDecoration:'none'}}>VIEW LEADERBOARD →</a></div>
</article></main>}
