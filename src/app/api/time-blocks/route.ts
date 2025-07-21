import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    const where: any = {
      userId: user.id,
      activityType: { in: ['meeting', 'project', 'todo', 'workout', 'break'] }
    };
    
    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      where.startTime = {
        gte: targetDate,
        lt: nextDate
      };
    } else if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const timeBlocks = await prisma.timeSession.findMany({
      where,
      orderBy: { startTime: 'asc' }
    });

    return NextResponse.json(timeBlocks);
  } catch (error) {
    console.error('Time blocks API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time blocks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { title, description, startTime, endTime, activityType, category, tags, notes } = body;

    if (!title || !startTime || !activityType) {
      return NextResponse.json(
        { error: 'Title, startTime, and activityType are required' },
        { status: 400 }
      );
    }

    const timeBlock = await prisma.timeSession.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        activityType,
        category,
        tags: tags || [],
        notes,
        userId: user.id,
      }
    });

    return NextResponse.json(timeBlock, { status: 201 });
  } catch (error) {
    console.error('Time blocks API error:', error);
    return NextResponse.json(
      { error: 'Failed to create time block' },
      { status: 500 }
    );
  }
} 