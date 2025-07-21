import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendPushNotificationToUser, createNotificationPayload } from '@/lib/push-notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create a test notification payload
    const testPayload = createNotificationPayload('general', {
      title: 'Test Notification',
      message: 'This is a test push notification from your Notion App!',
      timestamp: new Date().toISOString()
    });

    // Send the test notification
    const result = await sendPushNotificationToUser(session.user.id!, testPayload);

    if (result.sent > 0) {
      return NextResponse.json({
        success: true,
        message: `Test notification sent successfully to ${result.sent} device(s)`,
        result
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No active push subscriptions found',
        result
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error sending test push notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
} 