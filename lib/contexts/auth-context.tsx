'use client';

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, createSupabaseClientWithKey } from '@/lib/supabase';

interface Profile {
  id: string;
  role: 'admin' | 'kasir';
  full_name: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: 'admin' | 'kasir' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children, scope }: { children: ReactNode; scope?: 'admin' | 'kasir' }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<'admin' | 'kasir' | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Memoize client to ensure it's only created once per scope
  const client = useMemo(() => {
    return scope ? createSupabaseClientWithKey(`pos-${scope}`) : supabase;
  }, [scope]);

  useEffect(() => {
    const fetchProfile = async (userId: string, user: User) => {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('id, role, full_name')
          .eq('id', userId)
          .single();
        
        if (!error && data) {
          setProfile(data);
          setRole(data.role);
          console.log('✓ Profile loaded from database:', data.role);
        } else {
          console.warn('⚠ Failed to fetch profile from database, using fallback');
          // Fallback: use metadata if profiles table fails
          const fallbackRole = user.user_metadata?.role || user.app_metadata?.role;
          if (fallbackRole === 'admin' || fallbackRole === 'kasir') {
            setProfile({
              id: userId,
              role: fallbackRole,
              full_name: user.user_metadata?.full_name || null
            });
            setRole(fallbackRole);
            console.log('✓ Using fallback role from metadata:', fallbackRole);
          } else {
            setProfile(null);
            setRole(null);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfile(null);
        setRole(null);
      }
    };

    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const fallbackRole = session.user.user_metadata?.role || session.user.app_metadata?.role;
        if (fallbackRole === 'admin' || fallbackRole === 'kasir') {
          setProfile({
            id: session.user.id,
            role: fallbackRole,
            full_name: session.user.user_metadata?.full_name || null,
          });
          setRole(fallbackRole);
        }
        fetchProfile(session.user.id, session.user);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const fallbackRole = session.user.user_metadata?.role || session.user.app_metadata?.role;
        if (fallbackRole === 'admin' || fallbackRole === 'kasir') {
          setProfile({
            id: session.user.id,
            role: fallbackRole,
            full_name: session.user.user_metadata?.full_name || null,
          });
          setRole(fallbackRole);
        }
        fetchProfile(session.user.id, session.user);
      } else {
        setProfile(null);
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error as unknown as Error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await client.auth.signUp({ email, password });
      if (error) throw error as unknown as Error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await client.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
