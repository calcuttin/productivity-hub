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
    const timeframe = searchParams.get('timeframe') || '30'; // days
    const days = parseInt(timeframe);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Parallel queries for better performance
    const [
      projectStats,
      todoStats,
      workoutStats,
      researchStats,
      recentActivity,
      streakData
    ] = await Promise.all([
      // Project Analytics
      getProjectAnalytics(dbUser.id, startDate),
      // Todo Analytics
      getTodoAnalytics(dbUser.id, startDate),
      // Workout Analytics
      getWorkoutAnalytics(dbUser.id, startDate),
      // Research Analytics
      getResearchAnalytics(dbUser.id, startDate),
      // Recent Activity
      getRecentActivity(dbUser.id, 10),
      // Streak Data
      getStreakData(dbUser.id)
    ]);

    const analytics = {
      summary: {
        totalProjects: projectStats.total,
        completedProjects: projectStats.completed,
        totalTodos: todoStats.total,
        completedTodos: todoStats.completed,
        totalWorkouts: workoutStats.total,
        completedWorkouts: workoutStats.completed,
        totalResearchPapers: researchStats.total,
        productivity: calculateProductivityScore({
          projects: projectStats,
          todos: todoStats,
          workouts: workoutStats
        })
      },
      projects: projectStats,
      todos: todoStats,
      workouts: workoutStats,
      research: researchStats,
      recentActivity,
      streaks: streakData,
      timeframe: days
    };

    return NextResponse.json(analytics);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getProjectAnalytics(userId: string, startDate: Date) {
  const [total, completed, inProgress, overdue, byStatus, byPriority, recent] = await Promise.all([
    prisma.project.count({ where: { userId } }),
    prisma.project.count({ where: { userId, status: 'Completed' } }),
    prisma.project.count({ where: { userId, status: 'In Progress' } }),
    prisma.project.count({ 
      where: { 
        userId, 
        dueDate: { lt: new Date() },
        status: { not: 'Completed' }
      } 
    }),
    prisma.project.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true }
    }),
    prisma.project.groupBy({
      by: ['priority'],
      where: { userId },
      _count: { _all: true }
    }),
    prisma.project.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { 
        id: true, 
        name: true, 
        status: true, 
        priority: true,
        progress: true,
        createdAt: true,
        completedAt: true,
        dueDate: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  const avgProgress = await prisma.project.aggregate({
    where: { userId, status: { not: 'Completed' } },
    _avg: { progress: true }
  });

  return {
    total,
    completed,
    inProgress,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    averageProgress: Math.round(avgProgress._avg.progress || 0),
    byStatus: byStatus.reduce((acc: Record<string, number>, item) => ({ ...acc, [item.status]: item._count._all }), {}),
    byPriority: byPriority.reduce((acc: Record<string, number>, item) => ({ ...acc, [item.priority]: item._count._all }), {}),
    recent
  };
}

async function getTodoAnalytics(userId: string, startDate: Date) {
  const [total, completed, overdue, byPriority, recent, todayStats] = await Promise.all([
    prisma.todo.count({ where: { userId } }),
    prisma.todo.count({ where: { userId, completed: true } }),
    prisma.todo.count({ 
      where: { 
        userId, 
        dueDate: { lt: new Date() },
        completed: false
      } 
    }),
    prisma.todo.groupBy({
      by: ['priority'],
      where: { userId },
      _count: { _all: true }
    }),
    prisma.todo.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { 
        id: true, 
        title: true, 
        completed: true, 
        priority: true,
        createdAt: true,
        completedAt: true,
        dueDate: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    getTodayTodoStats(userId)
  ]);

  return {
    total,
    completed,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    byPriority: byPriority.reduce((acc: Record<string, number>, item) => ({ ...acc, [item.priority]: item._count._all }), {}),
    recent,
    today: todayStats
  };
}

async function getTodayTodoStats(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [todayTotal, todayCompleted] = await Promise.all([
    prisma.todo.count({
      where: {
        userId,
        OR: [
          { dueDate: { gte: today, lt: tomorrow } },
          { createdAt: { gte: today, lt: tomorrow } }
        ]
      }
    }),
    prisma.todo.count({
      where: {
        userId,
        completed: true,
        completedAt: { gte: today, lt: tomorrow }
      }
    })
  ]);

  return {
    total: todayTotal,
    completed: todayCompleted,
    completionRate: todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0
  };
}

async function getWorkoutAnalytics(userId: string, startDate: Date) {
  const [total, completed, recent, weeklyStats] = await Promise.all([
    prisma.workout.count({ where: { userId } }),
    prisma.workout.count({ where: { userId, completed: true } }),
    prisma.workout.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { 
        id: true, 
        name: true, 
        date: true,
        completed: true,
        createdAt: true
      },
      orderBy: { date: 'desc' },
      take: 5
    }),
    getWeeklyWorkoutStats(userId)
  ]);

  return {
    total,
    completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    recent,
    weekly: weeklyStats
  };
}

async function getWeeklyWorkoutStats(userId: string) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const weeklyWorkouts = await prisma.workout.findMany({
    where: {
      userId,
      date: { gte: oneWeekAgo }
    },
    select: { date: true, completed: true }
  });

  const weeklyTotal = weeklyWorkouts.length;
  const weeklyCompleted = weeklyWorkouts.filter((w: { completed: boolean }) => w.completed).length;

  return {
    total: weeklyTotal,
    completed: weeklyCompleted,
    completionRate: weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0
  };
}

async function getResearchAnalytics(userId: string, startDate: Date) {
  const [total, recent, byYear] = await Promise.all([
    prisma.researchPaper.count({ where: { userId } }),
    prisma.researchPaper.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { 
        id: true, 
        title: true, 
        publication: true,
        year: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.researchPaper.groupBy({
      by: ['year'],
      where: { userId, year: { not: null } },
      _count: { _all: true },
      orderBy: { year: 'desc' }
    })
  ]);

  return {
    total,
    recent,
    byYear: byYear.reduce((acc: Record<string, number>, item) => ({ ...acc, [item.year || 'Unknown']: item._count._all }), {})
  };
}

async function getRecentActivity(userId: string, limit: number) {
  const [recentProjects, recentTodos, recentWorkouts, recentResearch] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      select: { id: true, name: true, status: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: Math.ceil(limit / 4)
    }),
    prisma.todo.findMany({
      where: { userId },
      select: { id: true, title: true, completed: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: Math.ceil(limit / 4)
    }),
    prisma.workout.findMany({
      where: { userId },
      select: { id: true, name: true, completed: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: Math.ceil(limit / 4)
    }),
    prisma.researchPaper.findMany({
      where: { userId },
      select: { id: true, title: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: Math.ceil(limit / 4)
    })
  ]);

  const activities = [
    ...recentProjects.map(p => ({ type: 'project', item: p, updatedAt: p.updatedAt })),
    ...recentTodos.map(t => ({ type: 'todo', item: t, updatedAt: t.updatedAt })),
    ...recentWorkouts.map(w => ({ type: 'workout', item: w, updatedAt: w.updatedAt })),
    ...recentResearch.map(r => ({ type: 'research', item: r, updatedAt: r.updatedAt }))
  ];

  return activities
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

async function getStreakData(userId: string) {
  // Calculate current streaks for todos and workouts
  const todoStreak = await calculateTodoStreak(userId);
  const workoutStreak = await calculateWorkoutStreak(userId);

  return {
    todos: todoStreak,
    workouts: workoutStreak
  };
}

async function calculateTodoStreak(userId: string) {
  const today = new Date();
  let currentStreak = 0;
  let checkDate = new Date(today);
  
  // Check each day backwards until we find a day with no completed todos
  while (true) {
    const dayStart = new Date(checkDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(checkDate);
    dayEnd.setHours(23, 59, 59, 999);

    const completedTodos = await prisma.todo.count({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });

    if (completedTodos > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }

    // Prevent infinite loop - max 365 days
    if (currentStreak >= 365) break;
  }

  return currentStreak;
}

async function calculateWorkoutStreak(userId: string) {
  const today = new Date();
  let currentStreak = 0;
  let checkDate = new Date(today);
  
  // Check each day backwards until we find a day with no completed workouts
  while (true) {
    const dayStart = new Date(checkDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(checkDate);
    dayEnd.setHours(23, 59, 59, 999);

    const completedWorkouts = await prisma.workout.count({
      where: {
        userId,
        completed: true,
        date: {
          gte: dayStart,
          lte: dayEnd
        }
      }
    });

    if (completedWorkouts > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }

    // Prevent infinite loop - max 365 days
    if (currentStreak >= 365) break;
  }

  return currentStreak;
}

interface AnalyticsData {
  completionRate: number;
}

function calculateProductivityScore({ projects, todos, workouts }: { projects: AnalyticsData; todos: AnalyticsData; workouts: AnalyticsData }) {
  // Weighted productivity score out of 100
  const projectScore = projects.completionRate * 0.4; // 40% weight
  const todoScore = todos.completionRate * 0.35; // 35% weight
  const workoutScore = workouts.completionRate * 0.25; // 25% weight
  
  return Math.round(projectScore + todoScore + workoutScore);
} 