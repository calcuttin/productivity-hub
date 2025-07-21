import { prisma } from '@/lib/prisma';
import { sendPushNotificationToUser, createNotificationPayload } from './push-notifications';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
  entityType?: string;
  entityId?: string;
  actionType?: string;
  actionUrl?: string;
  actionData?: any;
  scheduledFor?: Date;
  expiresAt?: Date;
  templateId?: string;
  groupId?: string;
}

/**
 * Substitute template variables in a string
 */
export function substituteTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

/**
 * Create a notification from a template with variable substitution
 */
export async function createNotificationFromTemplate(
  templateName: string,
  userId: string,
  variables: Record<string, string> = {},
  overrides: Partial<CreateNotificationParams> = {}
) {
  try {
    const template = await prisma.notificationTemplate.findUnique({
      where: { name: templateName, isActive: true },
    });

    if (!template) {
      console.warn(`Notification template not found: ${templateName}`);
      // Fall back to direct notification creation
      return await createNotification({
        userId,
        title: overrides.title || 'Notification',
        message: overrides.message || 'You have a new notification',
        type: overrides.type || 'system',
        priority: overrides.priority || 'medium',
        ...overrides,
      });
    }

    // Substitute variables in title and message
    const title = substituteTemplateVariables(template.title, variables);
    const message = substituteTemplateVariables(template.message, variables);

    const notification = await createNotification({
      userId,
      title,
      message,
      type: template.type,
      priority: template.priority,
      templateId: template.id,
      ...overrides,
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification from template:', error);
    throw error;
  }
}

/**
 * Create a notification directly
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title: params.title,
        message: params.message,
        type: params.type,
        priority: params.priority || 'medium',
        entityType: params.entityType,
        entityId: params.entityId,
        actionType: params.actionType,
        actionUrl: params.actionUrl,
        actionData: params.actionData,
        scheduledFor: params.scheduledFor,
        expiresAt: params.expiresAt,
        templateId: params.templateId,
        groupId: params.groupId,
        userId: params.userId,
      },
    });

    // Send push notification if user has enabled push notifications
    try {
      const notificationType = params.entityType === 'project' || params.entityType === 'todo' 
        ? 'due_date' 
        : params.entityType === 'workout'
        ? 'workout'
        : params.entityType === 'research'
        ? 'research'
        : params.type === 'achievement'
        ? 'achievement'
        : 'general';

      const pushPayload = createNotificationPayload(notificationType, {
        title: params.title,
        message: params.message,
        actionUrl: params.actionUrl,
        entityType: params.entityType,
        entityId: params.entityId,
        priority: params.priority,
        notificationId: notification.id
      });

      await sendPushNotificationToUser(params.userId, pushPayload);
    } catch (pushError) {
      console.error('Failed to send push notification:', pushError);
      // Don't fail the whole notification if push fails
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  options: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
    includeExpired?: boolean;
  } = {}
) {
  try {
    const {
      status,
      type,
      limit = 50,
      offset = 0,
      includeExpired = false,
    } = options;

    const where: any = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
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

    const totalCount = await prisma.notification.count({ where });

    return {
      notifications,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        status: 'read',
        readAt: new Date(),
      },
    });

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        status: 'unread',
      },
      data: {
        status: 'read',
        readAt: new Date(),
      },
    });

    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
  try {
    const notification = await prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Get user notification settings
 */
export async function getUserNotificationSettings(userId: string) {
  try {
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: { userId },
      });
    }

    return settings;
  } catch (error) {
    console.error('Error getting user notification settings:', error);
    throw error;
  }
}

/**
 * Update user notification settings
 */
export async function updateUserNotificationSettings(
  userId: string,
  settings: Partial<{
    enableNotifications: boolean;
    enableEmailNotifications: boolean;
    enableBrowserNotifications: boolean;
    enablePushNotifications: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    quietHoursTimezone: string;
    projectNotifications: boolean;
    todoNotifications: boolean;
    workoutNotifications: boolean;
    researchNotifications: boolean;
    defaultReminderTiming: string;
    enableDailyDigest: boolean;
    enableWeeklyDigest: boolean;
    digestTime: string;
  }>
) {
  try {
    const updatedSettings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: settings,
      create: {
        userId,
        ...settings,
      },
    });

    return updatedSettings;
  } catch (error) {
    console.error('Error updating user notification settings:', error);
    throw error;
  }
}

/**
 * Get unread notification count for user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        status: 'unread',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ],
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

/**
 * Clean up expired notifications
 */
export async function cleanupExpiredNotifications(): Promise<number> {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`Cleaned up ${result.count} expired notifications`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    return 0;
  }
}

/**
 * Check if user is in quiet hours
 */
export function isInQuietHours(
  settings: any,
  currentTime: Date = new Date()
): boolean {
  if (!settings.quietHoursEnabled || !settings.quietHoursStart || !settings.quietHoursEnd) {
    return false;
  }

  const startTime = settings.quietHoursStart; // "HH:MM"
  const endTime = settings.quietHoursEnd; // "HH:MM"
  const currentTimeStr = currentTime.toTimeString().slice(0, 5); // "HH:MM"

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startTime > endTime) {
    return currentTimeStr >= startTime || currentTimeStr <= endTime;
  }
  
  // Handle same-day quiet hours (e.g., 13:00 to 17:00)
  return currentTimeStr >= startTime && currentTimeStr <= endTime;
} 