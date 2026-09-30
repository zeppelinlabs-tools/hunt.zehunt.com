import { NextResponse } from 'next/server';
import { UserModel, CreateUserInput } from '@/lib/models/user';
import { query } from '@/lib/db';
import { createAuthCookie } from '@/lib/middleware/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateUserInput;

    // Validate required fields
    if (!body.email || !body.username || !body.password || !body.display_name) {
      return NextResponse.json(
        { success: false, error: 'Email, username, display name, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingEmail = await UserModel.findByEmail(body.email);
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      );
    }

    const existingUsername = await UserModel.findByUsername(body.username);
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Create user
    const user = await UserModel.create(body);

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
    console.error('Sign up error:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
