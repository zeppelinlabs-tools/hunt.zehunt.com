import { NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { query } from '@/lib/db';
import { createAuthCookie } from '@/lib/middleware/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify user credentials
    const user = await UserModel.verifyPassword(email, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Account is not active', status: user.status },
        { status: 403 }
      );
    }

    // Create auth session
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    await query(
      `INSERT INTO auth_sessions (user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [user.id, token, expiresAt]
    );

    // Return response with cookie
    const response = NextResponse.json({
      success: true,
      user: UserModel.toPublic(user),
      token,
    });

    const cookie = createAuthCookie(token);
    response.cookies.set(cookie);

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Sign in error:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
