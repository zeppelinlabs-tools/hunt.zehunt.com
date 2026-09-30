import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;

    // Get all bookmarked problems for the user
    const result = await query(
      `SELECT p.id, p.title, p.slug, p.status, p.tags, p.created_at, p.helpful_votes,
              u.username as author_username, u.display_name as author_name
       FROM bookmarks b
       JOIN problems p ON b.problem_id = p.id
       JOIN users u ON p.author_id = u.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({ success: true, bookmarks: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;
    const body = await request.json();
    const { problemId, action } = body;

    if (action === 'add') {
      // Add bookmark
      await query(
        `INSERT INTO bookmarks (user_id, problem_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, problem_id) DO NOTHING`,
        [user.id, problemId]
      );
      return NextResponse.json({ success: true, bookmarked: true });
    }

    if (action === 'remove') {
      // Remove bookmark
      await query(
        `DELETE FROM bookmarks WHERE user_id = $1 AND problem_id = $2`,
        [user.id, problemId]
      );
      return NextResponse.json({ success: true, bookmarked: false });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update bookmark', details: error.message },
      { status: 500 }
    );
  }
}
