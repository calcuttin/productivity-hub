import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

interface Params {
  params: { id: string; subtaskId: string };
}

// PUT /api/projects/[id]/subtasks/[subtaskId] - Update a subtask
export async function PUT(request: Request, { params }: Params) {
  const { id, subtaskId } = await params;
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { name, description, priority, dueDate, status, completed } = body;

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

    // Verify the subtask exists and belongs to this project
    const existingSubtask = await prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        projectId: id,
      },
    });

    if (!existingSubtask) {
      return NextResponse.json({ message: 'Subtask not found' }, { status: 404 });
    }

    // Determine status based on completed flag if provided
    let finalStatus = status;
    if (completed !== undefined) {
      finalStatus = completed ? 'Completed' : 'Not Started';
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        name: name || existingSubtask.name,
        description: description !== undefined ? description : existingSubtask.description,
        priority: priority || existingSubtask.priority,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : existingSubtask.dueDate,
        status: finalStatus || existingSubtask.status,
        progress: finalStatus === 'Completed' ? 100 : (finalStatus === 'Not Started' ? 0 : existingSubtask.progress),
        completedAt: finalStatus === 'Completed' ? new Date() : null,
        updatedAt: new Date(),
      },
    });

    // Update project progress based on completed subtasks
    await updateProjectProgress(id);

    return NextResponse.json(updatedSubtask);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error(`Failed to update subtask ${subtaskId}:`, error);
    return NextResponse.json({ message: "Failed to update subtask", error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/subtasks/[subtaskId] - Delete a subtask
export async function DELETE(request: Request, { params }: Params) {
  const { id, subtaskId } = await params;
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

    // Verify the subtask exists and belongs to this project
    const existingSubtask = await prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        projectId: id,
      },
    });

    if (!existingSubtask) {
      return NextResponse.json({ message: 'Subtask not found' }, { status: 404 });
    }

    await prisma.subtask.delete({
      where: { id: subtaskId },
    });

    // Update project progress based on remaining subtasks
    await updateProjectProgress(id);

    return NextResponse.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error(`Failed to delete subtask ${subtaskId}:`, error);
    return NextResponse.json({ message: "Failed to delete subtask", error: (error as Error).message }, { status: 500 });
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