import { NextResponse } from 'next/server';
import { getSessionFromToken, readAuthStore, writeAuthStore } from '@/lib/auth';

interface AuthActionPayload {
  action?: 'revoke_session' | 'delete_account';
  session_id?: string;
}

function getTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('hunt_session='))
    ?.split('=')[1];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AuthActionPayload;
    const token = getTokenFromRequest(request);

    const store = readAuthStore();
    const session = getSessionFromToken(store, token);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = store.users.find(u => u.id === session.user_id && u.status === 'active');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (body.action === 'revoke_session' && body.session_id) {
      store.sessions = store.sessions.filter(s => !(s.user_id === user.id && s.id === body.session_id));
      writeAuthStore(store);
      return NextResponse.json({ success: true, sessions: store.sessions.filter(s => s.user_id === user.id) });
    }

    if (body.action === 'delete_account') {
      user.status = 'deleted';
      store.sessions = store.sessions.filter(s => s.user_id !== user.id);
      store.authSessions = store.authSessions.filter(s => s.user_id !== user.id);
      writeAuthStore(store);

      const response = NextResponse.json({ success: true, message: 'Account status set to deleted.' });
      response.cookies.set('hunt_session', '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        expires: new Date(0),
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
