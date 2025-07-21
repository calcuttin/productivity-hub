import { NextRequest, NextResponse } from 'next/server';
import { processAllResearchAlerts } from '@/lib/research-alerts';

// GET /api/cron/research-alerts - Automated cron endpoint for processing research alerts
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron request for research alerts');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Starting automated research alert processing...');
    
    // Process research alerts for all users
    const results = await processAllResearchAlerts();
    
    const executionTime = Date.now() - startTime;
    
    console.log('Research alert processing completed:', {
      processed: results.processed,
      errors: results.errors,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Research alerts processed successfully',
      processed: results.processed,
      errors: results.errors,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString(),
      details: results.details
    });
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    console.error('Error in research alert cron job:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      executionTimeMs: executionTime,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process research alerts',
        message: error instanceof Error ? error.message : String(error),
        executionTimeMs: executionTime,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/cron/research-alerts - Alternative endpoint for manual triggering
export async function POST(request: NextRequest) {
  return GET(request); // Reuse the same logic
} 