import { NextRequest, NextResponse } from 'next/server';
import { ProblemModel, CreateProblemInput } from '@/lib/models/problem';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const searchQuery = searchParams.get('q') || undefined;
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : undefined;
    const status = searchParams.get('status') as any || undefined;
    const authorId = searchParams.get('author_id') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await ProblemModel.search({
      query: searchQuery,
      tags,
      status,
      author_id: authorId,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      ...result,
      page: Math.floor(offset / limit) + 1,
      per_page: limit,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Get problems error:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    if ('error' in auth) {
      return auth.error;
    }

    const body = await request.json() as Omit<CreateProblemInput, 'author_id'>;

    // Validate required fields
    if (!body.title || !body.context || !body.environment || !body.symptoms || !body.tags) {
      return NextResponse.json(
        { success: false, error: 'Title, context, environment, symptoms, and tags are required' },
        { status: 400 }
      );
    }

    const problem = await ProblemModel.create({
      ...body,
      author_id: auth.user.id,
    });

    return NextResponse.json({
      success: true,
      problem,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Create problem error:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
