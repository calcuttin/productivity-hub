import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    
    const timeBlock = await prisma.timeSession.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        activityType: { in: ['meeting', 'project', 'todo', 'workout', 'break'] }
      }
    });

    if (!timeBlock) {
      return NextResponse.json({ error: 'Time block not found' }, { status: 404 });
    }

    return NextResponse.json(timeBlock);
  } catch (error) {
    console.error('Time block API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time block' },
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
    const { title, description, startTime, endTime, activityType, category, tags, notes } = body;

    const existingTimeBlock = await prisma.timeSession.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        activityType: { in: ['meeting', 'project', 'todo', 'workout', 'break'] }
      }
    });

    if (!existingTimeBlock) {
      return NextResponse.json({ error: 'Time block not found' }, { status: 404 });
    }

    const updatedTimeBlock = await prisma.timeSession.update({
      where: { id: params.id },
      data: {
        title: title || existingTimeBlock.title,
        description: description !== undefined ? description : existingTimeBlock.description,
        startTime: startTime ? new Date(startTime) : existingTimeBlock.startTime,
        endTime: endTime ? new Date(endTime) : existingTimeBlock.endTime,
        activityType: activityType || existingTimeBlock.activityType,
        category: category !== undefined ? category : existingTimeBlock.category,
        tags: tags || existingTimeBlock.tags,
        notes: notes !== undefined ? notes : existingTimeBlock.notes,
      }
    });

    return NextResponse.json(updatedTimeBlock);
  } catch (error) {
    console.error('Time block API error:', error);
    return NextResponse.json(
      { error: 'Failed to update time block' },
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
    
    const existingTimeBlock = await prisma.timeSession.findFirst({
      where: {
        id: params.id,
        userId: user.id,
        activityType: { in: ['meeting', 'project', 'todo', 'workout', 'break'] }
      }
    });

    if (!existingTimeBlock) {
      return NextResponse.json({ error: 'Time block not found' }, { status: 404 });
    }

    await prisma.timeSession.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Time block deleted successfully' });
  } catch (error) {
    console.error('Time block API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete time block' },
      { status: 500 }
    );
  }
} 