import { NextResponse } from 'next/server';
import { readAuthStore, removeSessionToken, writeAuthStore } from '@/lib/auth';

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('hunt_session='))
    ?.split('=')[1];

  const store = readAuthStore();
  const nextStore = removeSessionToken(store, token);
  writeAuthStore(nextStore);

  const response = NextResponse.json({ success: true });
  response.cookies.set('hunt_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    expires: new Date(0),
  });

  return response;
}
