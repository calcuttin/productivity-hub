import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { syncToGoogleCalendar, importFromGoogleCalendar } from '@/lib/google-calendar';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { action, accessToken, options, calendarId } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google Calendar access token is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'sync_to_google':
        // Sync app events to Google Calendar
        const syncResults = await syncToGoogleCalendar(
          user.id!,
          accessToken,
          options || {}
        );
        
        return NextResponse.json({
          success: true,
          message: 'Successfully synced to Google Calendar',
          results: syncResults
        });

      case 'import_from_google':
        // Import events from Google Calendar
        const importResults = await importFromGoogleCalendar(
          user.id!,
          accessToken,
          calendarId || 'primary'
        );
        
        return NextResponse.json({
          success: true,
          message: 'Successfully imported from Google Calendar',
          results: importResults
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "sync_to_google" or "import_from_google"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Calendar sync failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Google Calendar access token is required' },
        { status: 400 }
      );
    }

    // Get user's calendars (this would require the GoogleCalendarService)
    // For now, return a placeholder response
    return NextResponse.json({
      success: true,
      calendars: [
        { id: 'primary', summary: 'Primary Calendar' },
        { id: 'work', summary: 'Work Calendar' },
        { id: 'personal', summary: 'Personal Calendar' }
      ]
    });
  } catch (error) {
    console.error('Calendar list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendars' },
      { status: 500 }
    );
  }
} 