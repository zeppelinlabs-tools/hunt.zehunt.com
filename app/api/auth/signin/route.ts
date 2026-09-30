import { NextResponse } from 'next/server';
import { createAuthSession, findUserByEmail, readAuthStore, toPublicUser, writeAuthStore } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const email = body.email?.trim();
    const password = body.password ?? '';

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const store = readAuthStore();
    const user = findUserByEmail(store, email);

    if (!user || user.password !== password || user.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const session = createAuthSession(user);
    store.authSessions.push(session);
    writeAuthStore(store);

    const response = NextResponse.json({ success: true, user: toPublicUser(user) });
    response.cookies.set('hunt_session', session.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      expires: new Date(session.expires_at),
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
