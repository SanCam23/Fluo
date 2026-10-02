import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useFinanceStore } from '../store/useFinanceStore';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: AuthError | Error | null; data?: any }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => Promise<void> | void;
  exitDemoMode: () => void;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | Error | null }>;
  deleteUserAccount: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fluo_demo_mode_active') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 1. Initial Session Retrieval
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[Auth] Error getting initial session:', error.message);
        }
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            setIsDemoMode(false);
            try {
              localStorage.removeItem('fluo_demo_mode_active');
            } catch {
              // Ignore localStorage errors
            }
          }
        }
      } catch (err) {
        console.error('[Auth] Failed to initialize auth session:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // 2. Active Subscription to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        setIsDemoMode(false);
        try {
          localStorage.removeItem('fluo_demo_mode_active');
        } catch {
          // Ignore localStorage errors
        }
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (!error && data.user) {
        setIsDemoMode(false);
        try {
          localStorage.removeItem('fluo_demo_mode_active');
        } catch {
          // Ignore localStorage errors
        }
      }
      return { error };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      return { error, data };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('[Auth] Error signing out:', err);
    } finally {
      setUser(null);
      setSession(null);
      setIsDemoMode(false);
      try {
        localStorage.removeItem('fluo_demo_mode_active');
      } catch {
        // Ignore localStorage errors
      }
    }
  };

  const enterDemoMode = async () => {
    setIsDemoMode(true);
    try {
      localStorage.setItem('fluo_demo_mode_active', 'true');
    } catch {
      // Ignore
    }
    await useFinanceStore.getState().loadDemoData();
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    try {
      localStorage.removeItem('fluo_demo_mode_active');
    } catch {
      // Ignore
    }
    useFinanceStore.getState().purgeUserData();
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const deleteUserAccount = async () => {
    try {
      if (user?.id) {
        // 1. Delete user transactions & investments from cloud tables
        try {
          await supabase.rpc('delete_user_account');
        } catch {
          // Fallback direct RLS cascade deletion
          await supabase.from('transactions').delete().eq('user_id', user.id);
          await supabase.from('investments').delete().eq('user_id', user.id);
          await supabase.from('source_accounts').delete().eq('user_id', user.id);
        }
      }
      return { error: null };
    } catch (err: any) {
      return { error: err as Error };
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isDemoMode,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      enterDemoMode,
      exitDemoMode,
      updatePassword,
      deleteUserAccount,
    }),
    [user, session, loading, isDemoMode]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
