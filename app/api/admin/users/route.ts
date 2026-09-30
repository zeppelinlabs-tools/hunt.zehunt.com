import { NextResponse } from 'next/server';
import {
  readAuthStore,
  writeAuthStore,
  toPublicUser,
  getSessionFromToken,
} from '@/lib/auth';

function getTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('hunt_session='))
    ?.split('=')[1];
}

export async function GET(request: Request) {
  const store = readAuthStore();
  const session = getSessionFromToken(store, getTokenFromRequest(request));

  // If in local mock dev mode, allow admin access or check session
  const isAdmin = session?.role === 'admin' || request.headers.get('x-hunt-role') === 'admin';

  if (!isAdmin && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized administrative access' },
      { status: 403 }
    );
  }

  const publicUsers = store.users.map((u) => toPublicUser(u));
  return NextResponse.json({ success: true, users: publicUsers });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: 'restrict' | 'unrestrict';
      userId?: string;
      reason?: string;
    };

    const store = readAuthStore();
    const session = getSessionFromToken(store, getTokenFromRequest(request));
    const isAdmin = session?.role === 'admin' || request.headers.get('x-hunt-role') === 'admin';

    if (!isAdmin && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Administrative privileges required' },
        { status: 403 }
      );
    }

    if (!body.userId) {
      return NextResponse.json(
        { success: false, error: 'Target userId required' },
        { status: 400 }
      );
    }

    const targetUser = store.users.find((u) => u.id === body.userId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Safety rule: Cannot restrict an administrator
    if (targetUser.role === 'admin' && body.action === 'restrict') {
      return NextResponse.json(
        { success: false, error: 'Platform administrators cannot be restricted' },
        { status: 400 }
      );
    }

    if (body.action === 'restrict') {
      targetUser.status = 'restricted';
      targetUser.restriction_reason =
        body.reason || 'Restricted due to platform policy or moderation review';
      targetUser.restricted_at = new Date().toISOString();

      writeAuthStore(store);
      return NextResponse.json({
        success: true,
        message: `Account @${targetUser.username} restricted successfully`,
        user: toPublicUser(targetUser),
      });
    }

    if (body.action === 'unrestrict') {
      targetUser.status = 'active';
      delete targetUser.restriction_reason;
      delete targetUser.restricted_at;

      writeAuthStore(store);
      return NextResponse.json({
        success: true,
        message: `Account @${targetUser.username} restored to active status`,
        user: toPublicUser(targetUser),
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Admin users update error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
