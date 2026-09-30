import { NextResponse } from 'next/server';
import { getSessionFromToken, readAuthStore, toPublicUser, writeAuthStore } from '@/lib/auth';

interface BookmarkRecord {
  id: number;
  title: string;
  category: string;
}

function getTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('hunt_session='))
    ?.split('=')[1];
}

export async function GET(request: Request) {
  const store = readAuthStore();
  const session = getSessionFromToken(store, getTokenFromRequest(request));

  if (!session) {
    return NextResponse.json({ success: true, user: null, sessions: [] });
  }

  const user = store.users.find(u => u.id === session.user_id && u.status === 'active');
  if (!user) {
    return NextResponse.json({ success: true, user: null, sessions: [] });
  }

  const sessions = store.sessions.filter(s => s.user_id === user.id);
  return NextResponse.json({ success: true, user: toPublicUser(user), sessions });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: 'bookmark' | 'onboarding';
      problem?: { id: number; title: string; category?: string };
      preferences?: Record<string, string[]>;
    };

    const store = readAuthStore();
    const session = getSessionFromToken(store, getTokenFromRequest(request));

    if (!session) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const user = store.users.find(u => u.id === session.user_id && u.status === 'active');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (body.action === 'bookmark' && body.problem) {
      const list = user.bookmarks ?? [];
      const exists = list.some((b: BookmarkRecord) => b.id === body.problem!.id);
      if (exists) {
        user.bookmarks = list.filter((b: BookmarkRecord) => b.id !== body.problem!.id);
      } else {
        user.bookmarks = [
          ...list,
          {
            id: body.problem.id,
            title: body.problem.title,
            category: body.problem.category || 'General',
          },
        ];
      }
      writeAuthStore(store);
      return NextResponse.json({ success: true, bookmarks: user.bookmarks });
    }

    if (body.action === 'onboarding') {
      user.onboarding = body.preferences ?? { build: [], problems: [], tools: [] };
      writeAuthStore(store);
      return NextResponse.json({ success: true, onboarding: user.onboarding });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
