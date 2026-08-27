-- P0 payment hardening.
-- Run this migration in the Supabase project before enabling live payments.

create table if not exists public.pixel_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique,
  x integer not null check (x >= 0 and x < 50),
  y integer not null check (y >= 0 and y < 50),
  color text not null check (color ~ '^#[0-9a-fA-F]{6}$'),
  display_text text not null default 'Anonymous',
  country_flag text not null default 'global',
  social_link text,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'gbp' check (currency = 'gbp'),
  kind text not null check (kind in ('claim', 'reclaim')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists pixel_orders_stripe_session_idx
  on public.pixel_orders (stripe_session_id);

create unique index if not exists pixel_orders_active_pixel_idx
  on public.pixel_orders (x, y)
  where status = 'pending';

alter table public.pixel_orders enable row level security;
revoke all on table public.pixel_orders from anon, authenticated;

grant select on table public."Pixels" to anon, authenticated;
revoke insert, update, delete on table public."Pixels" from anon, authenticated;

-- The webhook uses the server-side Supabase secret/service-role client.
-- It is the only component that should write paid ownership to Pixels.
