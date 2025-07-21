import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createSampleData, checkUserHasData, clearSampleData } from '@/lib/sample-data';

// POST /api/sample-data - Create sample data for the user
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { includeProjects, includeTodos, includeWorkouts, includeResearch } = body;

    // Check if user already has data
    const hasData = await checkUserHasData(user.id);
    if (hasData) {
      return NextResponse.json(
        { error: 'User already has data. Clear existing data first.' },
        { status: 400 }
      );
    }

    const results = await createSampleData({
      userId: user.id,
      includeProjects: includeProjects ?? true,
      includeTodos: includeTodos ?? true,
      includeWorkouts: includeWorkouts ?? true,
      includeResearch: includeResearch ?? true
    });

    return NextResponse.json({
      message: 'Sample data created successfully',
      results
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error creating sample data:', error);
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    );
  }
}

// GET /api/sample-data - Check if user has data
export async function GET() {
  try {
    const user = await requireAuth();
    const hasData = await checkUserHasData(user.id);

    return NextResponse.json({
      hasData,
      userId: user.id
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error checking user data:', error);
    return NextResponse.json(
      { error: 'Failed to check user data' },
      { status: 500 }
    );
  }
}

// DELETE /api/sample-data - Clear sample data
export async function DELETE() {
  try {
    const user = await requireAuth();
    await clearSampleData(user.id);

    return NextResponse.json({
      message: 'Sample data cleared successfully'
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error clearing sample data:', error);
    return NextResponse.json(
      { error: 'Failed to clear sample data' },
      { status: 500 }
    );
  }
} 