import { NextRequest, NextResponse } from 'next/server';
import { query } from '../db';

export interface AuthSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: 'developer' | 'admin';
  status: string;
}

export async function getSessionFromToken(token: string): Promise<AuthSession | null> {
  const results = await query<AuthSession>(
    'SELECT * FROM auth_sessions WHERE token = $1 AND expires_at > NOW()',
    [token]
  );
  return results[0] || null;
}

export async function getUserFromSession(sessionId: string): Promise<AuthUser | null> {
  const results = await query<AuthUser>(
    `SELECT u.id, u.email, u.username, u.display_name, u.avatar_url, u.role, u.status 
     FROM users u
     INNER JOIN auth_sessions s ON u.id = s.user_id
     WHERE s.id = $1 AND u.status = 'active'`,
    [sessionId]
  );
  return results[0] || null;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Try cookie first
  const cookieToken = request.cookies.get('hunt_session')?.value;
  if (cookieToken) return cookieToken;

  // Try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try custom header
  const customHeader = request.headers.get('x-hunt-api-key');
  if (customHeader) return customHeader;

  return null;
}

export async function requireAuth(request: NextRequest): Promise<
  | { error: NextResponse; user?: undefined; session?: undefined }
  | { user: AuthUser; session: AuthSession; error?: undefined }
> {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  const session = await getSessionFromToken(token);
  
  if (!session) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Invalid or expired session' },
        { status: 401 }
      ),
    };
  }

  const user = await getUserFromSession(session.id);
  
  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'User not found or inactive' },
        { status: 403 }
      ),
    };
  }

  return { user, session };
}

export async function requireAdmin(request: NextRequest): Promise<
  | { error: NextResponse; user?: undefined; session?: undefined }
  | { user: AuthUser; session: AuthSession; error?: undefined }
> {
  const auth = await requireAuth(request);
  
  if ('error' in auth) {
    return auth;
  }

  if (auth.user.role !== 'admin') {
    return {
      error: NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return auth;
}

export function createAuthCookie(token: string, maxAge: number = 60 * 60 * 24 * 7) {
  return {
    name: 'hunt_session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  };
}

export function clearAuthCookie() {
  return {
    name: 'hunt_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 0,
    path: '/',
  };
}
