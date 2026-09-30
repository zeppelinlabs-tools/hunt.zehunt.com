import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;

    // Get user preferences (stored in JSONB column or separate table)
    const result = await query(
      `SELECT skills, technologies FROM users WHERE id = $1`,
      [user.id]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const preferences = {
      build: result[0].skills || [],
      problems: [], // Can be extended
      tools: result[0].technologies || [],
    };

    return NextResponse.json({ success: true, preferences });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch preferences', details: error.message },
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
    const { build, problems, tools } = body;

    // Update user preferences
    await query(
      `UPDATE users
       SET skills = $1, technologies = $2, updated_at = NOW()
       WHERE id = $3`,
      [build || [], tools || [], user.id]
    );

    return NextResponse.json({ success: true, message: 'Preferences updated' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update preferences', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request); // Same as POST for now
}
