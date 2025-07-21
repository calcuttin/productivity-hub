import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { scheduleItemReminder } from '@/lib/due-date-reminders';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    
    const todo = await prisma.todo.findFirst({
      where: { 
        id,
        userId: user.id, // Only allow access to user's own todos
      }
    });

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error('Error fetching todo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todo' },
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
    const { id } = await params;
    const body = await request.json();
    const { title, description, completed, priority, dueDate, tags, notes } = body;

    const todo = await prisma.todo.update({
      where: { 
        id,
        userId: user.id, // Only allow updates to user's own todos
      },
      data: {
        title,
        description,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        completedAt: completed ? new Date() : null,
        tags,
        notes
      }
    });

    // Schedule due date reminder if todo has a due date and isn't completed
    if (todo.dueDate && todo.userId && !todo.completed) {
      try {
        await scheduleItemReminder(
          todo.userId,
          'todo',
          todo.id,
          todo.title,
          todo.dueDate
        );
      } catch (reminderError) {
        console.error('Failed to schedule reminder for updated todo:', reminderError);
        // Don't fail the todo update if reminder scheduling fails
      }
    }

    return NextResponse.json(todo);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
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
    const { id } = await params;
    
    await prisma.todo.delete({
      where: { 
        id,
        userId: user.id, // Only allow deletion of user's own todos
      }
    });

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
} 