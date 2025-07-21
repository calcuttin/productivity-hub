import webpush from 'web-push';
import { prisma } from './prisma';

// Configure web-push (you'll need to generate VAPID keys)
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI3Q3H7Uv8z1W3kzH7+L+H+0Q1HQ5P7sU4M0z7r7g8e8q2t+L3Hq0VKz4Y=',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'your-private-vapid-key-here'
};

// Configure web-push
webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'your-preferred-email@example.com'),
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  actionUrl?: string;
  notificationId?: string;
  entityType?: string;
  entityId?: string;
  priority?: 'low' | 'normal' | 'high';
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  data?: any;
}

/**
 * Send a push notification to a specific subscription
 */
export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      image: payload.image,
      actionUrl: payload.actionUrl || '/',
      notificationId: payload.notificationId,
      entityType: payload.entityType,
      entityId: payload.entityId,
      priority: payload.priority || 'normal',
      tag: payload.tag,
      requireInteraction: payload.requireInteraction || false,
      silent: payload.silent || false,
      actions: payload.actions || [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' }
      ],
      data: payload.data,
      timestamp: Date.now()
    });

    const result = await webpush.sendNotification(subscription, notificationPayload);
    console.log('Push notification sent successfully:', result.statusCode);
    return true;

  } catch (error: any) {
    console.error('Failed to send push notification:', error);
    
    // Handle specific errors
    if (error.statusCode === 410 || error.statusCode === 413) {
      // Subscription is invalid or expired
      console.log('Subscription is invalid, should be removed:', subscription.endpoint);
      return false;
    }
    
    return false;
  }
}

/**
 * Send push notification to a user by their ID
 */
export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pushSubscriptions: {
          where: { isActive: true }
        },
        notificationSettings: true
      }
    });

    if (!user || !user.notificationSettings?.enablePushNotifications) {
      console.log('User not found or push notifications disabled:', userId);
      return { sent: 0, failed: 0 };
    }

    const subscriptions = user.pushSubscriptions;
    
    if (subscriptions.length === 0) {
      console.log('No active push subscriptions found for user:', userId);
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;
    const invalidSubscriptionIds: string[] = [];

    // Send to all user's subscriptions
    for (const subscription of subscriptions) {
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      };

      const success = await sendPushNotification(subscriptionData, payload);
      
      if (success) {
        sent++;
        // Update last used timestamp
        await prisma.pushSubscription.update({
          where: { id: subscription.id },
          data: { lastUsed: new Date() }
        });
      } else {
        failed++;
        invalidSubscriptionIds.push(subscription.id);
      }
    }

    // Mark invalid subscriptions as inactive
    if (invalidSubscriptionIds.length > 0) {
      await prisma.pushSubscription.updateMany({
        where: {
          id: { in: invalidSubscriptionIds }
        },
        data: { isActive: false }
      });
      console.log('Marked invalid subscriptions as inactive:', invalidSubscriptionIds);
    }

    return { sent, failed };

  } catch (error) {
    console.error('Error sending push notification to user:', error);
    return { sent: 0, failed: 1 };
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendPushNotificationToUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<{ totalSent: number; totalFailed: number; userResults: Record<string, { sent: number; failed: number }> }> {
  const userResults: Record<string, { sent: number; failed: number }> = {};
  let totalSent = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const result = await sendPushNotificationToUser(userId, payload);
    userResults[userId] = result;
    totalSent += result.sent;
    totalFailed += result.failed;
  }

  return { totalSent, totalFailed, userResults };
}

/**
 * Test push notification functionality
 */
export async function sendTestPushNotification(userId: string): Promise<boolean> {
  const payload: PushNotificationPayload = {
    title: 'Test Notification',
    body: 'This is a test push notification from your Notion App!',
    actionUrl: '/',
    priority: 'normal',
    tag: 'test'
  };

  const result = await sendPushNotificationToUser(userId, payload);
  return result.sent > 0;
}

/**
 * Get all active push subscriptions for a user
 */
export async function getUserPushSubscriptions(userId: string) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true
      },
      orderBy: {
        lastUsed: 'desc'
      }
    });

    return subscriptions;
  } catch (error) {
    console.error('Error fetching user push subscriptions:', error);
    return [];
  }
}

/**
 * Remove a push subscription
 */
export async function removePushSubscription(subscriptionId: string, userId: string) {
  try {
    const result = await prisma.pushSubscription.updateMany({
      where: {
        id: subscriptionId,
        userId
      },
      data: {
        isActive: false
      }
    });

    return result.count > 0;
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return false;
  }
}

/**
 * Get browser push notification permission status
 * This runs on the client side
 */
export function getBrowserNotificationPermission(): NotificationPermission {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'denied';
}

/**
 * Request browser notification permission
 * This runs on the client side
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return 'denied';
}

/**
 * Check if browser supports push notifications
 */
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Generate VAPID keys (run this once to generate your keys)
 */
export function generateVapidKeys() {
  // return webpush.generateVAPIDKeys();
  throw new Error('VAPID key generation temporarily disabled - web-push dependency not installed');
}

/**
 * Create notification payload for different types
 */
export function createNotificationPayload(
  type: 'due_date' | 'workout' | 'research' | 'achievement' | 'reminder' | 'general',
  data: any
): PushNotificationPayload {
  const basePayload: PushNotificationPayload = {
    title: 'Notion App',
    body: 'You have a new notification',
    priority: 'normal'
  };

  switch (type) {
    case 'due_date':
      return {
        ...basePayload,
        title: `Due Soon: ${data.title}`,
        body: `${data.type} "${data.title}" is due ${data.timeUntilDue}`,
        actionUrl: data.actionUrl,
        entityType: data.entityType,
        entityId: data.entityId,
        priority: data.priority,
        tag: 'due-date',
        notificationId: data.notificationId
      };

    case 'workout':
      return {
        ...basePayload,
        title: data.title || 'Workout Reminder',
        body: data.message,
        actionUrl: '/workout',
        entityType: 'workout',
        entityId: data.workoutId,
        priority: 'normal',
        tag: 'workout',
        notificationId: data.notificationId
      };

    case 'research':
      return {
        ...basePayload,
        title: data.title || 'Research Alert',
        body: data.message,
        actionUrl: data.actionUrl || '/research',
        entityType: 'research',
        entityId: data.researchId,
        priority: data.priority || 'normal',
        tag: 'research',
        notificationId: data.notificationId
      };

    case 'achievement':
      return {
        ...basePayload,
        title: '🎉 Achievement Unlocked!',
        body: data.message,
        actionUrl: '/streaks',
        priority: 'normal',
        tag: 'achievement',
        requireInteraction: true,
        notificationId: data.notificationId
      };

    case 'reminder':
      return {
        ...basePayload,
        title: data.title || 'Reminder',
        body: data.message,
        actionUrl: data.actionUrl || '/',
        priority: data.priority || 'normal',
        tag: 'reminder',
        notificationId: data.notificationId
      };

    case 'general':
    default:
      return {
        ...basePayload,
        title: data.title || 'Notification',
        body: data.message || data.body,
        actionUrl: data.actionUrl || '/',
        priority: data.priority || 'normal',
        tag: data.tag || 'general',
        notificationId: data.notificationId
      };
  }
} 