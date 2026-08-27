-- Pixel Battle P0: payment/order hardening
create extension if not exists pgcrypto;

create table if not exists public.pixel_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  x integer not null check (x between 0 and 49),
  y integer not null check (y between 0 and 49),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  display_text text check (display_text is null or char_length(display_text) <= 30),
  country_flag text,
  social_link text,
  amount_gbp_pence integer not null check (amount_gbp_pence > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','expired','cancelled')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 minutes')
);

create unique index if not exists pixel_orders_paid_pixel_unique
  on public.pixel_orders (x,y)
  where status = 'paid';

create table if not exists public.pixel_reservations (
  x integer not null check (x between 0 and 49),
  y integer not null check (y between 0 and 49),
  order_id uuid primary key references public.pixel_orders(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (x,y)
);

alter table public.pixel_orders enable row level security;
alter table public.pixel_reservations enable row level security;

revoke all on public.pixel_orders from anon, authenticated;
revoke all on public.pixel_reservations from anon, authenticated;

drop policy if exists "public can read paid orders" on public.pixel_orders;
create policy "public can read paid orders" on public.pixel_orders for select to anon, authenticated using (status = 'paid');

-- Keep reservations private; checkout/webhook must use the server-side service role.

create index if not exists pixel_orders_status_expires_idx on public.pixel_orders(status, expires_at);
create index if not exists pixel_reservations_expires_idx on public.pixel_reservations(expires_at);
