import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { query } from '@/lib/db';

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
    const { voteType } = body; // 'up' or 'down'

    if (!['up', 'down'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // Check if user already voted
    const existing = await query(
      `SELECT id, vote_type FROM votes
       WHERE user_id = $1 AND target_id = $2 AND target_type = 'problem'`,
      [user.id, problemId]
    );

    if (existing.length > 0) {
      const existingVote = existing[0];
      
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same vote
        await query(
          `DELETE FROM votes WHERE id = $1`,
          [existingVote.id]
        );

        // Update problem count
        await query(
          `UPDATE problems
           SET helpful_votes = helpful_votes ${voteType === 'up' ? '-' : '+'} 1
           WHERE id = $1`,
          [problemId]
        );

        return NextResponse.json({ success: true, voted: false });
      } else {
        // Change vote
        await query(
          `UPDATE votes SET vote_type = $1 WHERE id = $2`,
          [voteType, existingVote.id]
        );

        // Update problem count (change by 2: remove old, add new)
        await query(
          `UPDATE problems
           SET helpful_votes = helpful_votes ${voteType === 'up' ? '+' : '-'} 2
           WHERE id = $1`,
          [problemId]
        );

        return NextResponse.json({ success: true, voted: true, voteType });
      }
    }

    // Add new vote
    await query(
      `INSERT INTO votes (user_id, target_id, target_type, vote_type)
       VALUES ($1, $2, 'problem', $3)`,
      [user.id, problemId, voteType]
    );

    // Update problem count
    await query(
      `UPDATE problems
       SET helpful_votes = helpful_votes ${voteType === 'up' ? '+' : '-'} 1
       WHERE id = $1`,
      [problemId]
    );

    return NextResponse.json({ success: true, voted: true, voteType });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to vote', details: error.message },
      { status: 500 }
    );
  }
}
