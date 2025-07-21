import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        template: {
          select: {
            name: true,
            type: true,
            description: true,
            variables: true,
          },
        },
      },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json(notification);

  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      status,
      readAt,
      priority,
      expiresAt,
      actionData,
    } = body;

    // Prepare update data
    const updateData: any = {};

    if (status !== undefined) {
      updateData.status = status;
      
      // Set readAt timestamp when marking as read
      if (status === 'read' && !existingNotification.readAt) {
        updateData.readAt = new Date();
      }
    }

    if (readAt !== undefined) {
      updateData.readAt = readAt ? new Date(readAt) : null;
    }

    if (priority !== undefined) {
      updateData.priority = priority;
    }

    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    if (actionData !== undefined) {
      updateData.actionData = actionData;
    }

    const notification = await prisma.notification.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(notification);

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    await prisma.notification.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 