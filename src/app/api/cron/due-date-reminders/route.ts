import { NextRequest, NextResponse } from 'next/server';
import { processAllDueDateReminders } from '@/lib/due-date-reminders';

// This endpoint is designed to be called by cron services like Vercel Cron Jobs
// or external schedulers like GitHub Actions
export async function GET(request: NextRequest) {
  try {
    // Check for cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔔 Starting scheduled due date reminder processing...');
    const startTime = Date.now();

    // Process all due date reminders
    const results = await processAllDueDateReminders();

    const endTime = Date.now();
    const duration = endTime - startTime;

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results,
    };

    console.log('✅ Scheduled due date reminder processing completed:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in scheduled due date reminder processing:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Also allow POST requests for flexibility
export async function POST(request: NextRequest) {
  return GET(request);
} 