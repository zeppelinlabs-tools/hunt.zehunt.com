import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, clearAuthCookie } from '@/lib/middleware/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if ('error' in auth) {
      return auth.error;
    }

    // Delete session from database
    await query(
      'DELETE FROM auth_sessions WHERE id = $1',
      [auth.session.id]
    );

    // Return response with cleared cookie
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully',
    });

    const cookie = clearAuthCookie();
    response.cookies.set(cookie);

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Sign out error:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
