'use client';
import { useState } from 'react';

export default function SharePage(){
 const [copied,setCopied]=useState(false);
 const share=async()=>{const url=window.location.origin; try{if(navigator.share) await navigator.share({title:'PixelBattle',text:'Join me in the global pixel territory war ⚔️',url}); else {await navigator.clipboard.writeText(url);setCopied(true);}}catch{}};
 return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#09090b',color:'#fff',padding:20,fontFamily:'Arial,sans-serif'}}><section style={{width:'min(720px,100%)',padding:'42px 28px',borderRadius:26,background:'linear-gradient(145deg,#27103d,#18181b)',border:'1px solid #7e22ce',textAlign:'center'}}><div style={{fontSize:42}}>⚔️</div><h1 style={{fontSize:'clamp(40px,8vw,70px)',margin:'10px 0',fontWeight:900}}>JOIN THE BATTLE</h1><p style={{fontSize:20,color:'#d4d4d8'}}>Claim your territory. Defend your side. Beat your friends.</p><button onClick={share} style={{marginTop:18,padding:'14px 22px',border:0,borderRadius:14,background:'#a855f7',color:'#fff',fontSize:17,fontWeight:900,cursor:'pointer'}}>{copied?'LINK COPIED ✓':'SHARE PIXELBATTLE'}</button><div style={{marginTop:18}}><a href="/" style={{color:'#c4b5fd'}}>← Back to the battlefield</a></div></section></main>}
