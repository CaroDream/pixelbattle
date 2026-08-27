import { createClient } from '@supabase/supabase-js';

type SupabaseAdmin = ReturnType<typeof createClient>;

export function getSupabaseAdmin(): SupabaseAdmin {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase server credentials');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

// Lazy proxy: route modules can be imported during Next.js builds without
// requiring production secrets to exist at build time.
export const supabaseAdmin = new Proxy({} as SupabaseAdmin, {
  get(_target, property) {
    return getSupabaseAdmin()[property as keyof SupabaseAdmin];
  },
});
