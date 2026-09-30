import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Get technology stacks from problem environments
    // This aggregates the common technology combinations
    const result = await query(
      `SELECT 
        environment->>'framework' as framework,
        environment->>'runtime' as runtime,
        environment->>'database' as database,
        COUNT(*) as problem_count
       FROM problems
       WHERE status = 'published' OR status = 'verified'
       GROUP BY framework, runtime, database
       HAVING COUNT(*) > 0
       ORDER BY problem_count DESC
       LIMIT 50`,
      []
    );

    const stacks = result
      .filter((row: any) => row.framework || row.runtime || row.database)
      .map((row: any) => ({
        name: [row.framework, row.runtime, row.database].filter(Boolean).join(' + '),
        technologies: [row.framework, row.runtime, row.database].filter(Boolean),
        problem_count: parseInt(row.problem_count),
      }));

    return NextResponse.json({ success: true, stacks });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch stacks', details: error.message },
      { status: 500 }
    );
  }
}
