import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, error: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setState({ user: null, loading: false, error: error.message });
        return;
      }

      if (session?.user) {
        setState({ user: session.user, loading: false, error: null });
      } else {
        // Sign in anonymously
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (error) {
            setState({ user: null, loading: false, error: error.message });
          } else {
            setState({ user: data.user, loading: false, error: null });
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({ ...prev, user: session?.user ?? null }));
    });

    return () => subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
