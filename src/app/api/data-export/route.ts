import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { 
  exportUserData, 
  convertToCSV, 
  generateExportFilename, 
  getExportStats,
  type ExportOptions 
} from '@/lib/data-export';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const options: ExportOptions = {
      format: body.format || 'json',
      includeProjects: body.includeProjects !== false,
      includeTodos: body.includeTodos !== false,
      includeResearch: body.includeResearch !== false,
      includeWorkouts: body.includeWorkouts !== false,
      includeTimeSessions: body.includeTimeSessions !== false,
      includePreferences: body.includePreferences !== false,
      includeNotifications: body.includeNotifications || false,
      dateRange: body.dateRange ? {
        from: body.dateRange.from ? new Date(body.dateRange.from) : undefined,
        to: body.dateRange.to ? new Date(body.dateRange.to) : undefined
      } : undefined
    };

    // Get export statistics first
    const stats = await getExportStats(session.user.id!, options);

    // Perform the export
    const exportData = await exportUserData(session.user.id!, options);

    // Generate filename
    const filename = generateExportFilename(session.user.id!, options.format, options.dateRange);

    // Convert to appropriate format
    let content: string;
    let contentType: string;

    if (options.format === 'csv') {
      content = convertToCSV(exportData);
      contentType = 'text/csv';
    } else {
      content = JSON.stringify(exportData, null, 2);
      contentType = 'application/json';
    }

    // Return the file as a download
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': Buffer.byteLength(content).toString()
      }
    });

  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'stats') {
      // Return export statistics
      const options: ExportOptions = {
        format: 'json',
        includeProjects: searchParams.get('includeProjects') !== 'false',
        includeTodos: searchParams.get('includeTodos') !== 'false',
        includeResearch: searchParams.get('includeResearch') !== 'false',
        includeWorkouts: searchParams.get('includeWorkouts') !== 'false',
        includeTimeSessions: searchParams.get('includeTimeSessions') !== 'false',
        includePreferences: searchParams.get('includePreferences') !== 'false',
        includeNotifications: searchParams.get('includeNotifications') === 'true'
      };

      const stats = await getExportStats(session.user.id!, options);
      return NextResponse.json(stats);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error getting export stats:', error);
    return NextResponse.json(
      { error: 'Failed to get export statistics' },
      { status: 500 }
    );
  }
} 