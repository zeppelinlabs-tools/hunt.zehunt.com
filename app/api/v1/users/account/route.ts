import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { UserModel } from '@/lib/models/user';

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;

    // Mark user as deleted (soft delete)
    await UserModel.updateStatus(user.id, 'deleted', 'User requested account deletion');

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account marked as deleted',
    });

    response.cookies.set('hunt_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete account', details: error.message },
      { status: 500 }
    );
  }
}
