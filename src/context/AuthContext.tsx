import { User } from '@supabase/supabase-js';
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';

interface AuthValue {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      // 1. ¿Ya hay una sesión guardada en el dispositivo?
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        setUser(data.session.user);
        setLoading(false);
        return;
      }
      // 2. Si no, crea un usuario anónimo.
      const { data: anon, error: err } = await supabase.auth.signInAnonymously();
      if (!active) return;
      if (err) setError(err.message);
      else setUser(anon.user);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(() => ({ user, loading, error }), [user, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}