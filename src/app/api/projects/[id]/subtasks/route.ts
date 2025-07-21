import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

interface Params {
  params: { id: string };
}

// GET /api/projects/[id]/subtasks - Get all subtasks for a project
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const user = await requireAuth();
    
    // Verify the project belongs to the user
    const project = await prisma.project.findFirst({
      where: { 
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    const subtasks = await prisma.subtask.findMany({
      where: {
        projectId: id,
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json(subtasks);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error(`Failed to fetch subtasks for project ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch subtasks", error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/projects/[id]/subtasks - Add a new subtask to a project
export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, description, priority, dueDate, status } = body;

    if (!name) {
      return NextResponse.json({ message: 'Subtask name is required' }, { status: 400 });
    }

    // Verify the project belongs to the user
    const project = await prisma.project.findFirst({
      where: { 
        id,
        userId: user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Get the next order number
    const lastSubtask = await prisma.subtask.findFirst({
      where: { projectId: id },
      orderBy: { order: 'desc' }
    });

    const nextOrder = lastSubtask ? lastSubtask.order + 1 : 0;

    const newSubtask = await prisma.subtask.create({
      data: {
        name,
        description: description || null,
        priority: priority || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: status || 'Not Started',
        order: nextOrder,
        projectId: id,
      },
    });

    // Update project progress based on completed subtasks
    await updateProjectProgress(id);

    return NextResponse.json(newSubtask, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error(`Failed to create subtask for project ${id}:`, error);
    return NextResponse.json({ message: "Failed to create subtask", error: (error as Error).message }, { status: 500 });
  }
}

// Helper function to update project progress based on subtasks
async function updateProjectProgress(projectId: string) {
  const subtasks = await prisma.subtask.findMany({
    where: { projectId }
  });

  if (subtasks.length === 0) {
    await prisma.project.update({
      where: { id: projectId },
      data: { progress: 0 }
    });
    return;
  }

  const completedSubtasks = subtasks.filter(subtask => subtask.status === 'Completed');
  const progress = Math.round((completedSubtasks.length / subtasks.length) * 100);

  await prisma.project.update({
    where: { id: projectId },
    data: { 
      progress,
      status: progress === 100 ? 'Completed' : (progress > 0 ? 'In Progress' : 'Not Started')
    }
  });
} 