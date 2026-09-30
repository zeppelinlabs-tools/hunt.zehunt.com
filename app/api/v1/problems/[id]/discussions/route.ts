import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const problemId = params.id;

    // Get all discussions for this problem
    const result = await query(
      `SELECT d.id, d.content, d.parent_id, d.created_at,
              u.id as author_id, u.username, u.display_name, u.avatar_url
       FROM discussions d
       JOIN users u ON d.author_id = u.id
       WHERE d.problem_id = $1
       ORDER BY d.created_at ASC`,
      [problemId]
    );

    return NextResponse.json({ success: true, discussions: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch discussions', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;
    const params = await context.params;
    const problemId = params.id;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Create discussion comment
    const result = await query(
      `INSERT INTO discussions (problem_id, author_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, parent_id, created_at`,
      [problemId, user.id, content.trim(), parentId || null]
    );

    const discussion = {
      ...result[0],
      author_id: user.id,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
    };

    return NextResponse.json({ success: true, discussion });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create discussion', details: error.message },
      { status: 500 }
    );
  }
}
