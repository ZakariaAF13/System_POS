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

// Global client cache to prevent multiple GoTrueClient instances
type ClientCache = {
  __SB_CLIENTS__?: Record<string, ReturnType<typeof createClient>>;
  __SB_WARNED__?: boolean;
};

function getClientCache(): ClientCache {
  if (typeof window !== 'undefined') {
    return window as unknown as ClientCache;
  }
  return {};
}

// Cache default client to avoid multiple instances during HMR/StrictMode
function getDefaultClient() {
  const cache = getClientCache();
  if (typeof window !== 'undefined') {
    if (!cache.__SB_CLIENTS__) cache.__SB_CLIENTS__ = {};
    if (!cache.__SB_CLIENTS__['default']) {
      cache.__SB_CLIENTS__['default'] = createClient(supabaseUrl || '', supabaseAnonKey || '', {
        auth: {
          detectSessionInUrl: false, // Disable to avoid multiple warnings
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return cache.__SB_CLIENTS__['default'];
  }
  return createClient(supabaseUrl || '', supabaseAnonKey || '');
}

export const supabase = getDefaultClient();

export function createSupabaseClientWithKey(storageKey: string) {
  // Reuse per-key client in the same browser context to avoid multiple GoTrueClient instances
  const cache = getClientCache();
  if (typeof window !== 'undefined') {
    if (!cache.__SB_CLIENTS__) cache.__SB_CLIENTS__ = {};
    const cached = cache.__SB_CLIENTS__[storageKey];
    if (cached) return cached;
    
    const client = createClient(supabaseUrl || '', supabaseAnonKey || '', {
      auth: {
        storageKey,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // Disable to avoid warnings
      },
    });
    cache.__SB_CLIENTS__[storageKey] = client as any;
    
    // Log info only once
    if (!cache.__SB_WARNED__) {
      console.log(`✓ Supabase client initialized with storage key: ${storageKey}`);
      cache.__SB_WARNED__ = true;
    }
    
    return client;
  }
  return createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
      storageKey,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
