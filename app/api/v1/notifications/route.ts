import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;

    // Get all notifications for the user
    const result = await query(
      `SELECT id, type, title, message, link, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [user.id]
    );

    return NextResponse.json({ success: true, notifications: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;
    const body = await request.json();
    const { notificationId, action } = body;

    if (action === 'mark_read') {
      await query(
        `UPDATE notifications
         SET is_read = true
         WHERE id = $1 AND user_id = $2`,
        [notificationId, user.id]
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'mark_all_read') {
      await query(
        `UPDATE notifications
         SET is_read = true
         WHERE user_id = $1`,
        [user.id]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update notifications', details: error.message },
      { status: 500 }
    );
  }
}
