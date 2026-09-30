import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Get all unique topics (tags) with problem counts
    const result = await query(
      `SELECT 
        unnest(tags) as tag,
        COUNT(*) as problem_count
       FROM problems
       WHERE status = 'published' OR status = 'verified'
       GROUP BY tag
       ORDER BY problem_count DESC`,
      []
    );

    const topics = result.map((row: any) => ({
      name: row.tag,
      slug: row.tag.toLowerCase().replace(/\s+/g, '-'),
      count: parseInt(row.problem_count),
    }));

    return NextResponse.json({ success: true, topics });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch topics', details: error.message },
      { status: 500 }
    );
  }
}
