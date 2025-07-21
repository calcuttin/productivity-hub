import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    
    const session = await prisma.timeSession.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        project: { select: { id: true, name: true } },
        todo: { select: { id: true, title: true } },
        research: { select: { id: true, title: true } },
        workout: { select: { id: true, name: true } }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Time session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error('Time session fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time session' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const {
      title,
      description,
      endTime,
      isActive,
      activityType,
      category,
      tags,
      projectId,
      todoId,
      researchId,
      workoutId,
      productivity,
      focus,
      energy,
      mood,
      location,
      notes,
      stopSession
    } = body;

    // Find the session
    const existingSession = await prisma.timeSession.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Time session not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (activityType !== undefined) updateData.activityType = activityType;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (projectId !== undefined) updateData.projectId = projectId;
    if (todoId !== undefined) updateData.todoId = todoId;
    if (researchId !== undefined) updateData.researchId = researchId;
    if (workoutId !== undefined) updateData.workoutId = workoutId;
    if (productivity !== undefined) updateData.productivity = productivity;
    if (focus !== undefined) updateData.focus = focus;
    if (energy !== undefined) updateData.energy = energy;
    if (mood !== undefined) updateData.mood = mood;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;

    // Handle stopping the session
    if (stopSession || endTime) {
      const sessionEndTime = endTime ? new Date(endTime) : new Date();
      const duration = Math.floor((sessionEndTime.getTime() - existingSession.startTime.getTime()) / 1000);
      
      updateData.endTime = sessionEndTime;
      updateData.isActive = false;
      updateData.duration = duration;
    } else if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const session = await prisma.timeSession.update({
      where: { id: params.id },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        todo: { select: { id: true, title: true } },
        research: { select: { id: true, title: true } },
        workout: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error('Time session update error:', error);
    return NextResponse.json(
      { error: 'Failed to update time session' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    
    const session = await prisma.timeSession.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Time session not found' },
        { status: 404 }
      );
    }

    await prisma.timeSession.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Time session deleted successfully' });
  } catch (error) {
    console.error('Time session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete time session' },
      { status: 500 }
    );
  }
} 