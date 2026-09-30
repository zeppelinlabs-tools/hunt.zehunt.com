import { NextResponse } from 'next/server';
import { createAuthSession, findUserByEmail, readAuthStore, toPublicUser, UserRecord, writeAuthStore } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      username?: string;
      password?: string;
      display_name?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const username = body.username?.trim();
    const password = body.password ?? '';

    if (!email || !username || !password) {
      return NextResponse.json({ success: false, error: 'Email, username and password are required.' }, { status: 400 });
    }

    const store = readAuthStore();

    if (findUserByEmail(store, email)) {
      return NextResponse.json({ success: false, error: 'Email already in use.' }, { status: 409 });
    }

    if (store.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Username already in use.' }, { status: 409 });
    }

    const newUser: UserRecord = {
      id: `usr_${Date.now()}`,
      email,
      username,
      display_name: body.display_name?.trim() || username,
      role: 'developer',
      password,
      status: 'active',
      bio: '',
      skills: [],
      technologies: [],
      website: '',
      github: '',
      stats: {
        problems_count: 0,
        solutions_count: 0,
        confirmations_count: 0,
        helpful_votes: 0,
        connected_agents_count: 0,
      },
      bookmarks: [],
      onboarding: {
        build: [],
        problems: [],
        tools: [],
      },
    };

    store.users.push(newUser);

    const session = createAuthSession(newUser);
    store.authSessions.push(session);
    writeAuthStore(store);

    const response = NextResponse.json({ success: true, user: toPublicUser(newUser) }, { status: 201 });
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
