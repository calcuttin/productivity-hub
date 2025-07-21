import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const timeframeParam = searchParams.get('timeframe') || 'week';
    let timeframe: number;
    let startDate = new Date();
    
    // Set timeframe based on parameter
    switch (timeframeParam) {
      case 'week':
        timeframe = 7;
        break;
      case 'month':
        timeframe = 30;
        break;
      case 'year':
        timeframe = 365;
        break;
      default:
        timeframe = 7;
    }
    
    startDate.setDate(startDate.getDate() - timeframe);

    // Get all sessions in timeframe
    const sessions = await prisma.timeSession.findMany({
      where: {
        userId: user.id,
        startTime: { gte: startDate },
        duration: { not: null }
      },
      include: {
        project: { select: { id: true, name: true } },
        todo: { select: { id: true, title: true } },
        research: { select: { id: true, title: true } },
        workout: { select: { id: true, name: true } }
      },
      orderBy: { startTime: 'desc' }
    });

    // Calculate total time in minutes
    const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const sessionsCount = sessions.length;
    const averageSessionLength = sessionsCount > 0 ? totalTime / sessionsCount : 0;

    // Calculate activity breakdown in minutes
    const activityBreakdown = sessions.reduce((acc, session) => {
      const minutes = session.duration || 0;
      acc[session.activityType] = (acc[session.activityType] || 0) + minutes;
      return acc;
    }, {} as Record<string, number>);

    // Calculate weekly trend (last 7 days)
    const weeklyTrend = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(session => {
        const sessionDate = session.startTime.toISOString().split('T')[0];
        return sessionDate === dateStr;
      });
      
      const dayTotalTime = daySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      weeklyTrend.push({ date: dateStr, totalTime: dayTotalTime });
    }

    // Calculate most productive day
    const dailyTotals = weeklyTrend.reduce((acc, day) => {
      acc[day.date] = day.totalTime;
      return acc;
    }, {} as Record<string, number>);
    
    const mostProductiveDay = Object.entries(dailyTotals)
      .reduce((best, [date, time]) => time > (dailyTotals[best] || 0) ? date : best, '');

    // Calculate most productive hour
    const hourlyPatterns = sessions.reduce((acc, session) => {
      const hour = session.startTime.getHours();
      const minutes = session.duration || 0;
      acc[hour] = (acc[hour] || 0) + minutes;
      return acc;
    }, {} as Record<number, number>);
    
    const mostProductiveHour = Object.entries(hourlyPatterns)
      .reduce((best, [hour, time]) => time > (hourlyPatterns[parseInt(best)] || 0) ? hour : best, '-1');

    // Convert to number for the return value
    const mostProductiveHourNumber = mostProductiveHour === '-1' ? -1 : parseInt(mostProductiveHour);

    // Calculate daily averages
    const dailyAverages: Record<string, number> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    dayNames.forEach((dayName, dayIndex) => {
      const daySessions = sessions.filter(session => session.startTime.getDay() === dayIndex);
      const dayTotalTime = daySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      dailyAverages[dayName] = dayTotalTime;
    });

    // Return data in the format expected by the dashboard
    const analytics = {
      totalTime,
      sessionsCount,
      averageSessionLength,
      mostProductiveDay,
      mostProductiveHour: mostProductiveHourNumber,
      activityBreakdown,
      weeklyTrend,
      dailyAverages
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Time analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time analytics' },
      { status: 500 }
    );
  }
} 