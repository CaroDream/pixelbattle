'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Order = { x:number; y:number; color:string; display_text:string; country_flag:string; social_link:string|null; amount_gbp_pence:number; status:string };

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState('pending');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`/api/payment-status?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) { setStatus(data.status || 'pending'); if (data.order) setOrder(data.order); }
      } catch {}
    };
    check();
    const timer = window.setInterval(check, 2500);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [sessionId]);

  const claimed = status === 'paid' && !!order;
  const x = order?.x ?? '?'; const y = order?.y ?? '?';

  function handleCopy() {
    navigator.clipboard.writeText(`I just claimed tile (${x},${y}) on Pixel Battle! ⚔️ ${window.location.origin}`);
    setCopied(true); window.setTimeout(() => setCopied(false), 2000);
  }

  return <div className="min-h-screen bg-[#0e0e18] flex items-center justify-center p-4 text-center">
    <div className="max-w-md w-full">
      <div className="text-7xl mb-6">{claimed ? '🎉' : '⏳'}</div>
      <h1 className="text-4xl font-black text-white mb-2">{claimed ? 'Tile Claimed!' : 'Payment Processing'}</h1>
      <p className="text-gray-400 mb-8 text-lg">{claimed ? `You've successfully claimed tile (${x}, ${y})` : 'Your payment is being verified. This page does not finalize the purchase.'}</p>

      {order && <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
        <div className="flex items-center justify-center gap-5">
          <div className="w-20 h-20 rounded-2xl" style={{ backgroundColor: order.color, boxShadow: `0 0 40px ${order.color}66` }} />
          <div className="text-left"><div className="text-white font-black text-xl">{order.display_text || 'Anonymous'}</div><div className="text-gray-400 text-sm mt-1">Position: ({order.x}, {order.y})</div><div className="text-xs text-gray-500 mt-2">{claimed ? 'Your tile is live on the grid ✅' : 'Waiting for verified payment...'}</div></div>
        </div>
      </div>}

      {claimed && <div className="mb-8"><p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-4">Share your conquest</p><div className="flex gap-3 justify-center"><a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just claimed tile (${x},${y}) on Pixel Battle! ⚔️`)}&url=${encodeURIComponent(window.location.origin)}`} target="_blank" rel="noopener noreferrer" className="bg-black border border-white/10 rounded-xl px-5 py-3 text-white text-sm font-bold">𝕏 Post on X</a><button onClick={handleCopy} className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-sm font-bold">{copied ? '✅ Copied!' : '📋 Copy link'}</button></div></div>}
      <Link href="/" className="inline-block bg-purple-600 rounded-2xl px-10 py-4 font-black text-white text-lg">⚔️ Back to Pixel Battle</Link>
    </div>
  </div>;
}

export default function SuccessPage() { return <Suspense fallback={<div className="min-h-screen bg-[#0e0e18] flex items-center justify-center text-white">Loading...</div>}><SuccessContent /></Suspense>; }
