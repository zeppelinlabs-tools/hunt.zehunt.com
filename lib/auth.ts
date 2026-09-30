import fs from 'fs';
import path from 'path';

export type PlatformRole = 'guest' | 'developer' | 'admin';

export interface UserRecord {
  id: string;
  email: string;
  username: string;
  display_name: string;
  role: Exclude<PlatformRole, 'guest'>;
  password: string;
  status: 'active' | 'restricted' | 'deleted' | 'disabled';
  bio?: string;
  skills?: string[];
  technologies?: string[];
  website?: string;
  github?: string;
  stats?: Record<string, number>;
  bookmarks?: { id: number; title: string; category: string }[];
  onboarding?: Record<string, string[]>;
  restriction_reason?: string;
  restricted_at?: string;
}

export interface DeviceSessionRecord {
  id: string;
  user_id: string;
  device: string;
  ip: string;
  type: string;
  scope?: string;
  is_current: boolean;
  last_seen: string;
}

export interface AuthSessionRecord {
  token: string;
  user_id: string;
  role: Exclude<PlatformRole, 'guest'>;
  created_at: string;
  expires_at: string;
}

export interface AuthStore {
  users: UserRecord[];
  sessions: DeviceSessionRecord[];
  authSessions: AuthSessionRecord[];
}

const userFilePath = path.join(process.cwd(), 'data', 'users.json');

export function readAuthStore(): AuthStore {
  try {
    const parsed = JSON.parse(fs.readFileSync(userFilePath, 'utf-8')) as Partial<AuthStore>;
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      authSessions: parsed.authSessions ?? [],
    };
  } catch {
    return { users: [], sessions: [], authSessions: [] };
  }
}

export function writeAuthStore(store: AuthStore) {
  fs.writeFileSync(userFilePath, JSON.stringify(store, null, 2), 'utf-8');
}

export function toPublicUser(user: UserRecord) {
  const { password, ...safe } = user;
  return safe;
}

export function findUserByEmail(store: AuthStore, email: string) {
  return store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function createAuthSession(user: UserRecord): AuthSessionRecord {
  const now = new Date();
  const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7);
  return {
    token: crypto.randomUUID(),
    user_id: user.id,
    role: user.role,
    created_at: now.toISOString(),
    expires_at: expires.toISOString(),
  };
}

export function getSessionFromToken(store: AuthStore, token: string | undefined) {
  if (!token) return null;
  const found = store.authSessions.find(s => s.token === token);
  if (!found) return null;
  const expired = new Date(found.expires_at).getTime() < Date.now();
  if (expired) return null;
  return found;
}

export function removeSessionToken(store: AuthStore, token: string | undefined) {
  if (!token) return store;
  return {
    ...store,
    authSessions: store.authSessions.filter(s => s.token !== token),
  };
}
