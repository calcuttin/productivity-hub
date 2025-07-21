import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const activityType = searchParams.get('activityType');
    const isActive = searchParams.get('isActive');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const where: any = {
      userId: user.id
    };
    
    if (activityType) where.activityType = activityType;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (startDate) where.startTime = { gte: new Date(startDate) };
    if (endDate) {
      where.startTime = {
        ...where.startTime,
        lte: new Date(endDate)
      };
    }

    const sessions = await prisma.timeSession.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        todo: { select: { id: true, title: true } },
        research: { select: { id: true, title: true } },
        workout: { select: { id: true, name: true } }
      },
      orderBy: { startTime: 'desc' },
      take: limit
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Time sessions API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const {
      title,
      description,
      activityType,
      category,
      tags,
      projectId,
      todoId,
      researchId,
      workoutId,
      location,
      notes
    } = body;

    // Check if user has an active session and stop it if requested
    if (body.stopActiveSession) {
      const activeSessions = await prisma.timeSession.findMany({
        where: {
          userId: user.id,
          isActive: true
        }
      });
      
      // Stop active sessions and calculate duration
      for (const session of activeSessions) {
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);
        
        await prisma.timeSession.update({
          where: { id: session.id },
          data: {
            endTime,
            isActive: false,
            duration
          }
        });
      }
    }

    // Create new session
    const session = await prisma.timeSession.create({
      data: {
        title: title || `${activityType} session`,
        description,
        startTime: new Date(),
        isActive: true,
        activityType,
        category,
        tags: tags || [],
        projectId,
        todoId,
        researchId,
        workoutId,
        location,
        notes,
        userId: user.id
      },
      include: {
        project: { select: { id: true, name: true } },
        todo: { select: { id: true, title: true } },
        research: { select: { id: true, title: true } },
        workout: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Time session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create time session' },
      { status: 500 }
    );
  }
} 