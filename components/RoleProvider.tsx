'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

export type PlatformRole = 'guest' | 'developer' | 'admin';

interface SessionUser {
  id: string;
  email: string;
  username: string;
  display_name: string;
  role: 'developer' | 'admin';
  status: 'active' | 'deleted' | 'disabled';
}

interface RoleContextValue {
  role: PlatformRole;
  user: SessionUser | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<PlatformRole>('guest');
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await res.json();
      if (data?.authenticated && data?.user) {
        setUser(data.user);
        setRole(data.user.role);
      } else {
        setUser(null);
        setRole('guest');
      }
    } catch {
      setUser(null);
      setRole('guest');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    setUser(null);
    setRole('guest');
  };

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        if (data?.authenticated && data?.user) {
          setUser(data.user);
          setRole(data.user.role);
        } else {
          setUser(null);
          setRole('guest');
        }
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setRole('guest');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ role, user, loading, refreshSession, logout }),
    [role, user, loading, refreshSession]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside RoleProvider');
  return ctx;
}
