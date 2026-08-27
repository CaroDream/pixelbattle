'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaidTile {
  x: number;
  y: number;
  color: string;
  displayText: string;
  countryFlag: string;
  socialLink: string | null;
  price: number;
  paid: boolean;
}

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const [tile, setTile] = useState<PaidTile | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [tweetUrl, setTweetUrl] = useState('');

  useEffect(() => {
    setTweetUrl(encodeURIComponent(window.location.origin));
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setError('No payment session was provided.');
      return;
    }

    let cancelled = false;
    async function verify() {
      try {
        const response = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`, {
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Payment could not be verified.');
        if (!cancelled) setTile(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Payment could not be verified.');
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [sessionId]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0e0e18] flex items-center justify-center p-4 text-center">
        <div>
          <div className="text-6xl mb-5">⚠️</div>
          <h1 className="text-3xl font-black text-white mb-3">Payment verification</h1>
          <p className="text-gray-400 mb-7">{error}</p>
          <Link href="/" className="inline-block bg-white/10 border border-white/10 rounded-2xl px-8 py-3 text-white font-bold">
            Back to Pixel Battle
          </Link>
        </div>
      </div>
    );
  }

  if (!tile) {
    return (
      <div className="min-h-screen bg-[#0e0e18] flex items-center justify-center">
        <div className="text-white text-xl">Verifying your payment…</div>
      </div>
    );
  }

  const { x, y, color, displayText, price } = tile;

  function handleCopy() {
    navigator.clipboard.writeText(`I just claimed tile (${x},${y}) on Pixel Battle! ⚔️ ${window.location.origin}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tweetText = encodeURIComponent(`I just claimed tile (${x},${y}) on Pixel Battle! ⚔️`);

  return (
    <div className="min-h-screen bg-[#0e0e18] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle,#a855f7,transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle,#ec4899,transparent 70%)' }} />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        <div className="text-7xl mb-6 animate-bounce">🎉</div>
        <h1 className="text-4xl font-black text-white mb-2">Payment confirmed!</h1>
        <p className="text-gray-400 mb-8 text-lg">Your tile ({x}, {y}) is being made live by the payment webhook.</p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-5">
            <div className="w-20 h-20 rounded-2xl shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 40px ${color}66` }} />
            <div className="text-left">
              <div className="text-white font-black text-xl">{displayText || 'Anonymous'}</div>
              <div className="text-gray-400 text-sm mt-1">Position: ({x}, {y})</div>
              <div className="text-gray-500 text-sm mt-2">Paid: £{price.toFixed(2)}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">Payment verified</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-4">Share your conquest</p>
          <div className="flex gap-3 justify-center">
            <a href={`https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black hover:bg-gray-900 border border-white/10 rounded-xl px-5 py-3 text-white text-sm font-bold transition-all hover:scale-105 active:scale-95">
              𝕏 Post on X
            </a>
            <button onClick={handleCopy} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-5 py-3 text-white text-sm font-bold transition-all hover:scale-105 active:scale-95">
              {copied ? '✅ Copied!' : '📋 Copy link'}
            </button>
          </div>
        </div>

        <Link href="/" className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 rounded-2xl px-10 py-4 font-black text-white text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/30">
          ⚔️ Claim More Tiles
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0e0e18] flex items-center justify-center"><div className="text-white text-xl">Loading…</div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
