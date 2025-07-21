import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user preferences
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          browserNotifications: true,
          reminderNotifications: true,
          weightUnit: 'lb',
          heightUnit: 'ft',
          timezone: 'America/New_York',
          theme: 'system',
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate the request body
    const {
      emailNotifications,
      browserNotifications,
      reminderNotifications,
      weightUnit,
      heightUnit,
      timezone,
      theme,
    } = body;

    // Update or create user preferences
    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        emailNotifications: emailNotifications ?? true,
        browserNotifications: browserNotifications ?? true,
        reminderNotifications: reminderNotifications ?? true,
        weightUnit: weightUnit ?? 'lb',
        heightUnit: heightUnit ?? 'ft',
        timezone: timezone ?? 'America/New_York',
        theme: theme ?? 'system',
      },
      create: {
        userId: session.user.id,
        emailNotifications: emailNotifications ?? true,
        browserNotifications: browserNotifications ?? true,
        reminderNotifications: reminderNotifications ?? true,
        weightUnit: weightUnit ?? 'lb',
        heightUnit: heightUnit ?? 'ft',
        timezone: timezone ?? 'America/New_York',
        theme: theme ?? 'system',
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 