import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const user = authResult.user;

    // Get user's analytics data
    const [
      problemsCount,
      solutionsCount,
      helpfulVotes,
      confirmations,
      recentActivity,
    ] = await Promise.all([
      query(
        `SELECT COUNT(*) as count FROM problems WHERE author_id = $1`,
        [user.id]
      ),
      query(
        `SELECT COUNT(*) as count FROM solutions WHERE author_id = $1`,
        [user.id]
      ),
      query(
        `SELECT COALESCE(SUM(helpful_votes), 0) as total
         FROM problems WHERE author_id = $1`,
        [user.id]
      ),
      query(
        `SELECT COUNT(*) as count FROM solution_confirmations WHERE user_id = $1`,
        [user.id]
      ),
      query(
        `SELECT type, action, created_at
         FROM activity_logs
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [user.id]
      ),
    ]);

    const analytics = {
      problems_posted: parseInt(problemsCount[0].count),
      solutions_contributed: parseInt(solutionsCount[0].count),
      helpful_votes_received: parseInt(helpfulVotes[0].total),
      confirmations_given: parseInt(confirmations[0].count),
      recent_activity: recentActivity,
    };

    return NextResponse.json({ success: true, analytics });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
