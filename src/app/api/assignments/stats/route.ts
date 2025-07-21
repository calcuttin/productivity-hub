import { NextResponse } from 'next/server';
import { AssignmentAutomation } from '@/lib/automation';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();
    const stats = await AssignmentAutomation.getDashboardStats(user.id);
    return NextResponse.json(stats);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error("Failed to fetch assignment stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch assignment stats", error: (error as Error).message },
      { status: 500 }
    );
  }
} 