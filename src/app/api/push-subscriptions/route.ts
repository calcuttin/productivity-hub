import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
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
      include: {
        pushSubscriptions: {
          where: { isActive: true },
          orderBy: { lastUsed: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscriptions = user.pushSubscriptions.map((sub: any) => ({
      id: sub.id,
      endpoint: sub.endpoint,
      userAgent: sub.userAgent,
      lastUsed: sub.lastUsed,
      createdAt: sub.createdAt
    }));

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching push subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription: subscriptionData, userAgent } = await request.json();

    if (!subscriptionData?.endpoint || !subscriptionData?.keys?.p256dh || !subscriptionData?.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for existing subscription
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: {
        userId_endpoint: {
          userId: user.id,
          endpoint: subscriptionData.endpoint
        }
      }
    });

    let subscription;
    if (existingSubscription) {
      // Update existing subscription
      subscription = await prisma.pushSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
          userAgent: userAgent || null,
          isActive: true,
          lastUsed: new Date()
        }
      });
    } else {
      // Create new subscription
      subscription = await prisma.pushSubscription.create({
        data: {
          userId: user.id,
          endpoint: subscriptionData.endpoint,
          p256dh: subscriptionData.keys.p256dh,
          auth: subscriptionData.keys.auth,
          userAgent: userAgent || null,
          isActive: true
        }
      });
    }

    // Update notification settings to enable push notifications
    const settings = await prisma.notificationSettings.upsert({
      where: { userId: user.id },
      update: {
        pushNotifications: true,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        emailNotifications: true,
        pushNotifications: true,
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00'
      }
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        endpoint: subscription.endpoint,
        userAgent: subscription.userAgent,
        createdAt: subscription.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating push subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');
    const endpoint = searchParams.get('endpoint');

    if (!subscriptionId && !endpoint) {
      return NextResponse.json(
        { error: 'Subscription ID or endpoint required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let whereClause;
    if (subscriptionId) {
      whereClause = { id: subscriptionId, userId: user.id };
    } else {
      whereClause = { 
        userId_endpoint: {
          userId: user.id,
          endpoint: endpoint!
        }
      };
    }

    const subscription = await prisma.pushSubscription.findUnique({
      where: whereClause
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Deactivate instead of deleting to maintain history
    await prisma.pushSubscription.update({
      where: { id: subscription.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 