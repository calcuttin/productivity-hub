import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create notification settings
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.notificationSettings.create({
        data: {
          userId: user.id,
        },
      });
    }

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      emailNotifications,
      browserNotifications,
      pushNotifications,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      quietHoursTimezone,
      projectReminders,
      todoReminders,
      workoutReminders,
      researchReminders,
      achievementAlerts,
      systemNotifications,
      defaultReminderTime,
      dueDateReminders,
      overdueReminders,
      maxDailyReminders,
      reminderFrequency,
      dailyDigestEnabled,
      weeklyDigestEnabled,
      digestTime,
    } = body;

    // Prepare update data (only include defined values)
    const updateData: any = {};

    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (browserNotifications !== undefined) updateData.browserNotifications = browserNotifications;
    if (pushNotifications !== undefined) updateData.pushNotifications = pushNotifications;
    if (quietHoursEnabled !== undefined) updateData.quietHoursEnabled = quietHoursEnabled;
    if (quietHoursStart !== undefined) updateData.quietHoursStart = quietHoursStart;
    if (quietHoursEnd !== undefined) updateData.quietHoursEnd = quietHoursEnd;
    if (quietHoursTimezone !== undefined) updateData.quietHoursTimezone = quietHoursTimezone;
    if (projectReminders !== undefined) updateData.projectReminders = projectReminders;
    if (todoReminders !== undefined) updateData.todoReminders = todoReminders;
    if (workoutReminders !== undefined) updateData.workoutReminders = workoutReminders;
    if (researchReminders !== undefined) updateData.researchReminders = researchReminders;
    if (achievementAlerts !== undefined) updateData.achievementAlerts = achievementAlerts;
    if (systemNotifications !== undefined) updateData.systemNotifications = systemNotifications;
    if (defaultReminderTime !== undefined) updateData.defaultReminderTime = defaultReminderTime;
    if (dueDateReminders !== undefined) updateData.dueDateReminders = dueDateReminders;
    if (overdueReminders !== undefined) updateData.overdueReminders = overdueReminders;
    if (maxDailyReminders !== undefined) updateData.maxDailyReminders = maxDailyReminders;
    if (reminderFrequency !== undefined) updateData.reminderFrequency = reminderFrequency;
    if (dailyDigestEnabled !== undefined) updateData.dailyDigestEnabled = dailyDigestEnabled;
    if (weeklyDigestEnabled !== undefined) updateData.weeklyDigestEnabled = weeklyDigestEnabled;
    if (digestTime !== undefined) updateData.digestTime = digestTime;

    // Update or create settings
    const settings = await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        ...updateData,
      },
    });

    return NextResponse.json(settings);

  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 