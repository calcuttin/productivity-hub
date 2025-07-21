import { prisma } from '@/lib/prisma';
import { createNotification, getUserNotificationSettings, isInQuietHours } from '@/lib/notifications';

export interface ReminderSettings {
  enabled: boolean;
  timing: '1_hour' | '2_hours' | '4_hours' | '8_hours' | '1_day' | '2_days' | '3_days' | '1_week';
  customHours?: number;
}

export interface DueDateItem {
  id: string;
  title: string;
  dueDate: Date;
  type: 'project' | 'todo';
  priority?: string;
  userId: string;
}

/**
 * Convert timing string to hours
 */
export function getHoursFromTiming(timing: string, customHours?: number): number {
  if (timing === 'custom' && customHours) {
    return customHours;
  }

  const timingMap: Record<string, number> = {
    '1_hour': 1,
    '2_hours': 2,
    '4_hours': 4,
    '8_hours': 8,
    '1_day': 24,
    '2_days': 48,
    '3_days': 72,
    '1_week': 168,
  };

  return timingMap[timing] || 24; // Default to 1 day
}

/**
 * Check if a reminder should be sent based on due date and timing
 */
export function shouldSendReminder(
  dueDate: Date,
  reminderHours: number,
  currentTime: Date = new Date()
): boolean {
  const timeDiff = dueDate.getTime() - currentTime.getTime();
  const hoursUntilDue = timeDiff / (1000 * 60 * 60);
  
  // Send reminder if we're within the reminder window (with 1-hour buffer)
  return hoursUntilDue <= reminderHours && hoursUntilDue >= (reminderHours - 1);
}

/**
 * Create a due date reminder notification
 */
export async function createDueDateReminderNotification(
  item: DueDateItem,
  reminderHours: number
): Promise<any> {
  const timeUntilDue = Math.ceil((item.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));
  
  let urgencyText = '';
  if (timeUntilDue <= 1) {
    urgencyText = 'due in less than 1 hour';
  } else if (timeUntilDue <= 24) {
    urgencyText = `due in ${timeUntilDue} hours`;
  } else {
    const days = Math.ceil(timeUntilDue / 24);
    urgencyText = `due in ${days} day${days > 1 ? 's' : ''}`;
  }

  const title = `Reminder: ${item.title} is ${urgencyText}`;
  const message = `Your ${item.type} "${item.title}" is due on ${item.dueDate.toLocaleDateString()} at ${item.dueDate.toLocaleTimeString()}.`;

  return await createNotification({
    userId: item.userId,
    title,
    message,
    type: 'due_date',
    priority: timeUntilDue <= 24 ? 'high' : 'medium',
    entityType: item.type,
    entityId: item.id,
    actionType: 'view',
    actionUrl: `/${item.type}s/${item.id}`,
    expiresAt: item.dueDate,
  });
}

/**
 * Get all items with upcoming due dates for a user
 */
export async function getUpcomingDueDateItems(userId: string): Promise<DueDateItem[]> {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

  // Get projects with due dates
  const projects = await prisma.project.findMany({
    where: {
      userId,
      dueDate: {
        gte: now,
        lte: oneWeekFromNow,
      },
      status: {
        not: 'Completed',
      },
    },
    select: {
      id: true,
      name: true,
      dueDate: true,
      priority: true,
      userId: true,
    },
  });

  // Get todos with due dates
  const todos = await prisma.todo.findMany({
    where: {
      userId,
      dueDate: {
        gte: now,
        lte: oneWeekFromNow,
      },
      completed: false,
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      priority: true,
      userId: true,
    },
  });

  // Convert to common format
  const dueDateItems: DueDateItem[] = [
    ...projects.map(p => ({
      id: p.id,
      title: p.name,
      dueDate: p.dueDate!,
      type: 'project' as const,
      priority: p.priority || undefined,
      userId: p.userId!,
    })),
    ...todos.map(t => ({
      id: t.id,
      title: t.title,
      dueDate: t.dueDate!,
      type: 'todo' as const,
      priority: t.priority || undefined,
      userId: t.userId!,
    })),
  ];

  return dueDateItems.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

/**
 * Check for overdue items and create notifications
 */
export async function processOverdueItems(userId: string): Promise<void> {
  const now = new Date();

  // Get overdue projects
  const overdueProjects = await prisma.project.findMany({
    where: {
      userId,
      dueDate: {
        lt: now,
      },
      status: {
        notIn: ['Completed', 'On Hold'],
      },
    },
    select: {
      id: true,
      name: true,
      dueDate: true,
      userId: true,
    },
  });

  // Get overdue todos
  const overdueTodos = await prisma.todo.findMany({
    where: {
      userId,
      dueDate: {
        lt: now,
      },
      completed: false,
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      userId: true,
    },
  });

  // Create overdue notifications
  for (const project of overdueProjects) {
    if (project.userId) {
      await createOverdueNotification({ ...project, name: project.name, userId: project.userId }, 'project');
    }
  }

  for (const todo of overdueTodos) {
    if (todo.userId) {
      await createOverdueNotification({ ...todo, title: todo.title, userId: todo.userId }, 'todo');
    }
  }
}

async function createOverdueNotification(
  item: { id: string; title?: string; name?: string; dueDate: Date | null; userId: string },
  type: 'project' | 'todo'
): Promise<void> {
  if (!item.dueDate) return;

  const title = item.title || item.name || 'Untitled';
  const daysPastDue = Math.ceil((new Date().getTime() - item.dueDate.getTime()) / (1000 * 60 * 60 * 24));

  const notificationTitle = `Overdue: ${title}`;
  const notificationMessage = `Your ${type} "${title}" was due ${daysPastDue} day${daysPastDue > 1 ? 's' : ''} ago. Please complete it as soon as possible.`;

  await createNotification({
    userId: item.userId,
    title: notificationTitle,
    message: notificationMessage,
    type: 'overdue',
    priority: 'urgent',
    entityType: type,
    entityId: item.id,
    actionType: 'view',
    actionUrl: `/${type}s/${item.id}`,
  });
}

/**
 * Process due date reminders for a specific user
 */
export async function processDueDateReminders(userId: string): Promise<{
  remindersCreated: number;
  overdueProcessed: number;
}> {
  try {
    // Get user notification settings
    const settings = await getUserNotificationSettings(userId);
    
    // Check if reminders are enabled
    if (!settings.projectNotifications && !settings.todoNotifications) {
      return { remindersCreated: 0, overdueProcessed: 0 };
    }

    // Check quiet hours
    if (isInQuietHours(settings)) {
      console.log(`User ${userId} is in quiet hours, skipping reminders`);
      return { remindersCreated: 0, overdueProcessed: 0 };
    }

    // Get upcoming due date items
    const upcomingItems = await getUpcomingDueDateItems(userId);
    
    let remindersCreated = 0;
    const defaultReminderHours = getHoursFromTiming(settings.defaultReminderTiming);

    // Process each upcoming item
    for (const item of upcomingItems) {
      // Check if we should send a reminder
      if (shouldSendReminder(item.dueDate, defaultReminderHours)) {
        // Check if we haven't already sent this reminder
        const existingReminder = await prisma.notification.findFirst({
          where: {
            userId,
            entityType: item.type,
            entityId: item.id,
            type: 'due_date',
            createdAt: {
              gte: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)), // Last 24 hours
            },
          },
        });

        if (!existingReminder) {
          await createDueDateReminderNotification(item, defaultReminderHours);
          remindersCreated++;
        }
      }
    }

    // Process overdue items
    await processOverdueItems(userId);
    
    return { remindersCreated, overdueProcessed: 0 }; // We don't count overdue items separately for now

  } catch (error) {
    console.error(`Error processing due date reminders for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Process due date reminders for all users
 */
export async function processAllDueDateReminders(): Promise<{
  usersProcessed: number;
  totalReminders: number;
  errors: string[];
}> {
  const results = {
    usersProcessed: 0,
    totalReminders: 0,
    errors: [] as string[],
  };

  try {
    // Get all users with notification settings enabled
    const users = await prisma.user.findMany({
      include: {
        notificationSettings: true,
      },
      where: {
        notificationSettings: {
          OR: [
            { projectNotifications: true },
            { todoNotifications: true },
          ],
        },
      },
    });

    console.log(`Processing due date reminders for ${users.length} users`);

    for (const user of users) {
      try {
        const userResults = await processDueDateReminders(user.id);
        results.usersProcessed++;
        results.totalReminders += userResults.remindersCreated;
        
        if (userResults.remindersCreated > 0) {
          console.log(`Created ${userResults.remindersCreated} reminders for user ${user.email}`);
        }
      } catch (error) {
        const errorMsg = `Failed to process reminders for user ${user.email}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log(`Due date reminder processing complete: ${results.totalReminders} reminders created for ${results.usersProcessed} users`);
    return results;

  } catch (error) {
    console.error('Error in processAllDueDateReminders:', error);
    throw error;
  }
}

/**
 * Schedule reminder for a specific item when it's created or updated
 */
export async function scheduleItemReminder(
  userId: string,
  entityType: 'project' | 'todo',
  entityId: string,
  title: string,
  dueDate: Date
): Promise<void> {
  try {
    const settings = await getUserNotificationSettings(userId);
    
    if (!settings.dueDateReminders) {
      return; // User has reminders disabled
    }

    const reminderHours = getHoursFromTiming(settings.defaultReminderTime);
    const reminderTime = new Date(dueDate.getTime() - (reminderHours * 60 * 60 * 1000));

    // Only schedule if reminder time is in the future
    if (reminderTime > new Date()) {
      await createNotification({
        userId,
        title: `Reminder: ${title} is due soon`,
        message: `Your ${entityType} "${title}" is due on ${dueDate.toLocaleDateString()} at ${dueDate.toLocaleTimeString()}.`,
        type: 'due_date',
        priority: 'medium',
        entityType,
        entityId,
        actionType: 'view',
        actionUrl: `/${entityType}s/${entityId}`,
        scheduledFor: reminderTime,
        expiresAt: dueDate,
      });
    }
  } catch (error) {
    console.error('Error scheduling item reminder:', error);
  }
} 