import { NextRequest, NextResponse } from 'next/server';
import { ProblemModel } from '@/lib/models/problem';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const problem = await ProblemModel.getWithDetails(id);

    if (!problem) {
      return NextResponse.json(
        { success: false, error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await ProblemModel.incrementViewCount(id);

    return NextResponse.json({
      success: true,
      problem,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Get problem error:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);

    if ('error' in auth) {
      return auth.error;
    }

    const { id } = await params;
    const problem = await ProblemModel.findById(id);

    if (!problem) {
      return NextResponse.json(
        { success: false, error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (problem.author_id !== auth.user.id && auth.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Not authorized to edit this problem' },
        { status: 403 }
      );
    }

    const updates = await request.json();
    const updatedProblem = await ProblemModel.update(id, updates);

    return NextResponse.json({
      success: true,
      problem: updatedProblem,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Update problem error:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);

    if ('error' in auth) {
      return auth.error;
    }

    const { id } = await params;
    const problem = await ProblemModel.findById(id);

    if (!problem) {
      return NextResponse.json(
        { success: false, error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (problem.author_id !== auth.user.id && auth.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Not authorized to delete this problem' },
        { status: 403 }
      );
    }

    // Soft delete by archiving
    await ProblemModel.update(id, { status: 'archived' });

    return NextResponse.json({
      success: true,
      message: 'Problem archived successfully',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Delete problem error:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
