'use client';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GRID_COLS = 50;
const GRID_ROWS = 50;
const TILE_SIZE = 32;
const PRICES = [0.49, 0.99, 1.99, 2.99];
const MAX_URL_LENGTH = 2048;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

const COUNTRIES = [
  { name: 'Global', code: 'global' }, { name: 'Afghanistan', code: 'af' }, { name: 'Albania', code: 'al' },
  { name: 'Algeria', code: 'dz' }, { name: 'Andorra', code: 'ad' }, { name: 'Angola', code: 'ao' },
  { name: 'Argentina', code: 'ar' }, { name: 'Armenia', code: 'am' }, { name: 'Australia', code: 'au' },
  { name: 'Austria', code: 'at' }, { name: 'Azerbaijan', code: 'az' }, { name: 'Bahamas', code: 'bs' },
  { name: 'Bahrain', code: 'bh' }, { name: 'Bangladesh', code: 'bd' }, { name: 'Barbados', code: 'bb' },
  { name: 'Belarus', code: 'by' }, { name: 'Belgium', code: 'be' }, { name: 'Belize', code: 'bz' },
  { name: 'Benin', code: 'bj' }, { name: 'Bhutan', code: 'bt' }, { name: 'Bolivia', code: 'bo' },
  { name: 'Bosnia and Herzegovina', code: 'ba' }, { name: 'Botswana', code: 'bw' }, { name: 'Brazil', code: 'br' },
  { name: 'Brunei', code: 'bn' }, { name: 'Bulgaria', code: 'bg' }, { name: 'Burkina Faso', code: 'bf' },
  { name: 'Burundi', code: 'bi' }, { name: 'Cambodia', code: 'kh' }, { name: 'Cameroon', code: 'cm' },
  { name: 'Canada', code: 'ca' }, { name: 'Central African Republic', code: 'cf' }, { name: 'Chad', code: 'td' },
  { name: 'Chile', code: 'cl' }, { name: 'China', code: 'cn' }, { name: 'Colombia', code: 'co' },
  { name: 'Congo', code: 'cg' }, { name: 'Costa Rica', code: 'cr' }, { name: 'Croatia', code: 'hr' },
  { name: 'Cuba', code: 'cu' }, { name: 'Cyprus', code: 'cy' }, { name: 'Czech Republic', code: 'cz' },
  { name: 'Denmark', code: 'dk' }, { name: 'Dominican Republic', code: 'do' }, { name: 'Ecuador', code: 'ec' },
  { name: 'Egypt', code: 'eg' }, { name: 'El Salvador', code: 'sv' }, { name: 'Estonia', code: 'ee' },
  { name: 'Ethiopia', code: 'et' }, { name: 'Fiji', code: 'fj' }, { name: 'Finland', code: 'fi' },
  { name: 'France', code: 'fr' }, { name: 'Georgia', code: 'ge' }, { name: 'Germany', code: 'de' },
  { name: 'Ghana', code: 'gh' }, { name: 'Greece', code: 'gr' }, { name: 'Guatemala', code: 'gt' },
  { name: 'Guinea', code: 'gn' }, { name: 'Haiti', code: 'ht' }, { name: 'Honduras', code: 'hn' },
  { name: 'Hungary', code: 'hu' }, { name: 'Iceland', code: 'is' }, { name: 'India', code: 'in' },
  { name: 'Indonesia', code: 'id' }, { name: 'Iran', code: 'ir' }, { name: 'Iraq', code: 'iq' },
  { name: 'Ireland', code: 'ie' }, { name: 'Israel', code: 'il' }, { name: 'Italy', code: 'it' },
  { name: 'Jamaica', code: 'jm' }, { name: 'Japan', code: 'jp' }, { name: 'Jordan', code: 'jo' },
  { name: 'Kazakhstan', code: 'kz' }, { name: 'Kenya', code: 'ke' }, { name: 'Kuwait', code: 'kw' },
  { name: 'Kyrgyzstan', code: 'kg' }, { name: 'Laos', code: 'la' }, { name: 'Latvia', code: 'lv' },
  { name: 'Lebanon', code: 'lb' }, { name: 'Libya', code: 'ly' }, { name: 'Lithuania', code: 'lt' },
  { name: 'Luxembourg', code: 'lu' }, { name: 'Madagascar', code: 'mg' }, { name: 'Malawi', code: 'mw' },
  { name: 'Malaysia', code: 'my' }, { name: 'Maldives', code: 'mv' }, { name: 'Mali', code: 'ml' },
  { name: 'Malta', code: 'mt' }, { name: 'Mauritania', code: 'mr' }, { name: 'Mauritius', code: 'mu' },
  { name: 'Mexico', code: 'mx' }, { name: 'Moldova', code: 'md' }, { name: 'Monaco', code: 'mc' },
  { name: 'Mongolia', code: 'mn' }, { name: 'Montenegro', code: 'me' }, { name: 'Morocco', code: 'ma' },
  { name: 'Mozambique', code: 'mz' }, { name: 'Myanmar', code: 'mm' }, { name: 'Namibia', code: 'na' },
  { name: 'Nepal', code: 'np' }, { name: 'Netherlands', code: 'nl' }, { name: 'New Zealand', code: 'nz' },
  { name: 'Nicaragua', code: 'ni' }, { name: 'Niger', code: 'ne' }, { name: 'Nigeria', code: 'ng' },
  { name: 'North Macedonia', code: 'mk' }, { name: 'Norway', code: 'no' }, { name: 'Oman', code: 'om' },
  { name: 'Pakistan', code: 'pk' }, { name: 'Panama', code: 'pa' }, { name: 'Papua New Guinea', code: 'pg' },
  { name: 'Paraguay', code: 'py' }, { name: 'Peru', code: 'pe' }, { name: 'Philippines', code: 'ph' },
  { name: 'Poland', code: 'pl' }, { name: 'Portugal', code: 'pt' }, { name: 'Qatar', code: 'qa' },
  { name: 'Romania', code: 'ro' }, { name: 'Russia', code: 'ru' }, { name: 'Rwanda', code: 'rw' },
  { name: 'Saudi Arabia', code: 'sa' }, { name: 'Senegal', code: 'sn' }, { name: 'Serbia', code: 'rs' },
  { name: 'Singapore', code: 'sg' }, { name: 'Slovakia', code: 'sk' }, { name: 'Slovenia', code: 'si' },
  { name: 'Somalia', code: 'so' }, { name: 'South Africa', code: 'za' }, { name: 'South Sudan', code: 'ss' },
  { name: 'Spain', code: 'es' }, { name: 'Sri Lanka', code: 'lk' }, { name: 'Sudan', code: 'sd' },
  { name: 'Suriname', code: 'sr' }, { name: 'Sweden', code: 'se' }, { name: 'Switzerland', code: 'ch' },
  { name: 'Syria', code: 'sy' }, { name: 'Taiwan', code: 'tw' }, { name: 'Tajikistan', code: 'tj' },
  { name: 'Tanzania', code: 'tz' }, { name: 'Thailand', code: 'th' }, { name: 'Timor-Leste', code: 'tl' },
  { name: 'Togo', code: 'tg' }, { name: 'Tonga', code: 'to' }, { name: 'Trinidad and Tobago', code: 'tt' },
  { name: 'Tunisia', code: 'tn' }, { name: 'Turkey', code: 'tr' }, { name: 'Turkmenistan', code: 'tm' },
  { name: 'Uganda', code: 'ug' }, { name: 'Ukraine', code: 'ua' }, { name: 'United Arab Emirates', code: 'ae' },
  { name: 'United Kingdom', code: 'gb' }, { name: 'United States', code: 'us' }, { name: 'Uruguay', code: 'uy' },
  { name: 'Uzbekistan', code: 'uz' }, { name: 'Vanuatu', code: 'vu' }, { name: 'Venezuela', code: 've' },
  { name: 'Vietnam', code: 'vn' }, { name: 'Yemen', code: 'ye' }, { name: 'Zambia', code: 'zm' },
  { name: 'Zimbabwe', code: 'zw' },
];

const EMOJI_LIST = ['😀','😂','🔥','❤️','👍','👎','⚔️','🏆','💀','🎉','😎','🤔','💪','🇬🇧','👑','💎','🚀','⭐','😡','🥳'];

const BAD_WORDS = [
  'fuck','shit','bitch','dick','pussy','nigger','nigga','faggot',
  'cunt','whore','slut','bastard','retard','wanker','twat','bollocks',
  'arsehole','motherfucker','cocksucker','dumbass','jackass',
  'kurwa','chuj','pizda','jebac','suka','huj',
  'puta','mierda','pendejo','cabron','putain','merde',
];

function filterBadWords(msg: string): string {
  let filtered = msg;
  BAD_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
}

/* ══════ SECURITY ══════ */

function sanitizeUrl(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;
  const fullLink = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(fullLink);
    const bad = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:', 'ftp:', 'ssh:', 'telnet:'];
    if (bad.some(d => parsed.protocol.toLowerCase() === d)) return null;
    if (!['http:', 'https:'].includes(parsed.protocol.toLowerCase())) return null;
    const h = parsed.hostname.toLowerCase();
    if (
      h === 'localhost' || h === '127.0.0.1' || h === '0.0.0.0' || h === '[::1]' || h === '::1' ||
      h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.localhost') ||
      /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.test(h) ||
      /^(172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/.test(h) ||
      /^(192\.168\.\d{1,3}\.\d{1,3})$/.test(h) ||
      /^(169\.254\.\d{1,3}\.\d{1,3})$/.test(h) ||
      /^0\./.test(h)
    ) return null;
    if (!h.includes('.') || h.length < 4) return null;
    if (/%00|%0d|%0a/i.test(fullLink)) return null;
    return parsed.href;
  } catch { return null; }
}

function getPrice(x: number, y: number): number {
  const cx = GRID_COLS / 2, cy = GRID_ROWS / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  if (dist < 5) return PRICES[3];
  if (dist < 15) return PRICES[2];
  if (dist < 25) return PRICES[1];
  return PRICES[0];
}

function FlagImage({ code }: { code: string }) {
  if (!code || code === 'global') return <span style={{ fontSize: '14px' }}>🌍</span>;
  return <img src={`https://flagcdn.com/w20/${code.toLowerCase()}.png`} width="20" height="13" alt={code} style={{ borderRadius: '2px', objectFit: 'cover' }} />;
}

function sanitizeChat(msg: string): string {
  return msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').slice(0, 200);
}

/* ══════ SOUNDS ══════ */

function useSound() {
  const audioCtx = useRef<AudioContext | null>(null);
  const getCtx = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioCtx.current;
  }, []);

  const playClick = useCallback(() => {
    try {
      const ctx = getCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }, [getCtx]);

  const playClaim = useCallback(() => {
    try {
      const ctx = getCtx();
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        osc.start(ctx.currentTime + i * 0.1); osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } catch {}
  }, [getCtx]);

  const playAlert = useCallback(() => {
    try {
      const ctx = getCtx();
      [440, 330, 440].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination); osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.15);
        osc.start(ctx.currentTime + i * 0.15); osc.stop(ctx.currentTime + i * 0.15 + 0.15);
      });
    } catch {}
  }, [getCtx]);

  const playMessage = useCallback(() => {
    try {
      const ctx = getCtx(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, [getCtx]);

  return { playClick, playClaim, playAlert, playMessage };
}

/* ══════ TOAST ══════ */

interface Toast { id: number; message: string; type: 'info' | 'warning' | 'success'; }

function ToastNotifications({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} onClick={() => onRemove(t.id)}
          className={`pointer-events-auto rounded-2xl px-4 py-3 shadow-2xl border animate-slideIn cursor-pointer max-w-sm ${
            t.type === 'warning' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
            t.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
            'bg-purple-500/20 border-purple-500/30 text-purple-300'
          }`} style={{ backdropFilter: 'blur(20px)' }}>
          <div className="text-sm font-medium">{t.message}</div>
        </div>
      ))}
    </div>
  );
}

/* ══════ PARTICLES ══════ */

function ParticleExplosion({ x, y, color }: { x: number; y: number; color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const ps: any[] = [];
    for (let i = 0; i < 20; i++) { const a = (Math.PI * 2 * i) / 20, sp = 1 + Math.random() * 3; ps.push({ x: 50, y: 50, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, s: 2 + Math.random() * 3 }); }
    let id: number;
    (function run() { ctx.clearRect(0, 0, 100, 100); let alive = false;
      ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.life -= 0.02; if (p.life > 0) { alive = true; ctx.globalAlpha = p.life; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * p.life, 0, Math.PI * 2); ctx.fill(); } });
      if (alive) id = requestAnimationFrame(run); })();
    return () => cancelAnimationFrame(id);
  }, [color]);
  return <canvas ref={ref} width={100} height={100} className="pointer-events-none absolute z-50" style={{ left: x - 50, top: y - 50 }} />;
}

/* ══════ ACTIVITY ITEM ══════ */

function ActivityItem({ tile, dark, sym, rate }: { tile: any; dark: boolean; sym: string; rate: number }) {
  const noDecimals = ['jpy', 'krw', 'vnd', 'idr', 'cop', 'clp', 'huf'];
  const local = parseFloat(tile.price) * rate;
  const priceStr = noDecimals.some(c => sym === c) ? `${sym}${Math.round(local)}` : `${sym}${local.toFixed(2)}`;
  return (
    <div className={`flex items-center gap-2 py-1.5 px-2 rounded-xl animate-slideIn ${dark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`}>
      <div className="w-6 h-6 rounded-lg shrink-0" style={{ backgroundColor: tile.color, boxShadow: `0 0 8px ${tile.color}55` }} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs truncate font-medium ${dark ? 'text-white' : 'text-gray-900'}`}>{tile.display_text || 'Anonymous'}</div>
        <div className="text-[10px] text-gray-500 flex items-center gap-1"><FlagImage code={tile.country_flag} />({tile.x},{tile.y})</div>
      </div>
      <span className="text-[10px] text-purple-400 font-bold shrink-0">{priceStr}</span>
    </div>
  );
}

/* ══════ MINI MAP ══════ */

function MiniMap({ tiles, onNav }: { tiles: Record<string, any>; onNav: (x: number, y: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null); const S = 150, ps = S / GRID_COLS;
  useEffect(() => {
    const c = ref.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    ctx.fillStyle = '#12121a'; ctx.fillRect(0, 0, S, S);
    Object.values(tiles).forEach((t: any) => { ctx.fillStyle = t.color; ctx.fillRect(t.x * ps, t.y * ps, ps, ps); });
  }, [tiles, ps]);
  return <canvas ref={ref} width={S} height={S}
    className="rounded-xl border border-white/10 cursor-crosshair hover:border-purple-500/50 transition-colors w-full"
    onClick={e => { const r = (e.target as HTMLCanvasElement).getBoundingClientRect(); onNav(Math.floor(((e.clientX - r.left) / r.width) * GRID_COLS), Math.floor(((e.clientY - r.top) / r.height) * GRID_ROWS)); }} />;
}

/* ══════ LEADERBOARD ══════ */

function Leaderboard({ tiles }: { tiles: Record<string, any> }) {
  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    Object.values(tiles).forEach((t: any) => { const c = t.country_flag || 'global'; s[c] = (s[c] || 0) + 1; });
    return Object.entries(s).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [tiles]);
  if (!stats.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {stats.map(([code, count], i) => (
        <div key={code} className="flex items-center gap-2">
          <span className="text-xs w-4 text-gray-500 font-bold">{i + 1}</span>
          <FlagImage code={code} />
          <div className="flex-1">
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(count / stats[0][1]) * 100}%`, background: i === 0 ? 'linear-gradient(90deg,#a855f7,#ec4899)' : 'rgba(255,255,255,0.15)' }} />
            </div>
          </div>
          <span className="text-xs text-gray-400 font-bold w-6 text-right">{count}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════ TILE POPUP ══════ */

function TilePopup({ tile, onClose, onReclaim, dark, formatPrice }: {
  tile: any; onClose: () => void; onReclaim: () => void; dark: boolean;
  formatPrice: (p: number) => string;
}) {
  const link = sanitizeUrl(tile.social_link);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={onClose}>
      <div className="relative rounded-3xl p-6 max-w-sm w-full border border-white/10 shadow-2xl animate-scaleIn"
        style={{ background: dark ? 'linear-gradient(135deg,rgba(25,25,50,0.95),rgba(15,15,30,0.98))' : 'linear-gradient(135deg,rgba(255,255,255,0.97),rgba(240,240,252,0.98))', backdropFilter: 'blur(40px)' }}
        onClick={e => e.stopPropagation()}>
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30 blur-3xl pointer-events-none" style={{ backgroundColor: tile.color }} />
        <div className="flex justify-between items-center mb-5">
          <h3 className={`text-lg font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>Tile Owner</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all text-xl">×</button>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div style={{ backgroundColor: tile.color, width: 56, height: 56, borderRadius: 16, flexShrink: 0, boxShadow: `0 0 30px ${tile.color}66` }} />
          <div>
            <div className={`font-bold text-xl ${dark ? 'text-white' : 'text-gray-900'}`}>{tile.display_text || 'Anonymous'}</div>
            <div className="flex items-center gap-2 mt-1">
              <FlagImage code={tile.country_flag} />
              <span className="text-gray-400 text-sm">{COUNTRIES.find(c => c.code === tile.country_flag)?.name || 'Global'}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className={`rounded-2xl p-3 text-center border ${dark ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
            <div className="text-gray-400 text-xs mb-1">Position</div>
            <div className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>({tile.x}, {tile.y})</div>
          </div>
          <div className={`rounded-2xl p-3 text-center border ${dark ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
            <div className="text-gray-400 text-xs mb-1">Paid</div>
            <div className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{formatPrice(parseFloat(tile.price))}</div>
          </div>
        </div>
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer nofollow"
            className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3 text-white font-semibold mb-3 transition-all hover:scale-[1.02]">
            🔗 Visit their page
          </a>
        )}
        {tile.social_link && !link && (
          <div className="flex items-center justify-center w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-red-400 text-xs mb-3">
            ⚠️ Link blocked for security
          </div>
        )}
        <button onClick={onReclaim}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl p-3 font-bold text-white transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]">
          ⚔️ Reclaim for {formatPrice(parseFloat(tile.price) + 0.5)}
        </button>
      </div>
    </div>
  );
}

/* ══════ EMOJI PICKER ══════ */

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-2 left-0 rounded-xl border border-white/10 p-2 shadow-xl animate-scaleIn grid grid-cols-5 gap-1 w-[200px] z-50"
      style={{ background: 'rgba(14,14,26,0.97)', backdropFilter: 'blur(20px)' }}>
      {EMOJI_LIST.map(e => (
        <button key={e} onClick={() => { onSelect(e); onClose(); }}
          className="w-9 h-9 rounded-lg hover:bg-white/10 transition-all hover:scale-110 flex items-center justify-center text-lg">
          {e}
        </button>
      ))}
    </div>
  );
}

/* ══════ LIVE CHAT ══════ */

interface ChatMsg { id: string; username: string; message: string; country_flag: string; color: string; timestamp: number; }

function LiveChat({ displayText, countryCode, color, sounds, addToast }: {
  displayText: string; countryCode: string; color: string;
  sounds: ReturnType<typeof useSound>;
  addToast: (msg: string, type: 'info' | 'warning' | 'success') => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [chatName, setChatName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(isOpen);
  const lastSentRef = useRef(0);
  const msgCountRef = useRef(0);
  const cooldownRef = useRef(false);

  useEffect(() => { const s = localStorage.getItem('pb_chat_name'); if (s) setChatName(s); }, []);
  useEffect(() => { if (displayText.trim() && !chatName) { setChatName(displayText.trim()); localStorage.setItem('pb_chat_name', displayText.trim()); } }, [displayText, chatName]);
  useEffect(() => { openRef.current = isOpen; }, [isOpen]);

  useEffect(() => {
    fetchMsgs();
    const sub = supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (p) => {
      if (p.new) {
        const m = p.new as any;
        setMessages(prev => [...prev, { id: m.id, username: m.username, message: m.message, country_flag: m.country_flag, color: m.color, timestamp: new Date(m.created_at).getTime() }].slice(-100));
        if (!openRef.current) { setUnread(pr => pr + 1); sounds.playMessage(); }
      }
    }).subscribe();
    return () => { sub.unsubscribe(); };
  }, [sounds]);

  useEffect(() => { if (endRef.current && isOpen) endRef.current.scrollIntoView({ behavior: 'smooth' }); }, [messages, isOpen]);

  async function fetchMsgs() {
    const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true }).limit(100);
    if (data) setMessages(data.map((m: any) => ({ id: m.id, username: m.username, message: m.message, country_flag: m.country_flag, color: m.color, timestamp: new Date(m.created_at).getTime() })));
  }

  function saveName() { const n = chatName.trim(); if (!n) return; localStorage.setItem('pb_chat_name', n); setShowNameInput(false); }

  async function send() {
    const t = input.trim();
    if (!t || t.length > 200) return;
    const name = chatName.trim() || displayText.trim();
    if (!name) { setShowNameInput(true); return; }

    const now = Date.now();
    if (now - lastSentRef.current < 1000) { addToast('⏳ Wait a moment before sending again', 'warning'); return; }
    if (cooldownRef.current) { addToast('⏳ Too many messages. Wait 30 seconds.', 'warning'); return; }

    msgCountRef.current++;
    if (msgCountRef.current >= 10) {
      cooldownRef.current = true;
      setTimeout(() => { cooldownRef.current = false; msgCountRef.current = 0; }, 30000);
    }
    lastSentRef.current = now;

    const filtered = filterBadWords(t.slice(0, 200));
    await supabase.from('chat_messages').insert({ username: name.slice(0, 20), message: filtered, country_flag: countryCode, color });
    setInput('');
    sounds.playClick();
  }

  const curName = chatName.trim() || displayText.trim();
  const fmtTime = (ts: number) => { const d = new Date(ts); return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; };

  return (
    <div className="fixed bottom-14 left-4 z-[100]" style={{ width: isOpen ? 'min(380px, calc(100vw - 32px))' : 'auto' }}>
      {isOpen && (
        <div className="mb-2 rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden animate-scaleIn" style={{ background: 'rgba(14,14,26,0.93)', backdropFilter: 'blur(30px)' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-bold text-white">Live Chat</span>
              <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{messages.length}</span>
            </div>
            <div className="flex items-center gap-2">
              {curName && (
                <button onClick={() => setShowNameInput(true)} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-lg px-2 py-1 transition-all" title="Change name">
                  <div className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: color }}>{curName[0].toUpperCase()}</div>
                  <span className="text-[10px] text-gray-300 max-w-[80px] truncate">{curName}</span>
                  <span className="text-[10px]">✏️</span>
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all text-sm">✕</button>
            </div>
          </div>

          {showNameInput && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center p-4 animate-fadeIn">
              <div className="w-full max-w-xs rounded-2xl p-5 border border-white/10 animate-scaleIn" style={{ background: 'rgba(20,20,40,0.97)' }}>
                <h3 className="text-white font-bold text-sm mb-1">Set your chat name</h3>
                <p className="text-gray-500 text-xs mb-4">Visible to everyone in chat</p>
                <input type="text" value={chatName} onChange={e => setChatName(e.target.value.slice(0, 20))} onKeyDown={e => e.key === 'Enter' && saveName()}
                  placeholder="Your name..." maxLength={20} autoFocus
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 mb-3" />
                <div className="flex items-center gap-2 mb-4 bg-white/[0.03] rounded-xl p-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: color }}>{(chatName.trim() || '?')[0].toUpperCase()}</div>
                  <div>
                    <div className="text-xs font-bold" style={{ color }}>{chatName.trim() || 'Your Name'}</div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1"><FlagImage code={countryCode} />Preview</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowNameInput(false)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 text-sm text-gray-400">Cancel</button>
                  <button onClick={saveName} disabled={!chatName.trim()} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 rounded-xl py-2 text-sm font-bold">Save</button>
                </div>
              </div>
            </div>
          )}

          <div className="h-72 overflow-y-auto p-3 flex flex-col gap-2">
            {messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
                <div className="text-center"><div className="text-2xl mb-2">💬</div>No messages yet. Say hello!</div>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} className="flex gap-2 animate-slideIn group">
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: m.color || '#6366f1' }}>
                  {(m.username || 'A')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold truncate" style={{ color: m.color || '#a855f7' }}>{m.username || 'Anonymous'}</span>
                    <FlagImage code={m.country_flag} />
                    <span className="text-[9px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0">{fmtTime(m.timestamp)}</span>
                  </div>
                  <p className="text-sm text-gray-300 break-words leading-relaxed mt-0.5" dangerouslySetInnerHTML={{ __html: sanitizeChat(m.message) }} />
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-white/[0.06]">
            {!curName ? (
              <button onClick={() => setShowNameInput(true)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl py-3 font-bold text-sm transition-all hover:scale-[1.02]">
                ✏️ Set your name to chat
              </button>
            ) : (
              <div className="relative">
                {showEmoji && <EmojiPicker onSelect={e => setInput(prev => prev + e)} onClose={() => setShowEmoji(false)} />}
                <div className="flex gap-2">
                  <button onClick={() => setShowEmoji(!showEmoji)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.08] flex items-center justify-center text-lg transition-all shrink-0">😀</button>
                  <input type="text" value={input} onChange={e => setInput(e.target.value.slice(0, 200))}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder={`Message as ${curName}...`} maxLength={200}
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500/50 transition-all" />
                  <button onClick={send} disabled={!input.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 rounded-xl px-4 font-bold text-sm transition-all hover:scale-105 active:scale-95">➤</button>
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px] text-gray-600">{input.length}/200</span>
                  <span className="text-[9px] text-gray-600">Enter to send</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <button onClick={() => { setIsOpen(!isOpen); setUnread(0); }}
        className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl px-5 py-3 font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40 flex items-center gap-2">
        💬 {isOpen ? 'Close' : 'Live Chat'}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}

/* ══════ ZOOM CONTROLS ══════ */

function ZoomControls({ zoom, onIn, onOut, onReset }: { zoom: number; onIn: () => void; onOut: () => void; onReset: () => void }) {
  return (
    <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-1">
      <button onClick={onIn} className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 text-white font-bold text-lg hover:bg-white/15 transition-all backdrop-blur-sm flex items-center justify-center" title="Zoom in (Ctrl +)">+</button>
      <button onClick={onReset} className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 text-white font-bold text-[10px] hover:bg-white/15 transition-all backdrop-blur-sm flex items-center justify-center" title="Reset zoom (Ctrl 0)">{Math.round(zoom * 100)}%</button>
      <button onClick={onOut} className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 text-white font-bold text-lg hover:bg-white/15 transition-all backdrop-blur-sm flex items-center justify-center" title="Zoom out (Ctrl -)">−</button>
    </div>
  );
}

/* ══════════════════ MAIN ══════════════════ */

export default function Home() {
  const [tiles, setTiles] = useState<Record<string, any>>({});
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [popupTile, setPopupTile] = useState<any | null>(null);
  const [color, setColor] = useState('#6366f1');
  const [displayText, setDisplayText] = useState('');
  const [countryCode, setCountryCode] = useState('global');
  const [socialLink, setSocialLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [totalTiles, setTotalTiles] = useState(0);
  const [recentTiles, setRecentTiles] = useState<any[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'claim' | 'activity' | 'leaderboard'>('claim');
  const [searchQuery, setSearchQuery] = useState('');
  const [linkWarning, setLinkWarning] = useState('');
  const [zoom, setZoom] = useState(1);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [dark, setDark] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mobilePanel, setMobilePanel] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userCurrency, setUserCurrency] = useState({ symbol: '£', rate: 1, currency: 'gbp' });
  const [isLoaded, setIsLoaded] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const particleId = useRef(0);
  const toastId = useRef(0);
  const isPinching = useRef(false);
  const lastPinchDist = useRef(0);
  const myTilesRef = useRef<Set<string>>(new Set());
  const sounds = useSound();

  const formatPrice = useCallback((gbpPrice: number): string => {
    const local = gbpPrice * userCurrency.rate;
    const noDecimals = ['jpy', 'krw', 'vnd', 'idr', 'cop', 'clp', 'huf'];
    if (noDecimals.includes(userCurrency.currency)) return `${userCurrency.symbol}${Math.round(local)}`;
    return `${userCurrency.symbol}${local.toFixed(2)}`;
  }, [userCurrency]);

  useEffect(() => {
    const savedDark = localStorage.getItem('pb_dark');
    if (savedDark !== null) setDark(savedDark === 'true');
    const savedSound = localStorage.getItem('pb_sound');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    setOnlineCount(Math.floor(Math.random() * 200) + 50);
    setIsLoaded(true);
    fetch('/api/get-currency')
      .then(r => r.json())
      .then(data => setUserCurrency({ symbol: data.symbol, rate: data.rate, currency: data.currency }))
      .catch(() => {});
  }, []);

  useEffect(() => { localStorage.setItem('pb_dark', String(dark)); }, [dark]);
  useEffect(() => { localStorage.setItem('pb_sound', String(soundEnabled)); }, [soundEnabled]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = toastId.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: number) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  const zoomIn = useCallback(() => setZoom(p => Math.min(p + ZOOM_STEP, MAX_ZOOM)), []);
  const zoomOut = useCallback(() => setZoom(p => Math.max(p - ZOOM_STEP, MIN_ZOOM)), []);
  const zoomReset = useCallback(() => setZoom(1), []);

  useEffect(() => {
    const c = gridContainerRef.current; if (!c) return;
    const fn = (e: WheelEvent) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); setZoom(p => Math.min(Math.max(p - e.deltaY * 0.001, MIN_ZOOM), MAX_ZOOM)); } };
    c.addEventListener('wheel', fn, { passive: false });
    return () => c.removeEventListener('wheel', fn);
  }, []);

  useEffect(() => {
    const c = gridContainerRef.current; if (!c) return;
    const dist = (t: TouchList) => { if (t.length < 2) return 0; return Math.sqrt((t[0].clientX - t[1].clientX) ** 2 + (t[0].clientY - t[1].clientY) ** 2); };
    const ts = (e: TouchEvent) => { if (e.touches.length === 2) { isPinching.current = true; lastPinchDist.current = dist(e.touches); } };
    const tm = (e: TouchEvent) => { if (e.touches.length === 2 && isPinching.current) { e.preventDefault(); const d = dist(e.touches); setZoom(p => Math.min(Math.max(p + (d - lastPinchDist.current) * 0.005, MIN_ZOOM), MAX_ZOOM)); lastPinchDist.current = d; } };
    const te = () => { isPinching.current = false; };
    c.addEventListener('touchstart', ts, { passive: true }); c.addEventListener('touchmove', tm, { passive: false }); c.addEventListener('touchend', te, { passive: true });
    return () => { c.removeEventListener('touchstart', ts); c.removeEventListener('touchmove', tm); c.removeEventListener('touchend', te); };
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) { e.preventDefault(); zoomIn(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); zoomOut(); }
      else if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); zoomReset(); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [zoomIn, zoomOut, zoomReset]);

  useEffect(() => {
    fetchTiles();
    const sub = supabase.channel('tiles').on('postgres_changes', { event: '*', schema: 'public', table: 'Pixels' }, (payload) => {
      if (payload.new && typeof payload.new === 'object' && 'x' in payload.new) {
        const t = payload.new as any;
        const key = `${t.x},${t.y}`;
        if (myTilesRef.current.has(key)) {
          addToast(`⚔️ Someone reclaimed your tile (${t.x}, ${t.y})!`, 'warning');
          if (soundEnabled) sounds.playAlert();
        }
        setRecentTiles(p => [t, ...p].slice(0, 20));
        const id = particleId.current++;
        setParticles(p => [...p, { id, x: t.x * TILE_SIZE, y: t.y * TILE_SIZE, color: t.color }]);
        setTimeout(() => setParticles(p => p.filter(pp => pp.id !== id)), 2000);
        if (soundEnabled) sounds.playClaim();
      }
      fetchTiles();
    }).subscribe();
    return () => { sub.unsubscribe(); };
  }, [addToast, soundEnabled, sounds]);

  async function fetchTiles() {
    const { data } = await supabase.from('Pixels').select('*');
    if (data) {
      const m: Record<string, any> = {};
      data.forEach((t: any) => { m[`${t.x},${t.y}`] = t; });
      setTiles(m);
      setTotalTiles(data.length);
      setRecentTiles(p => p.length === 0 ? data.slice(-10).reverse() : p);
      const myName = localStorage.getItem('pb_chat_name') || '';
      if (myName) {
        const myKeys = new Set<string>();
        data.forEach((t: any) => { if (t.display_text === myName) myKeys.add(`${t.x},${t.y}`); });
        myTilesRef.current = myKeys;
      }
    }
  }

  function handleTileClick(x: number, y: number) {
    const t = tiles[`${x},${y}`];
    if (t) setPopupTile(t);
    else { setSelectedTile({ x, y }); setSidebarTab('claim'); setMobilePanel(true); }
    if (soundEnabled) sounds.playClick();
  }

  function navTo(x: number, y: number) {
    if (gridContainerRef.current) {
      const c = gridContainerRef.current;
      c.scrollTo({ left: x * (TILE_SIZE + 1) * zoom - c.clientWidth / 2, top: y * (TILE_SIZE + 1) * zoom - c.clientHeight / 2, behavior: 'smooth' });
    }
  }

  function handleLinkChange(v: string) {
    setSocialLink(v);
    setLinkWarning(v.trim() ? (sanitizeUrl(v) ? '' : '⚠️ This link will be blocked for security reasons') : '');
  }

  async function handleBuy() {
    if (!selectedTile) return;
    setLoading(true);
    try {
      const ex = tiles[`${selectedTile.x},${selectedTile.y}`];
      const price = ex ? ex.price + 0.5 : getPrice(selectedTile.x, selectedTile.y);
      const res = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: selectedTile.x, y: selectedTile.y, color, displayText: displayText.slice(0, 20), countryFlag: countryCode, socialLink: sanitizeUrl(socialLink) || '', price, currency: userCurrency.currency }),
      });
      if (!res.ok) throw new Error('Payment failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      addToast(`❌ ${err.message || 'Something went wrong. Try again.'}`, 'warning');
      setLoading(false);
    }
  }

  const selData = selectedTile ? tiles[`${selectedTile.x},${selectedTile.y}`] : null;
  const selPrice = selectedTile ? (selData ? selData.price + 0.5 : getPrice(selectedTile.x, selectedTile.y)) : null;
  const searchRes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return Object.values(tiles).filter((t: any) => (t.display_text || '').toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [searchQuery, tiles]);
  const pct = ((totalTiles / (GRID_COLS * GRID_ROWS)) * 100).toFixed(1);

  const theme = {
    bg: dark ? '#0e0e18' : '#f0f0f5',
    headerBg: dark ? 'rgba(14,14,24,0.8)' : 'rgba(255,255,255,0.85)',
    sidebarBg: dark ? 'rgba(14,14,24,0.7)' : 'rgba(255,255,255,0.8)',
    cardBg: dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.03)',
    border: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)',
    text: dark ? 'text-white' : 'text-gray-900',
    textMuted: dark ? 'text-gray-400' : 'text-gray-500',
    textFaint: dark ? 'text-gray-500' : 'text-gray-400',
    inputBg: dark ? 'bg-white/[0.05]' : 'bg-black/[0.04]',
    inputBorder: dark ? 'border-white/[0.1]' : 'border-gray-200',
  };

  const sidebarContent = (
    <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
      {sidebarTab === 'claim' && (
        <>
          {selectedTile ? (
            <div className="rounded-2xl p-3 animate-slideIn" style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.12),rgba(236,72,153,0.06))', border: '1px solid rgba(168,85,247,0.25)' }}>
              <div className="flex items-center justify-between">
                <span className="text-purple-300 font-bold text-sm">Tile ({selectedTile.x}, {selectedTile.y})</span>
                <button onClick={() => setSelectedTile(null)} className={`${theme.textFaint} hover:text-white text-lg w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition`}>×</button>
              </div>
              {selData ? (
                <div className="text-yellow-400 text-xs mt-1">⚔️ Reclaim for {formatPrice(selPrice || 0)}</div>
              ) : (
                <div className="text-green-400 text-xs mt-1">✅ Claim for {formatPrice(selPrice || 0)}</div>
              )}
            </div>
          ) : (
            <div className={`rounded-2xl p-4 text-center text-sm border ${theme.textMuted}`} style={{ borderColor: theme.border, background: theme.cardBg }}>
              <div className="text-2xl mb-2">👆</div>Click any tile on the grid
            </div>
          )}

          <div className="rounded-2xl p-4 flex flex-col gap-3 border" style={{ borderColor: theme.border, background: theme.cardBg }}>
            <div>
              <label className={`${theme.textMuted} text-[10px] uppercase tracking-[0.15em] mb-1.5 block font-semibold`}>Your name</label>
              <input type="text" value={displayText} onChange={e => setDisplayText(e.target.value.slice(0, 20))} placeholder="Enter name..." maxLength={20}
                className={`w-full ${theme.inputBg} border ${theme.inputBorder} rounded-xl px-3 py-2.5 ${theme.text} text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all`} />
            </div>
            <div>
              <label className={`${theme.textMuted} text-[10px] uppercase tracking-[0.15em] mb-1.5 block font-semibold`}>Country</label>
              <select value={countryCode} onChange={e => setCountryCode(e.target.value)}
                className={`w-full ${theme.inputBg} border ${theme.inputBorder} rounded-xl px-3 py-2.5 ${theme.text} text-sm focus:outline-none focus:border-purple-500/50 transition-all`}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`${theme.textMuted} text-[10px] uppercase tracking-[0.15em] mb-1.5 block font-semibold`}>Tile colour</label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className={`w-full h-11 rounded-xl cursor-pointer border ${theme.inputBorder} bg-transparent`} />
                <div className="w-11 h-11 rounded-xl border border-white/10 shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 20px ${color}44` }} />
              </div>
              <div className="flex gap-1.5 mt-2">
                {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'].map(c => (
                  <button key={c} onClick={() => setColor(c)} className="w-6 h-6 rounded-lg border border-white/10 transition-all hover:scale-125"
                    style={{ backgroundColor: c, boxShadow: color === c ? `0 0 10px ${c}` : 'none' }} />
                ))}
              </div>
            </div>
            <div>
              <label className={`${theme.textMuted} text-[10px] uppercase tracking-[0.15em] mb-1.5 block font-semibold`}>
                Your link <span className={`${theme.textFaint} normal-case`}>(optional)</span>
              </label>
              <input type="text" value={socialLink} onChange={e => handleLinkChange(e.target.value)} placeholder="https://..." maxLength={MAX_URL_LENGTH}
                className={`w-full ${theme.inputBg} border rounded-xl px-3 py-2.5 ${theme.text} text-sm placeholder-gray-500 focus:outline-none transition-all ${linkWarning ? 'border-red-500/50' : `${theme.inputBorder} focus:border-purple-500/50`}`} />
              {linkWarning && <p className="text-red-400 text-[10px] mt-1.5 animate-slideIn">{linkWarning}</p>}
              {socialLink && !linkWarning && <p className="text-green-400 text-[10px] mt-1.5 animate-slideIn">✅ Link verified &amp; safe</p>}
            </div>
          </div>

          <button onClick={handleBuy} disabled={!selectedTile || loading}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 rounded-2xl py-4 font-black text-lg transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] animate-gradient bg-[length:200%_auto]">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : selectedTile ? (
              `⚔️ Claim · ${formatPrice(selPrice || 0)}`
            ) : (
              'Select a tile'
            )}
          </button>
          <p className={`${theme.textFaint} text-[10px] text-center tracking-wider`}>🔒 SECURE PAYMENT VIA STRIPE</p>

          <div className="rounded-2xl p-3 border" style={{ borderColor: theme.border, background: theme.cardBg }}>
            <div className={`${theme.textMuted} text-[10px] uppercase tracking-[0.15em] mb-2 font-semibold`}>🗺️ Map overview</div>
            <MiniMap tiles={tiles} onNav={navTo} />
          </div>
          <div className="rounded-2xl p-3 border" style={{ borderColor: theme.border, background: theme.cardBg }}>
            <div className={`${theme.textMuted} text-[10px] uppercase tracking-[0.15em] mb-2 font-semibold`}>🔍 Find player</div>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name..."
              className={`w-full ${theme.inputBg} border ${theme.inputBorder} rounded-xl px-3 py-2 ${theme.text} text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all`} />
            {searchRes.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                {searchRes.map((t: any) => (
                  <button key={`${t.x},${t.y}`} onClick={() => { navTo(t.x, t.y); setPopupTile(t); setSearchQuery(''); }}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition text-left">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: t.color }} />
                    <span className={`text-xs ${theme.text} truncate`}>{t.display_text || 'Anonymous'}</span>
                    <span className="text-[10px] text-gray-500 ml-auto">({t.x},{t.y})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {sidebarTab === 'activity' && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider`}>Live Activity</span>
          </div>
          {recentTiles.length === 0 ? (
            <div className={`text-center ${theme.textFaint} text-sm py-8`}>No activity yet...</div>
          ) : recentTiles.map((t, i) => <ActivityItem key={`${t.x}-${t.y}-${i}`} tile={t} dark={dark} sym={userCurrency.symbol} rate={userCurrency.rate} />)}
        </div>
      )}

      {sidebarTab === 'leaderboard' && (
        <div className="flex flex-col gap-3">
          <span className={`text-xs font-bold ${theme.textMuted} uppercase tracking-wider`}>🏆 Country Rankings</span>
          <Leaderboard tiles={tiles} />
          <div className="mt-4 rounded-2xl p-4 border" style={{ borderColor: theme.border, background: theme.cardBg }}>
            <div className={`${theme.textMuted} text-[10px] uppercase tracking-[0.15em] mb-3 font-semibold`}>📊 Stats</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: totalTiles, label: 'Claimed', color: 'text-purple-400' },
                { val: GRID_COLS * GRID_ROWS - totalTiles, label: 'Available', color: 'text-green-400' },
                { val: `${pct}%`, label: 'Filled', color: 'text-pink-400' },
                { val: onlineCount ?? '...', label: 'Online', color: 'text-orange-400' },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl p-3 text-center ${dark ? 'bg-white/[0.04]' : 'bg-black/[0.04]'}`}>
                  <div className={`text-xl font-black ${s.color}`}>{s.val}</div>
                  <div className="text-[10px] text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (!isLoaded) {
    return (
      <div className="h-screen bg-[#0e0e18] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">⚔️</div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            PIXEL BATTLE
          </h1>
          <p className="text-gray-500 text-sm mt-2">Loading the battlefield...</p>
          <div className="mt-6 w-40 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ animation: 'loadingBar 1.5s ease-in-out infinite' }} />
          </div>
        </div>
        <style>{`@keyframes loadingBar { 0%{width:0%;margin-left:0%} 50%{width:60%;margin-left:20%} 100%{width:0%;margin-left:100%} }`}</style>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative" style={{ backgroundColor: theme.bg, color: dark ? 'white' : '#1a1a2e' }}>
      {dark && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.04] animate-blob" style={{ background: 'radial-gradient(circle,#a855f7,transparent 70%)' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.04] animate-blob2" style={{ background: 'radial-gradient(circle,#ec4899,transparent 70%)' }} />
          <div className="absolute top-[30%] right-[20%] w-[40%] h-[40%] rounded-full opacity-[0.03] animate-blob3" style={{ background: 'radial-gradient(circle,#3b82f6,transparent 70%)' }} />
        </div>
      )}

      <ToastNotifications toasts={toasts} onRemove={removeToast} />

      {popupTile && (
        <TilePopup tile={popupTile} dark={dark} formatPrice={formatPrice}
          onClose={() => setPopupTile(null)}
          onReclaim={() => { setPopupTile(null); setSelectedTile({ x: popupTile.x, y: popupTile.y }); setSidebarTab('claim'); }} />
      )}

      {particles.map(p => <ParticleExplosion key={p.id} x={p.x} y={p.y} color={p.color} />)}

      <header className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 border-b relative z-10"
        style={{ background: theme.headerBg, backdropFilter: 'blur(20px)', borderColor: theme.border }}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl">⚔️</span>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 animate-pulse" style={{ borderColor: theme.bg }} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent leading-tight animate-gradient bg-[length:200%_auto]">
              PIXEL BATTLE
            </h1>
            <p className={`${theme.textFaint} text-xs tracking-wider hidden sm:block`}>Claim · Battle · Dominate</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm ${dark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
            title={soundEnabled ? 'Mute sounds' : 'Unmute sounds'}>
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button onClick={() => setDark(!dark)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm ${dark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
            title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? '☀️' : '🌙'}
          </button>
          {onlineCount !== null && (
            <div className="hidden md:flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-xs">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">{onlineCount} online</span>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            {[
              { e: '👑', p: formatPrice(2.99), c: 'text-yellow-400' },
              { e: '🔥', p: formatPrice(1.99), c: 'text-orange-400' },
              { e: '⭐', p: formatPrice(0.99), c: 'text-blue-400' },
              { e: '🌱', p: formatPrice(0.49), c: 'text-green-400' },
            ].map((x, i) => (
              <span key={i} className={`flex items-center gap-1 ${x.c} opacity-70 hover:opacity-100 transition`}>{x.e} {x.p}</span>
            ))}
          </div>
          <div className="rounded-2xl px-3 md:px-4 py-2 text-center border" style={{ borderColor: theme.border, background: theme.cardBg }}>
            <div className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">{totalTiles}</div>
            <div className="text-gray-500 text-[10px] tracking-wider">CLAIMED</div>
          </div>
          <button onClick={() => setMobilePanel(true)} className="md:hidden w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-sm">☰</button>
        </div>
      </header>

      <div className="h-0.5 relative z-10" style={{ background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)' }}>
        <div className="h-full transition-all duration-1000" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#a855f7,#ec4899,#f97316)' }} />
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        <div ref={gridContainerRef} className="flex-1 overflow-auto p-2 md:p-4 relative">
          <div ref={gridRef} style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.15s ease-out' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: `repeat(${GRID_COLS},${TILE_SIZE}px)`,
              gap: '1px', backgroundColor: dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.05)',
              borderRadius: '20px', padding: '3px', width: 'fit-content',
            }}>
              {Array.from({ length: GRID_ROWS }, (_, y) => Array.from({ length: GRID_COLS }, (_, x) => {
                const k = `${x},${y}`, t = tiles[k];
                const isSel = selectedTile?.x === x && selectedTile?.y === y;
                const isHov = hoveredTile?.x === x && hoveredTile?.y === y;
                const pr = getPrice(x, y);
                const bg = dark
                  ? (pr === PRICES[3] ? 'rgba(45,35,10,0.6)' : pr === PRICES[2] ? 'rgba(35,22,5,0.5)' : pr === PRICES[1] ? 'rgba(16,16,48,0.5)' : 'rgba(12,28,12,0.4)')
                  : (pr === PRICES[3] ? 'rgba(255,240,200,0.6)' : pr === PRICES[2] ? 'rgba(255,230,180,0.4)' : pr === PRICES[1] ? 'rgba(220,220,255,0.5)' : 'rgba(220,255,220,0.4)');
                return (
                  <div key={k} onClick={() => handleTileClick(x, y)}
                    onMouseEnter={() => setHoveredTile({ x, y })} onMouseLeave={() => setHoveredTile(null)}
                    style={{
                      width: TILE_SIZE, height: TILE_SIZE, backgroundColor: t ? t.color : bg,
                      border: isSel ? '2px solid #a855f7' : isHov ? '2px solid rgba(168,85,247,0.5)' : `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}`,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)',
                      transform: isHov || isSel ? 'scale(1.25)' : 'scale(1)',
                      zIndex: isHov || isSel ? 10 : 1, position: 'relative', borderRadius: '6px',
                      boxShadow: isSel ? '0 0 20px rgba(168,85,247,0.8),0 0 40px rgba(168,85,247,0.3)'
                        : isHov && t ? `0 0 15px ${t.color}66` : t ? `0 0 6px ${t.color}33` : 'none',
                    }}
                    title={t ? `${t.display_text || 'Anonymous'} · ${formatPrice(parseFloat(t.price))}` : `Free · ${formatPrice(pr)}`}>
                    {t ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '1px' }}>
                        <FlagImage code={t.country_flag} />
                        <span style={{ fontSize: '6px', color: 'white', fontWeight: '800', maxWidth: '30px', textAlign: 'center', lineHeight: 1, textShadow: '0 1px 3px black', overflow: 'hidden' }}>
                          {t.display_text || ''}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.1)', fontSize: '10px' }}>{isHov ? '✦' : '+'}</span>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>
          <ZoomControls zoom={zoom} onIn={zoomIn} onOut={zoomOut} onReset={zoomReset} />
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-80 shrink-0 border-l overflow-y-auto flex-col"
          style={{ background: theme.sidebarBg, backdropFilter: 'blur(30px)', borderColor: theme.border }}>
          <div className="flex border-b p-1 m-3 mb-0 rounded-xl" style={{ borderColor: theme.border, background: theme.cardBg }}>
            {([{ id: 'claim' as const, l: '⚔️ Claim' }, { id: 'activity' as const, l: '🔴 Live' }, { id: 'leaderboard' as const, l: '🏆 Top' }]).map(t => (
              <button key={t.id} onClick={() => setSidebarTab(t.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sidebarTab === t.id ? (dark ? 'bg-white/10 text-white' : 'bg-black/10 text-gray-900') + ' shadow-lg' : `${theme.textFaint} hover:opacity-80`}`}>
                {t.l}
              </button>
            ))}
          </div>
          {sidebarContent}
          <div className="p-3 border-t" style={{ borderColor: theme.border }}>
            <div className={`flex items-center justify-between text-[10px] ${theme.textFaint}`}>
              <span>{(GRID_COLS * GRID_ROWS - totalTiles).toLocaleString()} tiles left</span>
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                {onlineCount ?? '...'} online
              </span>
            </div>
          </div>
        </aside>

        {/* Mobile bottom sheet */}
        {mobilePanel && (
          <div className="md:hidden fixed inset-0 z-[90] animate-fadeIn" onClick={() => setMobilePanel(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl overflow-y-auto animate-slideUp"
              style={{ background: dark ? '#0e0e18' : '#f0f0f5' }} onClick={e => e.stopPropagation()}>
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-10 h-1 rounded-full ${dark ? 'bg-white/20' : 'bg-black/20'}`} />
              </div>
              <div className="flex p-1 mx-3 rounded-xl" style={{ background: theme.cardBg }}>
                {([{ id: 'claim' as const, l: '⚔️ Claim' }, { id: 'activity' as const, l: '🔴 Live' }, { id: 'leaderboard' as const, l: '🏆 Top' }]).map(t => (
                  <button key={t.id} onClick={() => setSidebarTab(t.id)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${sidebarTab === t.id ? (dark ? 'bg-white/10 text-white' : 'bg-black/10 text-gray-900') + ' shadow-lg' : theme.textFaint}`}>
                    {t.l}
                  </button>
                ))}
              </div>
              {sidebarContent}
              <div className="h-8" />
            </div>
          </div>
        )}
      </div>

      <LiveChat displayText={displayText} countryCode={countryCode} color={color} sounds={sounds} addToast={addToast} />

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9) translateY(10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes gradient { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        @keyframes blob { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(30px,-50px) scale(1.1) } 66% { transform: translate(-20px,20px) scale(0.9) } }
        @keyframes blob2 { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(-30px,30px) scale(1.15) } 66% { transform: translate(40px,-20px) scale(0.85) } }
        @keyframes blob3 { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(20px,40px) scale(0.95) } 66% { transform: translate(-40px,-30px) scale(1.05) } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) }
        .animate-slideIn { animation: slideIn 0.3s ease-out }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) }
        .animate-gradient { animation: gradient 3s ease infinite }
        .animate-blob { animation: blob 20s ease-in-out infinite }
        .animate-blob2 { animation: blob2 25s ease-in-out infinite }
        .animate-blob3 { animation: blob3 22s ease-in-out infinite }
        ::-webkit-scrollbar { width: 6px; height: 6px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18) }
        select option { background: #1a1a2e; color: white }
      `}</style>
    </div>
  );
}
