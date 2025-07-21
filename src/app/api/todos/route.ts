import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { scheduleItemReminder } from '@/lib/due-date-reminders';

export async function GET() {
  try {
    const user = await requireAuth();
    
    const todos = await prisma.todo.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    
    return NextResponse.json(todos);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { title, description, priority, dueDate, tags, notes } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description,
        priority: priority || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        notes,
        userId: user.id,
      }
    });

    // Schedule due date reminder if todo has a due date
    if (todo.dueDate && todo.userId) {
      try {
        await scheduleItemReminder(
          todo.userId,
          'todo',
          todo.id,
          todo.title,
          todo.dueDate
        );
      } catch (reminderError) {
        console.error('Failed to schedule reminder for todo:', reminderError);
        // Don't fail the todo creation if reminder scheduling fails
      }
    }

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
} 