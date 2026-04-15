import { NextResponse } from 'next/server';

const CURRENCY_MAP: Record<string, { currency: string; symbol: string; rate: number }> = {
  GB: { currency: 'gbp', symbol: '£', rate: 1 },
  US: { currency: 'usd', symbol: '$', rate: 1.27 },
  PL: { currency: 'pln', symbol: 'zł', rate: 5.08 },
  DE: { currency: 'eur', symbol: '€', rate: 1.17 },
  FR: { currency: 'eur', symbol: '€', rate: 1.17 },
  IT: { currency: 'eur', symbol: '€', rate: 1.17 },
  ES: { currency: 'eur', symbol: '€', rate: 1.17 },
  NL: { currency: 'eur', symbol: '€', rate: 1.17 },
  BE: { currency: 'eur', symbol: '€', rate: 1.17 },
  AT: { currency: 'eur', symbol: '€', rate: 1.17 },
  PT: { currency: 'eur', symbol: '€', rate: 1.17 },
  IE: { currency: 'eur', symbol: '€', rate: 1.17 },
  FI: { currency: 'eur', symbol: '€', rate: 1.17 },
  GR: { currency: 'eur', symbol: '€', rate: 1.17 },
  SK: { currency: 'eur', symbol: '€', rate: 1.17 },
  SI: { currency: 'eur', symbol: '€', rate: 1.17 },
  LT: { currency: 'eur', symbol: '€', rate: 1.17 },
  LV: { currency: 'eur', symbol: '€', rate: 1.17 },
  EE: { currency: 'eur', symbol: '€', rate: 1.17 },
  LU: { currency: 'eur', symbol: '€', rate: 1.17 },
  MT: { currency: 'eur', symbol: '€', rate: 1.17 },
  CY: { currency: 'eur', symbol: '€', rate: 1.17 },
  JP: { currency: 'jpy', symbol: '¥', rate: 191.5 },
  CN: { currency: 'cny', symbol: '¥', rate: 9.18 },
  KR: { currency: 'krw', symbol: '₩', rate: 1690 },
  IN: { currency: 'inr', symbol: '₹', rate: 105.8 },
  BR: { currency: 'brl', symbol: 'R$', rate: 6.35 },
  CA: { currency: 'cad', symbol: 'C$', rate: 1.72 },
  AU: { currency: 'aud', symbol: 'A$', rate: 1.93 },
  MX: { currency: 'mxn', symbol: 'MX$', rate: 21.8 },
  SE: { currency: 'sek', symbol: 'kr', rate: 13.2 },
  NO: { currency: 'nok', symbol: 'kr', rate: 13.5 },
  DK: { currency: 'dkk', symbol: 'kr', rate: 8.72 },
  CH: { currency: 'chf', symbol: 'CHF', rate: 1.12 },
  CZ: { currency: 'czk', symbol: 'Kč', rate: 29.5 },
  HU: { currency: 'huf', symbol: 'Ft', rate: 460 },
  RO: { currency: 'ron', symbol: 'lei', rate: 5.82 },
  TR: { currency: 'try', symbol: '₺', rate: 38.5 },
  UA: { currency: 'uah', symbol: '₴', rate: 52.3 },
  RU: { currency: 'rub', symbol: '₽', rate: 115 },
  ZA: { currency: 'zar', symbol: 'R', rate: 23.1 },
  TH: { currency: 'thb', symbol: '฿', rate: 44.2 },
  SG: { currency: 'sgd', symbol: 'S$', rate: 1.71 },
  NZ: { currency: 'nzd', symbol: 'NZ$', rate: 2.12 },
  AE: { currency: 'aed', symbol: 'د.إ', rate: 4.67 },
  SA: { currency: 'sar', symbol: 'ر.س', rate: 4.76 },
  IL: { currency: 'ils', symbol: '₪', rate: 4.72 },
  NG: { currency: 'ngn', symbol: '₦', rate: 1950 },
  AR: { currency: 'ars', symbol: 'ARS$', rate: 1120 },
  CL: { currency: 'clp', symbol: 'CLP$', rate: 1180 },
  CO: { currency: 'cop', symbol: 'COP$', rate: 5280 },
  PH: { currency: 'php', symbol: '₱', rate: 71.5 },
  MY: { currency: 'myr', symbol: 'RM', rate: 5.65 },
  ID: { currency: 'idr', symbol: 'Rp', rate: 19800 },
  VN: { currency: 'vnd', symbol: '₫', rate: 31500 },
  TW: { currency: 'twd', symbol: 'NT$', rate: 40.8 },
  HK: { currency: 'hkd', symbol: 'HK$', rate: 9.92 },
};

export async function GET(req: Request) {
  const country =
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('cf-ipcountry') ||
    'GB';

  const info = CURRENCY_MAP[country] || CURRENCY_MAP['GB'];

  return NextResponse.json({
    country,
    currency: info.currency,
    symbol: info.symbol,
    rate: info.rate,
  });
}