import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/auth';
import { UserModel } from '@/lib/models/user';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ('error' in authResult) return authResult.error;

    const users = await UserModel.findAll();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if ('error' in authResult) return authResult.error;

    const body = await request.json();
    const { action, userId, role, status, reason } = body;

    if (action === 'update_role') {
      const updated = await UserModel.updateRole(userId, role);
      return NextResponse.json({ success: true, user: updated });
    }

    if (action === 'update_status') {
      const updated = await UserModel.updateStatus(userId, status, reason);
      return NextResponse.json({ success: true, user: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to perform action', details: error.message },
      { status: 500 }
    );
  }
}
