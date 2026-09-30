import { NextRequest, NextResponse } from 'next/server';
import { SolutionModel, ProblemModel, CreateSolutionInput } from '@/lib/models/problem';
import { requireAuth } from '@/lib/middleware/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const solutions = await SolutionModel.findByProblemId(id);

    // Get confirmations for each solution
    const solutionsWithConfirmations = await Promise.all(
      solutions.map(async (solution) => {
        const confirmations = await SolutionModel.getConfirmations(solution.id);
        return { ...solution, confirmations };
      })
    );

    return NextResponse.json({
      success: true,
      solutions: solutionsWithConfirmations,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Get solutions error:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);

    if ('error' in auth) {
      return auth.error;
    }

    const { id: problemId } = await params;

    // Verify problem exists
    const problem = await ProblemModel.findById(problemId);
    if (!problem) {
      return NextResponse.json(
        { success: false, error: 'Problem not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as Omit<CreateSolutionInput, 'problem_id' | 'author_id'>;

    // Validate required fields
    if (!body.title || !body.explanation || !body.why_it_works) {
      return NextResponse.json(
        { success: false, error: 'Title, explanation, and why_it_works are required' },
        { status: 400 }
      );
    }

    const solution = await SolutionModel.create({
      ...body,
      problem_id: problemId,
      author_id: auth.user.id,
    });

    return NextResponse.json({
      success: true,
      solution,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Create solution error:', err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
