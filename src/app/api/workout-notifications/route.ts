import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { 
  processWorkoutNotifications,
  processAllWorkoutNotifications,
  getUpcomingWorkouts,
  shouldSuggestRestDay,
  checkWorkoutStreak,
  getRecentWorkoutHistory,
  scheduleWorkoutReminder,
  WORKOUT_REMINDER_TIMINGS,
  type WorkoutReminderTiming
} from '@/lib/workout-notifications';

// GET /api/workout-notifications - Get workout notification insights for current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Get upcoming workouts
    const upcomingWorkouts = await getUpcomingWorkouts(user.id, 7);
    
    // Check rest day suggestion
    const restDayAnalysis = await shouldSuggestRestDay(user.id);
    
    // Check workout streak
    const streakInfo = await checkWorkoutStreak(user.id);
    
    // Get recent workout history
    const recentWorkouts = await getRecentWorkoutHistory(user.id, 14);
    
    return NextResponse.json({
      upcomingWorkouts: upcomingWorkouts.length,
      nextWorkout: upcomingWorkouts[0] || null,
      restDay: restDayAnalysis,
      streak: streakInfo,
      recentWorkouts: recentWorkouts.length,
      lastWorkout: recentWorkouts.find(w => w.completed) || null,
      reminderTimings: Object.keys(WORKOUT_REMINDER_TIMINGS)
    });
  } catch (error) {
    console.error('Error fetching workout notifications:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch workout notifications' },
      { status: 500 }
    );
  }
}

// POST /api/workout-notifications - Process workout notifications
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { action, userId, workoutId, workoutName, workoutDate, reminderTiming } = body;
    
    switch (action) {
      case 'process_user':
        // Process notifications for current user
        await processWorkoutNotifications(user.id);
        return NextResponse.json({ 
          success: true, 
          message: 'Workout notifications processed for current user',
          processedUserId: user.id
        });
        
      case 'process_all':
        // Process notifications for all users (admin feature - could add admin check)
        const results = await processAllWorkoutNotifications();
        return NextResponse.json({
          success: true,
          message: 'Workout notifications processed for all users',
          results
        });
        
      case 'schedule_reminder':
        // Schedule a specific workout reminder
        if (!workoutId || !workoutName || !workoutDate) {
          return NextResponse.json(
            { error: 'workoutId, workoutName, and workoutDate are required for scheduling' },
            { status: 400 }
          );
        }
        
        const timing = (reminderTiming as WorkoutReminderTiming) || '1_hour';
        await scheduleWorkoutReminder(
          user.id,
          workoutId,
          workoutName,
          new Date(workoutDate),
          timing
        );
        
        return NextResponse.json({
          success: true,
          message: 'Workout reminder scheduled',
          workoutId,
          reminderTiming: timing
        });
        
      case 'process_specific_user':
        // Process notifications for a specific user (admin feature)
        if (!userId) {
          return NextResponse.json(
            { error: 'userId is required for processing specific user' },
            { status: 400 }
          );
        }
        
        await processWorkoutNotifications(userId);
        return NextResponse.json({
          success: true,
          message: 'Workout notifications processed for specified user',
          processedUserId: userId
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use process_user, process_all, schedule_reminder, or process_specific_user' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing workout notifications:', error);
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to process workout notifications' },
      { status: 500 }
    );
  }
} 