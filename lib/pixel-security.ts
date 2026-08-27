export const GRID_COLS = 50;
export const GRID_ROWS = 50;

const PRICE_CENTS = {
  outer: 49,
  middle: 99,
  inner: 199,
  centre: 299,
  reclaimFee: 50,
} as const;

const MAX_DISPLAY_TEXT = 80;
const MAX_URL_LENGTH = 500;
const COUNTRY_CODE = /^[a-z]{2}$/i;
const COLOR = /^#[0-9a-f]{6}$/i;

export function isValidCoordinate(value: unknown, max: number): value is number {
  return Number.isInteger(value) && value >= 0 && value < max;
}

export function getPixelPriceCents(x: number, y: number, reclaim = false): number {
  const cx = GRID_COLS / 2;
  const cy = GRID_ROWS / 2;
  const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

  const base = dist < 5
    ? PRICE_CENTS.centre
    : dist < 15
      ? PRICE_CENTS.inner
      : dist < 25
        ? PRICE_CENTS.middle
        : PRICE_CENTS.outer;

  return base + (reclaim ? PRICE_CENTS.reclaimFee : 0);
}

export function centsToGbp(cents: number): number {
  return Number((cents / 100).toFixed(2));
}

export function sanitizeDisplayText(value: unknown): string {
  if (typeof value !== 'string') return 'Anonymous';
  return value.trim().replace(/[<>]/g, '').slice(0, MAX_DISPLAY_TEXT) || 'Anonymous';
}

export function sanitizeColor(value: unknown): string {
  if (typeof value !== 'string' || !COLOR.test(value)) return '#6366f1';
  return value.toLowerCase();
}

export function sanitizeCountryFlag(value: unknown): string {
  if (typeof value !== 'string') return 'global';
  const code = value.trim().toLowerCase();
  if (code === 'global') return code;
  return COUNTRY_CODE.test(code) ? code : 'global';
}

export function sanitizeUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;

  const fullLink = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(fullLink);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') return null;

    const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    const blocked =
      hostname === 'localhost' ||
      hostname === '0.0.0.0' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.localhost') ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^169\.254\./.test(hostname) ||
      /^0\./.test(hostname);

    if (blocked || hostname.length < 4 || !hostname.includes('.')) return null;
    if (/%00|%0d|%0a/i.test(fullLink)) return null;

    return parsed.href;
  } catch {
    return null;
  }
}

export function validatePixelInput(input: {
  x: unknown;
  y: unknown;
  color: unknown;
  displayText: unknown;
  countryFlag: unknown;
  socialLink: unknown;
}) {
  const x = typeof input.x === 'number' ? input.x : Number(input.x);
  const y = typeof input.y === 'number' ? input.y : Number(input.y);

  if (!isValidCoordinate(x, GRID_COLS) || !isValidCoordinate(y, GRID_ROWS)) {
    throw new Error('Invalid pixel coordinates');
  }

  return {
    x,
    y,
    color: sanitizeColor(input.color),
    displayText: sanitizeDisplayText(input.displayText),
    countryFlag: sanitizeCountryFlag(input.countryFlag),
    socialLink: sanitizeUrl(input.socialLink),
  };
}
