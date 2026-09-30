import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { query } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;
    const params = await context.params;
    const sessionId = params.id;

    // Delete specific session (ensure it belongs to the user)
    const result = await query(
      `DELETE FROM auth_sessions
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [sessionId, user.id]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Session revoked' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to revoke session', details: error.message },
      { status: 500 }
    );
  }
}
