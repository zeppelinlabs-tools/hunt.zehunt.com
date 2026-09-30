'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

export type PlatformRole = 'guest' | 'developer' | 'admin';

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  display_name: string;
  role: 'developer' | 'admin';
  status: 'active' | 'deleted' | 'disabled';
}

export const MOCK_DEV_USER: SessionUser = {
  id: 'usr_dev_01',
  email: 'madnan@zehunt.com',
  username: 'madnan',
  display_name: 'Adnan Sultan',
  role: 'developer',
  status: 'active',
};

export const MOCK_ADMIN_USER: SessionUser = {
  id: 'usr_admin_01',
  email: 'admin@hunt.zehunt.com',
  username: 'admin',
  display_name: 'Hunt Admin',
  role: 'admin',
  status: 'active',
};

interface RoleContextValue {
  role: PlatformRole;
  user: SessionUser | null;
  loading: boolean;
  switchRole: (newRole: PlatformRole) => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  // Initialize with a default developer role or stored role to eliminate any blank loading state
  const [role, setRole] = useState<PlatformRole>('developer');
  const [user, setUser] = useState<SessionUser | null>(MOCK_DEV_USER);
  const [loading, setLoading] = useState(false);

  const switchRole = useCallback(async (newRole: PlatformRole) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hunt_role', newRole);
      }
      setRole(newRole);

      if (newRole === 'developer') {
        setUser(MOCK_DEV_USER);
        await fetch('/api/v1/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'madnan@zehunt.com', password: 'dev123' }),
        }).catch(() => {});
      } else if (newRole === 'admin') {
        setUser(MOCK_ADMIN_USER);
        await fetch('/api/v1/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@hunt.zehunt.com', password: 'admin123' }),
        }).catch(() => {});
      } else {
        setUser(null);
        await fetch('/api/v1/auth/signout', { method: 'POST' }).catch(() => {});
      }
    } catch (e) {
      console.error('Error switching role:', e);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (data?.authenticated && data?.user) {
        setUser(data.user);
        setRole(data.user.role);
        if (typeof window !== 'undefined') {
          localStorage.setItem('hunt_role', data.user.role);
        }
      } else {
        const savedRole = (typeof window !== 'undefined' && (localStorage.getItem('hunt_role') as PlatformRole)) || 'developer';
        if (savedRole === 'guest') {
          setUser(null);
          setRole('guest');
        } else if (savedRole === 'admin') {
          setUser(MOCK_ADMIN_USER);
          setRole('admin');
        } else {
          setUser(MOCK_DEV_USER);
          setRole('developer');
        }
      }
    } catch {
      // Fallback gracefully without blocking the UI
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = async () => {
    await switchRole('guest');
  };

  useEffect(() => {
    // Hydrate role preference immediately from localStorage
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('hunt_role') as PlatformRole | null;
      if (savedRole === 'admin') {
        setRole('admin');
        setUser(MOCK_ADMIN_USER);
      } else if (savedRole === 'guest') {
        setRole('guest');
        setUser(null);
      } else {
        setRole('developer');
        setUser(MOCK_DEV_USER);
      }
    }

    // Verify session with server asynchronously
    fetch('/api/v1/auth/me', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data?.authenticated && data?.user) {
          setUser(data.user);
          setRole(data.user.role);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = useMemo(
    () => ({ role, user, loading, switchRole, refreshSession, logout }),
    [role, user, loading, switchRole, refreshSession]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside RoleProvider');
  return ctx;
}
