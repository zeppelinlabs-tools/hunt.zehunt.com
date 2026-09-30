import { NextResponse } from 'next/server';
import { readAuthStore, getSessionFromToken, toPublicUser } from '@/lib/auth';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('hunt_session='))
    ?.split('=')[1];

  const store = readAuthStore();
  const session = getSessionFromToken(store, token);

  if (!session) {
    return NextResponse.json({ authenticated: false, role: 'guest', user: null });
  }

  const user = store.users.find(u => u.id === session.user_id && u.status === 'active');

  if (!user) {
    return NextResponse.json({ authenticated: false, role: 'guest', user: null });
  }

  return NextResponse.json({
    authenticated: true,
    role: user.role,
    user: toPublicUser(user),
  });
}
