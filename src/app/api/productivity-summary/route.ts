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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week'; // week, month, quarter, year
    const offset = parseInt(searchParams.get('offset') || '0'); // 0 = current, 1 = previous, etc.

    const summary = await getProductivitySummary(dbUser.id, period, offset);
    
    return NextResponse.json(summary);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Productivity Summary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getProductivitySummary(userId: string, period: string, offset: number) {
  const { startDate, endDate, previousStartDate, previousEndDate } = getDateRanges(period, offset);
  
  // Parallel queries for current and previous period data
  const [
    currentPeriodData,
    previousPeriodData,
    achievements,
    milestones,
    habits
  ] = await Promise.all([
    getPeriodData(userId, startDate, endDate),
    getPeriodData(userId, previousStartDate, previousEndDate),
    getAchievements(userId, startDate, endDate),
    getMilestones(userId, startDate, endDate),
    getHabits(userId, startDate, endDate)
  ]);

  const improvements = calculateImprovements(currentPeriodData, previousPeriodData);
  const productivityScore = calculatePeriodProductivityScore(currentPeriodData);
  const insights = generateInsights(currentPeriodData, previousPeriodData, achievements);

  return {
    period: {
      type: period,
      offset,
      startDate,
      endDate,
      label: getPeriodLabel(period, offset)
    },
    metrics: currentPeriodData,
    improvements,
    productivityScore,
    achievements,
    milestones,
    habits,
    insights,
    comparison: {
      previous: previousPeriodData,
      improvements
    }
  };
}

function getDateRanges(period: string, offset: number) {
  const now = new Date();
  let startDate: Date, endDate: Date, previousStartDate: Date, previousEndDate: Date;

  switch (period) {
    case 'week':
      // Get start of week (Sunday)
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() - (offset * 7));
      startOfWeek.setHours(0, 0, 0, 0);
      
      startDate = startOfWeek;
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(startDate.getDate() - 7);
      previousEndDate = new Date(endDate);
      previousEndDate.setDate(endDate.getDate() - 7);
      break;

    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - offset - 1, 1);
      previousEndDate = new Date(now.getFullYear(), now.getMonth() - offset, 0);
      previousEndDate.setHours(23, 59, 59, 999);
      break;

    case 'quarter':
      const quarterStartMonth = Math.floor((now.getMonth() - (offset * 3)) / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
      endDate = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
      endDate.setHours(23, 59, 59, 999);
      
      previousStartDate = new Date(now.getFullYear(), quarterStartMonth - 3, 1);
      previousEndDate = new Date(now.getFullYear(), quarterStartMonth, 0);
      previousEndDate.setHours(23, 59, 59, 999);
      break;

    case 'year':
      startDate = new Date(now.getFullYear() - offset, 0, 1);
      endDate = new Date(now.getFullYear() - offset, 11, 31);
      endDate.setHours(23, 59, 59, 999);
      
      previousStartDate = new Date(now.getFullYear() - offset - 1, 0, 1);
      previousEndDate = new Date(now.getFullYear() - offset - 1, 11, 31);
      previousEndDate.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error('Invalid period');
  }

  return { startDate, endDate, previousStartDate, previousEndDate };
}

async function getPeriodData(userId: string, startDate: Date, endDate: Date) {
  const [
    projects,
    todos,
    workouts,
    research,
    dailyActivity
  ] = await Promise.all([
    // Projects data
    Promise.all([
      prisma.project.count({ 
        where: { 
          userId, 
          createdAt: { gte: startDate, lte: endDate } 
        } 
      }),
      prisma.project.count({ 
        where: { 
          userId, 
          updatedAt: { gte: startDate, lte: endDate },
          status: 'Completed'
        } 
      }),
      prisma.project.aggregate({
        where: { 
          userId, 
          updatedAt: { gte: startDate, lte: endDate } 
        },
        _avg: { progress: true }
      })
    ]).then(([created, completed, avgProgress]) => ({ 
      created, 
      completed, 
      avgProgress: avgProgress._avg.progress || 0 
    })),

    // Todos data
    Promise.all([
      prisma.todo.count({ 
        where: { 
          userId, 
          createdAt: { gte: startDate, lte: endDate } 
        } 
      }),
      prisma.todo.count({ 
        where: { 
          userId, 
          updatedAt: { gte: startDate, lte: endDate },
          completed: true
        } 
      }),
      prisma.todo.groupBy({
        by: ['priority'],
        where: { 
          userId, 
          updatedAt: { gte: startDate, lte: endDate },
          completed: true
        },
        _count: { _all: true }
      })
    ]).then(([created, completed, byPriority]) => ({ 
      created, 
      completed, 
      highPriorityCompleted: byPriority.find(p => p.priority === 'High')?._count._all || 0,
      mediumPriorityCompleted: byPriority.find(p => p.priority === 'Medium')?._count._all || 0,
      lowPriorityCompleted: byPriority.find(p => p.priority === 'Low')?._count._all || 0
    })),

         // Workouts data
     Promise.all([
       prisma.workout.count({ 
         where: { 
           userId, 
           date: { gte: startDate, lte: endDate } 
         } 
       }),
       prisma.workout.count({ 
         where: { 
           userId, 
           date: { gte: startDate, lte: endDate },
           completed: true
         } 
       })
     ]).then(([planned, completed]) => ({ 
       planned, 
       completed, 
       completionRate: planned > 0 ? (completed / planned) * 100 : 0
     })),

         // Research data
     Promise.all([
       prisma.researchPaper.count({ 
         where: { 
           userId, 
           createdAt: { gte: startDate, lte: endDate } 
         } 
       })
     ]).then(([added]) => ({ added, read: 0 })),

    // Daily activity counts
    getDailyActivityCounts(userId, startDate, endDate)
  ]);

  return {
    projects,
    todos,
    workouts,
    research,
    dailyActivity,
    focusTime: calculateFocusTime(dailyActivity),
    consistency: calculateConsistency(dailyActivity)
  };
}

async function getDailyActivityCounts(userId: string, startDate: Date, endDate: Date) {
  const days = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const [todoCount, workoutCount, projectUpdates] = await Promise.all([
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

    days.push({
      date: new Date(currentDate),
      todos: todoCount,
      workouts: workoutCount,
      projectUpdates,
      isActive: todoCount > 0 || workoutCount > 0 || projectUpdates > 0
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
}

async function getAchievements(userId: string, startDate: Date, endDate: Date) {
  const achievements = [];

  // Project achievements
  const projectsCompleted = await prisma.project.count({
    where: {
      userId,
      updatedAt: { gte: startDate, lte: endDate },
      status: 'Completed'
    }
  });

  if (projectsCompleted >= 5) {
    achievements.push({
      type: 'project',
      title: 'Project Master',
      description: `Completed ${projectsCompleted} projects`,
      icon: '🏆',
      date: endDate
    });
  } else if (projectsCompleted >= 1) {
    achievements.push({
      type: 'project',
      title: 'Goal Achiever',
      description: `Completed ${projectsCompleted} project${projectsCompleted > 1 ? 's' : ''}`,
      icon: '✅',
      date: endDate
    });
  }

  // Todo achievements
  const todosCompleted = await prisma.todo.count({
    where: {
      userId,
      updatedAt: { gte: startDate, lte: endDate },
      completed: true
    }
  });

  if (todosCompleted >= 50) {
    achievements.push({
      type: 'todo',
      title: 'Productivity Champion',
      description: `Completed ${todosCompleted} tasks`,
      icon: '⚡',
      date: endDate
    });
  } else if (todosCompleted >= 20) {
    achievements.push({
      type: 'todo',
      title: 'Task Master',
      description: `Completed ${todosCompleted} tasks`,
      icon: '📋',
      date: endDate
    });
  }

  // Workout achievements
  const workoutsCompleted = await prisma.workout.count({
    where: {
      userId,
      date: { gte: startDate, lte: endDate },
      completed: true
    }
  });

  if (workoutsCompleted >= 7) {
    achievements.push({
      type: 'workout',
      title: 'Fitness Dedication',
      description: `Completed ${workoutsCompleted} workouts`,
      icon: '💪',
      date: endDate
    });
  } else if (workoutsCompleted >= 3) {
    achievements.push({
      type: 'workout',
      title: 'Staying Active',
      description: `Completed ${workoutsCompleted} workouts`,
      icon: '🏃',
      date: endDate
    });
  }

  return achievements;
}

async function getMilestones(userId: string, startDate: Date, endDate: Date) {
  const milestones = [];

  // First project completion
  const firstProject = await prisma.project.findFirst({
    where: {
      userId,
      status: 'Completed',
      updatedAt: { gte: startDate, lte: endDate }
    },
    orderBy: { updatedAt: 'asc' }
  });

     if (firstProject) {
     milestones.push({
       type: 'first_project',
       title: 'First Project Completed',
       description: `"${firstProject.name}" - Your productivity journey begins!`,
       date: firstProject.updatedAt,
       icon: '🎯'
     });
   }

  // Streak milestones
  const currentStreak = await calculateCurrentStreak(userId, endDate);
  if (currentStreak >= 7) {
    milestones.push({
      type: 'streak',
      title: `${currentStreak}-Day Streak`,
      description: 'Consistent daily productivity!',
      date: endDate,
      icon: '🔥'
    });
  }

  return milestones;
}

async function getHabits(userId: string, startDate: Date, endDate: Date) {
  const dailyData = await getDailyActivityCounts(userId, startDate, endDate);
  
  const activeDays = dailyData.filter(day => day.isActive).length;
  const totalDays = dailyData.length;
  const consistencyRate = totalDays > 0 ? (activeDays / totalDays) * 100 : 0;

  // Best performing day of week
  const dayStats = dailyData.reduce((acc, day) => {
    const dayName = day.date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!acc[dayName]) {
      acc[dayName] = { count: 0, totalActivity: 0 };
    }
    acc[dayName].count++;
    acc[dayName].totalActivity += day.todos + day.workouts + day.projectUpdates;
    return acc;
  }, {} as Record<string, { count: number; totalActivity: number }>);

  const bestDay = Object.entries(dayStats).reduce((best, [day, stats]) => {
    const avgActivity = stats.totalActivity / stats.count;
    return avgActivity > best.avgActivity ? { day, avgActivity } : best;
  }, { day: '', avgActivity: 0 });

  return {
    consistencyRate,
    activeDays,
    totalDays,
    bestDayOfWeek: bestDay.day,
    averageDailyTasks: dailyData.reduce((sum, day) => sum + day.todos, 0) / totalDays,
    averageWeeklyWorkouts: dailyData.filter(day => day.workouts > 0).length
  };
}

function calculateImprovements(current: any, previous: any) {
  const calculateChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  return {
    projectsCompleted: calculateChange(current.projects.completed, previous.projects.completed),
    todosCompleted: calculateChange(current.todos.completed, previous.todos.completed),
    workoutCompletionRate: calculateChange(current.workouts.completionRate, previous.workouts.completionRate),
    consistency: calculateChange(current.consistency, previous.consistency),
    focusTime: calculateChange(current.focusTime, previous.focusTime)
  };
}

function calculatePeriodProductivityScore(data: any) {
  const projectScore = Math.min((data.projects.completed * 20) + (data.projects.avgProgress * 0.3), 40);
  const todoScore = Math.min(data.todos.completed * 0.5, 30);
  const workoutScore = Math.min(data.workouts.completionRate * 0.2, 20);
  const consistencyScore = data.consistency * 0.1;

  return Math.round(projectScore + todoScore + workoutScore + consistencyScore);
}

function calculateFocusTime(dailyActivity: any[]) {
  // Estimate focus time based on activities (simplified calculation)
  return dailyActivity.reduce((total, day) => {
    return total + (day.todos * 15) + (day.projectUpdates * 30) + (day.workouts * 45);
  }, 0); // in minutes
}

function calculateConsistency(dailyActivity: any[]) {
  const activeDays = dailyActivity.filter(day => day.isActive).length;
  return dailyActivity.length > 0 ? (activeDays / dailyActivity.length) * 100 : 0;
}

async function calculateCurrentStreak(userId: string, endDate: Date) {
  let streak = 0;
  const currentDate = new Date(endDate);
  
  while (true) {
    const dayStart = new Date(currentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const hasActivity = await prisma.todo.count({
      where: {
        userId,
        updatedAt: { gte: dayStart, lte: dayEnd },
        completed: true
      }
    }) > 0;

    if (!hasActivity) break;
    
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
    
    if (streak > 365) break; // Safety limit
  }

  return streak;
}

function generateInsights(current: any, previous: any, achievements: any[]) {
  const insights = [];

  // Productivity trends
  if (current.todos.completed > previous.todos.completed) {
    insights.push({
      type: 'positive',
      title: 'Task Completion Improved',
      description: `You completed ${current.todos.completed - previous.todos.completed} more tasks than last period`,
      icon: '📈'
    });
  }

  // Consistency insights
  if (current.consistency > 80) {
    insights.push({
      type: 'positive',
      title: 'Excellent Consistency',
      description: `You stayed active ${current.consistency.toFixed(1)}% of days`,
      icon: '🎯'
    });
  } else if (current.consistency < 50) {
    insights.push({
      type: 'suggestion',
      title: 'Consistency Opportunity',
      description: 'Try setting smaller daily goals to build momentum',
      icon: '💡'
    });
  }

  // Achievement insights
  if (achievements.length > 0) {
    insights.push({
      type: 'celebration',
      title: 'New Achievements',
      description: `You earned ${achievements.length} new achievement${achievements.length > 1 ? 's' : ''}!`,
      icon: '🏆'
    });
  }

  return insights;
}

function getPeriodLabel(period: string, offset: number) {
  const now = new Date();
  
  switch (period) {
    case 'week':
      if (offset === 0) return 'This Week';
      if (offset === 1) return 'Last Week';
      return `${offset} weeks ago`;
    
    case 'month':
      if (offset === 0) return 'This Month';
      if (offset === 1) return 'Last Month';
      const monthName = new Date(now.getFullYear(), now.getMonth() - offset, 1)
        .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return monthName;
    
    case 'quarter':
      if (offset === 0) return 'This Quarter';
      if (offset === 1) return 'Last Quarter';
      return `Q${Math.floor((now.getMonth() - (offset * 3)) / 3) + 1} ${now.getFullYear()}`;
    
    case 'year':
      const year = now.getFullYear() - offset;
      if (offset === 0) return 'This Year';
      if (offset === 1) return 'Last Year';
      return year.toString();
    
    default:
      return 'Unknown Period';
  }
} 