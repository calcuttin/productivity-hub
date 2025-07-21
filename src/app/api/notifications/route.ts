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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'unread', 'read', 'dismissed', 'archived'
    const type = searchParams.get('type'); // 'reminder', 'due_date', 'achievement', etc.
    const priority = searchParams.get('priority'); // 'low', 'medium', 'high', 'urgent'
    const entityType = searchParams.get('entityType'); // 'project', 'todo', 'research', 'workout'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // Build filter conditions
    const where: any = {
      userId: user.id,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (priority) {
      where.priority = priority;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    // Filter out expired notifications unless explicitly requested
    if (!includeExpired) {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ];
    }

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        template: {
          select: {
            name: true,
            type: true,
            description: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.notification.count({ where });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        status: 'unread',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ],
      },
    });

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
      unreadCount,
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const body = await request.json();
    const {
      title,
      message,
      type,
      priority = 'medium',
      entityType,
      entityId,
      actionType,
      actionUrl,
      actionData,
      scheduledFor,
      expiresAt,
      templateId,
      groupId,
    } = body;

    // Validate required fields
    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Title, message, and type are required' },
        { status: 400 }
      );
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        priority,
        entityType,
        entityId,
        actionType,
        actionUrl,
        actionData,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        templateId,
        groupId,
        userId: user.id,
      },
      include: {
        template: {
          select: {
            name: true,
            type: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json(notification, { status: 201 });

  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 