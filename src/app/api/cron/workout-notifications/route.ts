import { NextRequest, NextResponse } from 'next/server';
import { processAllWorkoutNotifications } from '@/lib/workout-notifications';

// GET /api/cron/workout-notifications - Automated cron endpoint for processing workout notifications
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request for workout notifications');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Starting automated workout notification processing...');
    
    // Process workout notifications for all users
    const results = await processAllWorkoutNotifications();
    
    const executionTime = Date.now() - startTime;
    
    console.log('Workout notification processing completed:', {
      processed: results.processed,
      errors: results.errors,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Workout notifications processed successfully',
      processed: results.processed,
      errors: results.errors,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString(),
      details: results.details
    });
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error('Error in workout notification cron job:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process workout notifications',
        message: error instanceof Error ? error.message : String(error),
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/cron/workout-notifications - Alternative endpoint for manual triggering
export async function POST(request: NextRequest) {
  return GET(request); // Reuse the same logic
} 