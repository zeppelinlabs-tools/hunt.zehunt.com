import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;

    // Get all active sessions for the user
    const result = await query(
      `SELECT id, device_info, ip_address, user_agent, created_at, expires_at
       FROM auth_sessions
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC`,
      [user.id]
    );

    // Get current session token from cookie
    const cookies = request.headers.get('cookie') || '';
    const sessionToken = cookies.split(';').find(c => c.trim().startsWith('hunt_session='))?.split('=')[1];

    const sessions = result.map((session: any) => ({
      id: session.id,
      device: session.device_info || 'Unknown Device',
      ip: session.ip_address || 'Unknown IP',
      type: session.user_agent?.includes('curl') ? 'API/Agent' : 'Browser',
      is_current: session.id === sessionToken,
      last_seen: new Date(session.created_at).toLocaleString(),
    }));

    return NextResponse.json({ success: true, sessions });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch sessions', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'revoke-all') {
      // Get current session token
      const cookies = request.headers.get('cookie') || '';
      const sessionToken = cookies.split(';').find(c => c.trim().startsWith('hunt_session='))?.split('=')[1];

      // Delete all sessions except current
      await query(
        `DELETE FROM auth_sessions
         WHERE user_id = $1 AND id != $2`,
        [user.id, sessionToken]
      );

      return NextResponse.json({ success: true, message: 'All other sessions revoked' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to revoke sessions', details: error.message },
      { status: 500 }
    );
  }
}
