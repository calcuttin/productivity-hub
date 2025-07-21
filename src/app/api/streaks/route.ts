import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Get the full user record from database using the user ID
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const streaks = await getDetailedStreaks(dbUser.id);
    
    return NextResponse.json(streaks);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Streaks API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getDetailedStreaks(userId: string) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  // Calculate different types of streaks
  const [
    todoStreaks,
    workoutStreaks,
    productivityStreaks,
    streakHistory
  ] = await Promise.all([
    calculateTodoStreaks(userId, today),
    calculateWorkoutStreaks(userId, today),
    calculateProductivityStreaks(userId, today),
    getStreakHistory(userId)
  ]);

  // Calculate overall metrics
  const totalActiveStreaks = [
    todoStreaks.current,
    workoutStreaks.current,
    productivityStreaks.current
  ].filter(streak => streak > 0).length;

  const longestCurrentStreak = Math.max(
    todoStreaks.current,
    workoutStreaks.current,
    productivityStreaks.current
  );

  const allTimeLongest = Math.max(
    todoStreaks.longest,
    workoutStreaks.longest,
    productivityStreaks.longest
  );

  return {
    summary: {
      totalActiveStreaks,
      longestCurrentStreak,
      allTimeLongest,
      streakRank: getStreakRank(longestCurrentStreak)
    },
    todos: todoStreaks,
    workouts: workoutStreaks,
    productivity: productivityStreaks,
    history: streakHistory,
    achievements: calculateStreakAchievements(todoStreaks, workoutStreaks, productivityStreaks),
    challenges: getStreakChallenges(todoStreaks, workoutStreaks, productivityStreaks)
  };
}

async function calculateTodoStreaks(userId: string, endDate: Date) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastActiveDate: Date | null = null;
  
  // Get last 365 days of todo activity
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 365);
  
  const dailyActivity = await getDailyTodoActivity(userId, startDate, endDate);
  
  // Calculate current streak (from today backwards)
  for (let i = dailyActivity.length - 1; i >= 0; i--) {
    const day = dailyActivity[i];
    if (day.hasActivity) {
      currentStreak++;
      if (!lastActiveDate) {
        lastActiveDate = day.date;
      }
    } else {
      break;
    }
  }
  
  // Calculate longest streak in the period
  for (const day of dailyActivity) {
    if (day.hasActivity) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Get weekly completion rate for last 4 weeks
  const weeklyRates = await getWeeklyTodoCompletionRates(userId, endDate);
  
  return {
    current: currentStreak,
    longest: longestStreak,
    lastActiveDate,
    weeklyCompletionRates: weeklyRates,
    averageDaily: calculateAverageDailyTodos(dailyActivity),
    bestDay: getBestDayOfWeek(dailyActivity),
    streakType: 'todos',
    goal: getNextStreakGoal(currentStreak),
    isOnTrack: currentStreak > 0 || isToday(endDate)
  };
}

async function calculateWorkoutStreaks(userId: string, endDate: Date) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastActiveDate: Date | null = null;
  
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 365);
  
  const dailyActivity = await getDailyWorkoutActivity(userId, startDate, endDate);
  
  // Calculate current streak
  for (let i = dailyActivity.length - 1; i >= 0; i--) {
    const day = dailyActivity[i];
    if (day.hasActivity) {
      currentStreak++;
      if (!lastActiveDate) {
        lastActiveDate = day.date;
      }
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  for (const day of dailyActivity) {
    if (day.hasActivity) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const weeklyRates = await getWeeklyWorkoutCompletionRates(userId, endDate);
  
  return {
    current: currentStreak,
    longest: longestStreak,
    lastActiveDate,
    weeklyCompletionRates: weeklyRates,
    averageWeekly: calculateAverageWeeklyWorkouts(dailyActivity),
    consistencyScore: calculateWorkoutConsistency(dailyActivity),
    streakType: 'workouts',
    goal: getNextStreakGoal(currentStreak),
    isOnTrack: currentStreak > 0 || isToday(endDate)
  };
}

async function calculateProductivityStreaks(userId: string, endDate: Date) {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastActiveDate: Date | null = null;
  
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 365);
  
  const dailyActivity = await getDailyProductivityActivity(userId, startDate, endDate);
  
  // Calculate current streak
  for (let i = dailyActivity.length - 1; i >= 0; i--) {
    const day = dailyActivity[i];
    if (day.hasActivity) {
      currentStreak++;
      if (!lastActiveDate) {
        lastActiveDate = day.date;
      }
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  for (const day of dailyActivity) {
    if (day.hasActivity) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    lastActiveDate,
    averageProductivityScore: calculateAverageProductivityScore(dailyActivity),
    mostProductiveDay: getMostProductiveDay(dailyActivity),
    streakType: 'productivity',
    goal: getNextStreakGoal(currentStreak),
    isOnTrack: currentStreak > 0 || isToday(endDate)
  };
}

async function getDailyTodoActivity(userId: string, startDate: Date, endDate: Date) {
  const days = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const completedTodos = await prisma.todo.count({
      where: {
        userId,
        updatedAt: { gte: dayStart, lte: dayEnd },
        completed: true
      }
    });

    days.push({
      date: new Date(currentDate),
      hasActivity: completedTodos > 0,
      completedTodos,
      dayOfWeek: currentDate.getDay()
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

async function getDailyWorkoutActivity(userId: string, startDate: Date, endDate: Date) {
  const days = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const completedWorkouts = await prisma.workout.count({
      where: {
        userId,
        date: { gte: dayStart, lte: dayEnd },
        completed: true
      }
    });

    days.push({
      date: new Date(currentDate),
      hasActivity: completedWorkouts > 0,
      completedWorkouts,
      dayOfWeek: currentDate.getDay()
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

async function getDailyProductivityActivity(userId: string, startDate: Date, endDate: Date) {
  const days = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const [completedTodos, completedWorkouts, projectUpdates] = await Promise.all([
      prisma.todo.count({
        where: {
          userId,
          updatedAt: { gte: dayStart, lte: dayEnd },
          completed: true
        }
      }),
      prisma.workout.count({
        where: {
          userId,
          date: { gte: dayStart, lte: dayEnd },
          completed: true
        }
      }),
      prisma.project.count({
        where: {
          userId,
          updatedAt: { gte: dayStart, lte: dayEnd }
        }
      })
    ]);

    const activityScore = (completedTodos * 1) + (completedWorkouts * 2) + (projectUpdates * 1.5);
    
    days.push({
      date: new Date(currentDate),
      hasActivity: activityScore >= 2, // Threshold for "productive day"
      activityScore,
      completedTodos,
      completedWorkouts,
      projectUpdates,
      dayOfWeek: currentDate.getDay()
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

async function getWeeklyTodoCompletionRates(userId: string, endDate: Date) {
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const weekEnd = new Date(endDate);
    weekEnd.setDate(endDate.getDate() - (i * 7));
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);

    const [completed, total] = await Promise.all([
      prisma.todo.count({
        where: {
          userId,
          updatedAt: { gte: weekStart, lte: weekEnd },
          completed: true
        }
      }),
      prisma.todo.count({
        where: {
          userId,
          createdAt: { lte: weekEnd }
        }
      })
    ]);

    weeks.unshift({
      weekStart,
      weekEnd,
      completed,
      total,
      rate: total > 0 ? (completed / total) * 100 : 0
    });
  }
  return weeks;
}

async function getWeeklyWorkoutCompletionRates(userId: string, endDate: Date) {
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const weekEnd = new Date(endDate);
    weekEnd.setDate(endDate.getDate() - (i * 7));
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const completed = await prisma.workout.count({
      where: {
        userId,
        date: { gte: weekStart, lte: weekEnd },
        completed: true
      }
    });

    weeks.unshift({
      weekStart,
      weekEnd,
      completed,
      rate: (completed / 7) * 100 // Rate based on daily workout possibility
    });
  }
  return weeks;
}

async function getStreakHistory(userId: string) {
  // Get major streak milestones from the last year
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setFullYear(endDate.getFullYear() - 1);

  const dailyActivity = await getDailyProductivityActivity(userId, startDate, endDate);
  
  const milestones = [];
  let currentStreak = 0;
  
  for (let i = dailyActivity.length - 1; i >= 0; i--) {
    const day = dailyActivity[i];
    if (day.hasActivity) {
      currentStreak++;
      // Record milestones at significant streak lengths
      if ([7, 14, 30, 50, 100].includes(currentStreak)) {
        milestones.push({
          streakLength: currentStreak,
          date: day.date,
          type: 'milestone',
          description: `${currentStreak}-day productivity streak!`
        });
      }
    } else {
      if (currentStreak > 0) {
        milestones.push({
          streakLength: currentStreak,
          date: dailyActivity[i + 1]?.date || day.date,
          type: 'ended',
          description: `${currentStreak}-day streak ended`
        });
      }
      currentStreak = 0;
    }
  }

  return milestones.reverse().slice(0, 10); // Return last 10 milestones
}

function calculateStreakAchievements(todoStreaks: any, workoutStreaks: any, productivityStreaks: any) {
  const achievements = [];

  // Todo achievements
  if (todoStreaks.current >= 30) {
    achievements.push({
      type: 'todo',
      title: 'Todo Master',
      description: `${todoStreaks.current} day todo streak!`,
      icon: '🏆',
      unlockedAt: new Date()
    });
  } else if (todoStreaks.current >= 7) {
    achievements.push({
      type: 'todo',
      title: 'Week Warrior',
      description: `${todoStreaks.current} day todo streak!`,
      icon: '⚡',
      unlockedAt: new Date()
    });
  }

  // Workout achievements
  if (workoutStreaks.current >= 14) {
    achievements.push({
      type: 'workout',
      title: 'Fitness Dedication',
      description: `${workoutStreaks.current} day workout streak!`,
      icon: '💪',
      unlockedAt: new Date()
    });
  } else if (workoutStreaks.current >= 7) {
    achievements.push({
      type: 'workout',
      title: 'Fitness Commitment',
      description: `${workoutStreaks.current} day workout streak!`,
      icon: '🏃',
      unlockedAt: new Date()
    });
  }

  // Productivity achievements
  if (productivityStreaks.current >= 50) {
    achievements.push({
      type: 'productivity',
      title: 'Productivity Legend',
      description: `${productivityStreaks.current} day productivity streak!`,
      icon: '🌟',
      unlockedAt: new Date()
    });
  } else if (productivityStreaks.current >= 21) {
    achievements.push({
      type: 'productivity',
      title: 'Habit Builder',
      description: `${productivityStreaks.current} day productivity streak!`,
      icon: '🔥',
      unlockedAt: new Date()
    });
  }

  return achievements;
}

function getStreakChallenges(todoStreaks: any, workoutStreaks: any, productivityStreaks: any) {
  const challenges = [];

  // Next milestone challenges
  const nextTodoGoal = getNextMilestone(todoStreaks.current);
  const nextWorkoutGoal = getNextMilestone(workoutStreaks.current);
  const nextProductivityGoal = getNextMilestone(productivityStreaks.current);

  if (nextTodoGoal) {
    challenges.push({
      type: 'todo',
      title: `${nextTodoGoal} Day Todo Challenge`,
      description: `Complete todos for ${nextTodoGoal - todoStreaks.current} more days`,
      progress: (todoStreaks.current / nextTodoGoal) * 100,
      target: nextTodoGoal,
      current: todoStreaks.current,
      daysRemaining: nextTodoGoal - todoStreaks.current
    });
  }

  if (nextWorkoutGoal) {
    challenges.push({
      type: 'workout',
      title: `${nextWorkoutGoal} Day Fitness Challenge`,
      description: `Workout for ${nextWorkoutGoal - workoutStreaks.current} more days`,
      progress: (workoutStreaks.current / nextWorkoutGoal) * 100,
      target: nextWorkoutGoal,
      current: workoutStreaks.current,
      daysRemaining: nextWorkoutGoal - workoutStreaks.current
    });
  }

  if (nextProductivityGoal) {
    challenges.push({
      type: 'productivity',
      title: `${nextProductivityGoal} Day Productivity Challenge`,
      description: `Stay productive for ${nextProductivityGoal - productivityStreaks.current} more days`,
      progress: (productivityStreaks.current / nextProductivityGoal) * 100,
      target: nextProductivityGoal,
      current: productivityStreaks.current,
      daysRemaining: nextProductivityGoal - productivityStreaks.current
    });
  }

  return challenges;
}

// Helper functions
function getNextMilestone(current: number): number | null {
  const milestones = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
  return milestones.find(milestone => milestone > current) || null;
}

function getNextStreakGoal(current: number): number {
  return getNextMilestone(current) || current + 10;
}

function getStreakRank(streakLength: number): string {
  if (streakLength >= 100) return 'Legend';
  if (streakLength >= 50) return 'Expert';
  if (streakLength >= 30) return 'Advanced';
  if (streakLength >= 14) return 'Intermediate';
  if (streakLength >= 7) return 'Beginner';
  return 'Getting Started';
}

function calculateAverageDailyTodos(dailyActivity: any[]): number {
  const total = dailyActivity.reduce((sum, day) => sum + day.completedTodos, 0);
  return dailyActivity.length > 0 ? total / dailyActivity.length : 0;
}

function calculateAverageWeeklyWorkouts(dailyActivity: any[]): number {
  const weeksWithActivity = Math.ceil(dailyActivity.length / 7);
  const totalWorkouts = dailyActivity.reduce((sum, day) => sum + day.completedWorkouts, 0);
  return weeksWithActivity > 0 ? totalWorkouts / weeksWithActivity : 0;
}

function calculateAverageProductivityScore(dailyActivity: any[]): number {
  const total = dailyActivity.reduce((sum, day) => sum + day.activityScore, 0);
  return dailyActivity.length > 0 ? total / dailyActivity.length : 0;
}

function calculateWorkoutConsistency(dailyActivity: any[]): number {
  const activeDays = dailyActivity.filter(day => day.hasActivity).length;
  return dailyActivity.length > 0 ? (activeDays / dailyActivity.length) * 100 : 0;
}

function getBestDayOfWeek(dailyActivity: any[]): string {
  const dayStats: Record<number, { count: number; total: number }> = {};
  
  dailyActivity.forEach(day => {
    if (!dayStats[day.dayOfWeek]) {
      dayStats[day.dayOfWeek] = { count: 0, total: 0 };
    }
    dayStats[day.dayOfWeek].count++;
    if (day.hasActivity) dayStats[day.dayOfWeek].total++;
  });

  let bestDay = 0;
  let bestRate = 0;
  
  Object.entries(dayStats).forEach(([day, stats]) => {
    const rate = stats.total / stats.count;
    if (rate > bestRate) {
      bestRate = rate;
      bestDay = parseInt(day);
    }
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[bestDay] || 'N/A';
}

function getMostProductiveDay(dailyActivity: any[]): string {
  const dayStats: Record<number, { count: number; totalScore: number }> = {};
  
  dailyActivity.forEach(day => {
    if (!dayStats[day.dayOfWeek]) {
      dayStats[day.dayOfWeek] = { count: 0, totalScore: 0 };
    }
    dayStats[day.dayOfWeek].count++;
    dayStats[day.dayOfWeek].totalScore += day.activityScore;
  });

  let bestDay = 0;
  let bestScore = 0;
  
  Object.entries(dayStats).forEach(([day, stats]) => {
    const avgScore = stats.totalScore / stats.count;
    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestDay = parseInt(day);
    }
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[bestDay] || 'N/A';
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
} 