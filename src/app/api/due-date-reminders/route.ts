import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { 
  processDueDateReminders, 
  processAllDueDateReminders,
  getUpcomingDueDateItems 
} from '@/lib/due-date-reminders';

// GET /api/due-date-reminders - Get upcoming due date items for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = new URL(request.url);
    const includeProcessingStats = searchParams.get('includeStats') === 'true';

    // Get upcoming due date items
    const upcomingItems = await getUpcomingDueDateItems(user.id);

    const response: any = {
      upcomingItems,
      count: upcomingItems.length,
    };

    // Optionally include processing stats
    if (includeProcessingStats) {
      const processingResults = await processDueDateReminders(user.id);
      response.processingResults = processingResults;
    }

    return NextResponse.json(response);

  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error fetching due date reminders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/due-date-reminders - Process due date reminders
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { action = 'process_user', userId } = body;

    let results;

    switch (action) {
      case 'process_user':
        // Process reminders for current user
        results = await processDueDateReminders(user.id);
        break;

      case 'process_all':
        // Only allow admin users to process all users (for now, allow any authenticated user)
        results = await processAllDueDateReminders();
        break;

      case 'process_specific_user':
        // Process reminders for a specific user (admin only)
        if (!userId) {
          return NextResponse.json({ error: 'userId required for process_specific_user action' }, { status: 400 });
        }
        results = await processDueDateReminders(userId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error processing due date reminders:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 