import { createClient } from '@supabase/supabase-js';

// Next.js exposes public runtime env with NEXT_PUBLIC_ prefix
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export function createSupabaseClientWithKey(storageKey: string) {
  // Reuse per-key client in the same browser context to avoid multiple GoTrueClient instances
  if (typeof window !== 'undefined') {
    const g = window as unknown as { __SB_CLIENTS__?: Record<string, ReturnType<typeof createClient>> };
    if (!g.__SB_CLIENTS__) g.__SB_CLIENTS__ = {};
    const cached = g.__SB_CLIENTS__[storageKey];
    if (cached) return cached;
    const client = createClient(supabaseUrl || '', supabaseAnonKey || '', {
      auth: {
        storageKey,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    g.__SB_CLIENTS__[storageKey] = client as any;
    return client;
  }
  return createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
      storageKey,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}
