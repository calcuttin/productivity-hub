import { prisma } from '@/lib/prisma';
import { 
  createNotification, 
  substituteTemplateVariables, 
  isInQuietHours,
  getUserNotificationSettings 
} from '@/lib/notifications';

// Types for workout notification scheduling
interface WorkoutSchedule {
  id: string;
  userId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  time: string; // HH:MM format
  workoutType: string;
  isActive: boolean;
  reminderMinutes: number; // Minutes before workout to send reminder
}

interface RestDaySettings {
  userId: string;
  maxConsecutiveDays: number;
  preferredRestDays: number[]; // Array of day numbers (0-6)
  reminderEnabled: boolean;
}

// Workout reminder timing options
export const WORKOUT_REMINDER_TIMINGS = {
  '15_minutes': 15,
  '30_minutes': 30,
  '1_hour': 60,
  '2_hours': 120,
  '1_day': 1440, // 24 * 60
} as const;

export type WorkoutReminderTiming = keyof typeof WORKOUT_REMINDER_TIMINGS;

// Get upcoming workout sessions for a user
export async function getUpcomingWorkouts(userId: string, daysAhead = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + daysAhead);
  
  return await prisma.workout.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      },
      completed: false
    },
    orderBy: {
      date: 'asc'
    }
  });
}

// Get recent workout history to analyze patterns
export async function getRecentWorkoutHistory(userId: string, daysBack = 14) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  
  return await prisma.workout.findMany({
    where: {
      userId,
      date: {
        gte: startDate
      }
    },
    orderBy: {
      date: 'desc'
    }
  });
}

// Calculate if user should take a rest day
export async function shouldSuggestRestDay(userId: string): Promise<{
  shouldRest: boolean;
  consecutiveDays: number;
  lastRestDay: Date | null;
  reason: string;
}> {
  const recentWorkouts = await getRecentWorkoutHistory(userId, 7);
  const completedWorkouts = recentWorkouts.filter(w => w.completed);
  
  // Count consecutive workout days from today backwards
  let consecutiveDays = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(checkDate);
    const dayEnd = new Date(checkDate);
    dayEnd.setHours(23, 59, 59, 999);
    
    const hasWorkout = completedWorkouts.some(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= dayStart && workoutDate <= dayEnd;
    });
    
    if (hasWorkout) {
      consecutiveDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  // Find last rest day
  const lastRestDay = consecutiveDays > 0 ? new Date(checkDate) : null;
  
  // Suggest rest after 3+ consecutive days
  const shouldRest = consecutiveDays >= 3;
  
  let reason = '';
  if (shouldRest) {
    reason = `You've worked out ${consecutiveDays} consecutive days. Consider taking a rest day to recover.`;
  } else if (consecutiveDays === 0) {
    reason = 'Great time to get back into your workout routine!';
  } else {
    reason = `You've been consistent with ${consecutiveDays} workout day${consecutiveDays > 1 ? 's' : ''}. Keep it up!`;
  }
  
  return {
    shouldRest,
    consecutiveDays,
    lastRestDay,
    reason
  };
}

// Check workout streak and send streak-related notifications
export async function checkWorkoutStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreak = 0;
  let checkDate = new Date(today);
  
  // Calculate current streak
  while (true) {
    const dayStart = new Date(checkDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(checkDate);
    dayEnd.setHours(23, 59, 59, 999);

    const hasWorkout = await prisma.workout.count({
      where: {
        userId,
        completed: true,
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    }) > 0;

    if (hasWorkout) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }

    if (currentStreak >= 30) break; // Reasonable limit
  }
  
  return {
    currentStreak,
    isStreakMilestone: [3, 7, 14, 21, 30].includes(currentStreak),
    streakMessage: getStreakMessage(currentStreak)
  };
}

function getStreakMessage(streak: number): string {
  if (streak === 0) return "Ready to start a new workout streak?";
  if (streak === 1) return "Great start! One day down.";
  if (streak === 3) return "🔥 3-day streak! You're building momentum.";
  if (streak === 7) return "💪 One week streak! You're crushing it.";
  if (streak === 14) return "🏆 Two weeks strong! Your consistency is paying off.";
  if (streak === 21) return "🌟 21 days! You're forming a solid habit.";
  if (streak === 30) return "🎉 30-day streak! You're a workout champion!";
  return `${streak}-day streak! Keep the momentum going.`;
}

// Send workout reminder notification
export async function sendWorkoutReminder(
  userId: string,
  workoutId: string,
  workoutName: string,
  scheduledTime: Date,
  reminderMinutes: number
) {
  const settings = await getUserNotificationSettings(userId);
  if (!settings?.workoutNotifications) return;
  
  const reminderTime = new Date(scheduledTime);
  reminderTime.setMinutes(reminderTime.getMinutes() - reminderMinutes);
  
  // Don't send if it's in quiet hours
  if (isInQuietHours(settings, reminderTime)) return;
  
  const templateData = {
    workoutName,
    scheduledTime: scheduledTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    reminderTime: getReminderTimeText(reminderMinutes)
  };
  
  await createNotification({
    userId,
    title: substituteTemplateVariables('🏋️ Workout Reminder', templateData),
    message: substituteTemplateVariables('Your {{workoutName}} is scheduled for {{scheduledTime}} ({{reminderTime}} from now)', templateData),
    type: 'workout',
    priority: 'medium',
    entityType: 'workout',
    entityId: workoutId,
    actionType: 'view',
    actionUrl: `/workout`,
    scheduledFor: reminderTime,
    expiresAt: new Date(scheduledTime.getTime() + 60 * 60 * 1000) // Expire 1 hour after workout time
  });
}

// Send rest day reminder
export async function sendRestDayReminder(userId: string, consecutiveDays: number) {
  const settings = await getUserNotificationSettings(userId);
  if (!settings?.workoutNotifications) return;
  
  const templateData = {
    consecutiveDays: consecutiveDays.toString(),
    restDayTips: getRestDayTips()
  };
  
  await createNotification({
    userId,
    title: '😌 Time for a Rest Day',
    message: substituteTemplateVariables('You\'ve worked out {{consecutiveDays}} days in a row! Consider taking a rest day to let your muscles recover. {{restDayTips}}', templateData),
    type: 'workout',
    priority: 'low',
    entityType: 'general',
    actionType: 'view',
    actionUrl: '/workout',
    scheduledFor: new Date()
  });
}

// Send streak milestone notification
export async function sendStreakMilestone(userId: string, streak: number) {
  const settings = await getUserNotificationSettings(userId);
  if (!settings?.enableNotifications) return;
  
  const templateData = {
    streak: streak.toString(),
    message: getStreakMessage(streak)
  };
  
  await createNotification({
    userId,
    title: '🔥 Workout Streak Milestone!',
    message: substituteTemplateVariables('{{message}} You\'re on a {{streak}}-day workout streak!', templateData),
    type: 'achievement',
    priority: 'medium',
    entityType: 'general',
    actionType: 'view',
    actionUrl: '/streaks',
    scheduledFor: new Date()
  });
}

// Send motivation reminder for inactive users
export async function sendMotivationReminder(userId: string, daysSinceLastWorkout: number) {
  const settings = await getUserNotificationSettings(userId);
  if (!settings?.workoutNotifications) return;
  
  let message = '';
  let title = '';
  
  if (daysSinceLastWorkout === 1) {
    title = '💪 Ready for Today\'s Workout?';
    message = 'You crushed it yesterday! Ready to keep the momentum going?';
  } else if (daysSinceLastWorkout <= 3) {
    title = '🌟 Time to Get Moving';
    message = `It's been ${daysSinceLastWorkout} days since your last workout. Your body is ready to get back into action!`;
  } else if (daysSinceLastWorkout <= 7) {
    title = '🔥 Your Workout is Waiting';
    message = `It's been a week since your last workout. Starting today will feel amazing - your future self will thank you!`;
  } else {
    title = '✨ Fresh Start Opportunity';
    message = 'Every day is a new chance to prioritize your health. Ready to jump back in?';
  }
  
  await createNotification({
    userId,
    title,
    message,
    type: 'workout',
    priority: 'low',
    entityType: 'general',
    actionType: 'view',
    actionUrl: '/workout',
    scheduledFor: new Date()
  });
}

// Schedule notification for a specific workout
export async function scheduleWorkoutReminder(
  userId: string,
  workoutId: string,
  workoutName: string,
  workoutDate: Date,
  reminderTiming: WorkoutReminderTiming = '1_hour'
) {
  const reminderMinutes = WORKOUT_REMINDER_TIMINGS[reminderTiming];
  
  // Default workout time to 8 AM if only date is provided
  const workoutDateTime = new Date(workoutDate);
  if (workoutDateTime.getHours() === 0 && workoutDateTime.getMinutes() === 0) {
    workoutDateTime.setHours(8, 0, 0, 0);
  }
  
  await sendWorkoutReminder(userId, workoutId, workoutName, workoutDateTime, reminderMinutes);
}

// Process all workout notifications for a user
export async function processWorkoutNotifications(userId: string) {
  try {
    // Check for upcoming workouts that need reminders
    const upcomingWorkouts = await getUpcomingWorkouts(userId, 1); // Next 24 hours
    
    for (const workout of upcomingWorkouts) {
      const workoutDate = new Date(workout.date);
      const now = new Date();
      const hoursUntilWorkout = (workoutDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      // Send reminder if workout is within the next 1-2 hours and no reminder sent yet
      if (hoursUntilWorkout > 0 && hoursUntilWorkout <= 2) {
        // TODO: Uncomment after Prisma client regeneration
        // const existingReminder = await prisma.notification.findFirst({
        //   where: {
        //     userId,
        //     entityType: 'workout',
        //     entityId: workout.id,
        //     type: 'workout',
        //     createdAt: {
        //       gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        //     }
        //   }
        // });
        const existingReminder = null; // Placeholder
        
        if (!existingReminder) {
          await sendWorkoutReminder(
            userId,
            workout.id,
            workout.name,
            workoutDate,
            Math.floor(hoursUntilWorkout * 60)
          );
        }
      }
    }
    
    // Check if user should take a rest day
    const restDayAnalysis = await shouldSuggestRestDay(userId);
    if (restDayAnalysis.shouldRest) {
      // TODO: Uncomment after Prisma client regeneration
      // const existingRestReminder = await prisma.notification.findFirst({
      //   where: {
      //     userId,
      //     type: 'workout',
      //     message: { contains: 'rest day' },
      //     createdAt: {
      //       gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      //     }
      //   }
      // });
      const existingRestReminder = null; // Placeholder
      
      if (!existingRestReminder) {
        await sendRestDayReminder(userId, restDayAnalysis.consecutiveDays);
      }
    }
    
    // Check for streak milestones
    const streakInfo = await checkWorkoutStreak(userId);
    if (streakInfo.isStreakMilestone) {
      // TODO: Uncomment after Prisma client regeneration
      // const existingMilestone = await prisma.notification.findFirst({
      //   where: {
      //     userId,
      //     type: 'achievement',
      //     message: { contains: `${streakInfo.currentStreak}-day` },
      //     createdAt: {
      //       gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      //     }
      //   }
      // });
      const existingMilestone = null; // Placeholder
      
      if (!existingMilestone) {
        await sendStreakMilestone(userId, streakInfo.currentStreak);
      }
    }
    
    // Check for motivation reminders (for users who haven't worked out recently)
    const recentWorkouts = await getRecentWorkoutHistory(userId, 7);
    const lastWorkout = recentWorkouts.find(w => w.completed);
    
    if (!lastWorkout || isMoreThanDaysAgo(lastWorkout.date, 2)) {
      const daysSince = lastWorkout ? 
        Math.floor((Date.now() - new Date(lastWorkout.date).getTime()) / (1000 * 60 * 60 * 24)) : 
        7;
      
      // TODO: Uncomment after Prisma client regeneration
      // const existingMotivation = await prisma.notification.findFirst({
      //   where: {
      //     userId,
      //     type: 'workout',
      //     OR: [
      //       { message: { contains: 'Ready for Today' } },
      //       { message: { contains: 'Time to Get Moving' } },
      //       { message: { contains: 'Workout is Waiting' } },
      //       { message: { contains: 'Fresh Start' } }
      //     ],
      //     createdAt: {
      //       gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      //     }
      //   }
      // });
      const existingMotivation = null; // Placeholder
      
      if (!existingMotivation) {
        await sendMotivationReminder(userId, daysSince);
      }
    }
    
  } catch (error) {
    console.error(`Error processing workout notifications for user ${userId}:`, error);
    throw error;
  }
}

// Process workout notifications for all users
export async function processAllWorkoutNotifications() {
  const users = await prisma.user.findMany({
    where: {
      workouts: {
        some: {} // Only users who have at least one workout
      }
    },
    select: { id: true, email: true }
  });
  
  const results = {
    processed: 0,
    errors: 0,
    details: [] as Array<{ userId: string; status: 'success' | 'error'; error?: string }>
  };
  
  for (const user of users) {
    try {
      await processWorkoutNotifications(user.id);
      results.processed++;
      results.details.push({ userId: user.id, status: 'success' });
    } catch (error) {
      results.errors++;
      results.details.push({
        userId: user.id,
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  return results;
}

// Helper functions
function getReminderTimeText(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
}

function getRestDayTips(): string {
  const tips = [
    'Try some light stretching or yoga.',
    'Take a walk or do some light cardio.',
    'Focus on hydration and nutrition.',
    'Get quality sleep to aid recovery.',
    'Consider a relaxing massage or foam rolling.'
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

function isMoreThanDaysAgo(date: Date, days: number): boolean {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);
  return new Date(date) < daysAgo;
} 