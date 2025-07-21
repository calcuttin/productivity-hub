import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { importUserData, validateImportData, type ImportOptions } from '@/lib/data-import';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { data, options } = body;

    // Validate the import data
    const validation = validateImportData(data);
    if (!validation.valid) {
      return NextResponse.json({
        error: 'Invalid import data',
        details: validation.errors
      }, { status: 400 });
    }

    // Set up import options
    const importOptions: ImportOptions = {
      importProjects: options?.importProjects !== false,
      importTodos: options?.importTodos !== false,
      importResearch: options?.importResearch !== false,
      importWorkouts: options?.importWorkouts !== false,
      importTimeSessions: options?.importTimeSessions !== false,
      importPreferences: options?.importPreferences !== false,
      importNotifications: options?.importNotifications || false,
      conflictResolution: options?.conflictResolution || 'skip',
      dateRange: options?.dateRange ? {
        from: options.dateRange.from ? new Date(options.dateRange.from) : undefined,
        to: options.dateRange.to ? new Date(options.dateRange.to) : undefined
      } : undefined
    };

    // Perform the import
    const result = await importUserData(session.user.id!, data, importOptions);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: 'Import failed' },
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

    // Return import validation info
    return NextResponse.json({
      supportedFormats: ['json'],
      maxFileSize: '10MB',
      supportedDataTypes: [
        'projects',
        'todos', 
        'research',
        'workouts',
        'timeSessions',
        'preferences',
        'notifications'
      ],
      conflictResolutionOptions: ['skip', 'overwrite', 'merge']
    });

  } catch (error) {
    console.error('Error getting import info:', error);
    return NextResponse.json(
      { error: 'Failed to get import information' },
      { status: 500 }
    );
  }
} 