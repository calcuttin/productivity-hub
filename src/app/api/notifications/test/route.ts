import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createNotification } from '@/lib/notifications';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    // Create sample notifications for testing
    const sampleNotifications = [
      {
        title: 'Project Due Soon',
        message: 'Your assignment "Final Project" is due in 2 days',
        type: 'due_date',
        priority: 'high',
        entityType: 'project',
        actionUrl: '/projects'
      },
      {
        title: '💪 Workout Reminder',
        message: 'Time for your daily workout! Let\'s get moving.',
        type: 'workout',
        priority: 'medium',
        entityType: 'workout',
        actionUrl: '/workout'
      },
      {
        title: '📖 Research Progress',
        message: 'You haven\'t updated your research in 3 days. Time to make some progress!',
        type: 'research',
        priority: 'medium',
        entityType: 'research',
        actionUrl: '/research'
      },
      {
        title: '🏆 Achievement Unlocked!',
        message: 'Congratulations! You\'ve completed 5 projects this month.',
        type: 'achievement',
        priority: 'medium',
        entityType: 'general',
        actionUrl: '/streaks'
      },
      {
        title: '⏰ Daily Reminder',
        message: 'Don\'t forget to review your todos for today.',
        type: 'reminder',
        priority: 'low',
        entityType: 'todo',
        actionUrl: '/todos'
      }
    ];

    const createdNotifications = [];

    for (const notificationData of sampleNotifications) {
      const notification = await createNotification({
        userId: user.id,
        ...notificationData
      });
      createdNotifications.push(notification);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdNotifications.length} test notifications`,
      notifications: createdNotifications
    });

  } catch (error) {
    console.error('Error creating test notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 