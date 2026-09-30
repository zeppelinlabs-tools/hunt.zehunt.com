import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const slug = params.slug;
    
    // Convert slug back to tag name (e.g., "next-js" -> "Next.js")
    // This is a simple conversion, you might need more sophisticated logic
    const tagPattern = slug.replace(/-/g, ' ');

    // Get problems with this tag
    const result = await query(
      `SELECT p.id, p.title, p.slug, p.status, p.tags, p.helpful_votes, p.view_count,
              p.created_at, p.context,
              u.username as author_username, u.display_name as author_name,
              COUNT(DISTINCT s.id) as solution_count
       FROM problems p
       JOIN users u ON p.author_id = u.id
       LEFT JOIN solutions s ON s.problem_id = p.id
       WHERE $1 = ANY(tags) AND (p.status = 'published' OR p.status = 'verified')
       GROUP BY p.id, u.username, u.display_name
       ORDER BY p.created_at DESC`,
      [tagPattern]
    );

    return NextResponse.json({
      success: true,
      topic: {
        name: tagPattern,
        slug: slug,
        problem_count: result.length,
      },
      problems: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch topic', details: error.message },
      { status: 500 }
    );
  }
}
