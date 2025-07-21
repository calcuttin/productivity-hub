import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Prisma Project type
import { requireAuth } from '@/lib/auth';
import { scheduleItemReminder } from '@/lib/due-date-reminders';

interface Params {
  params: { id: string };
}

// GET /api/projects/[id] - Fetch a single project for the authenticated user
export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const user = await requireAuth();
    
    const project = await prisma.project.findFirst({
      where: { 
        id,
        userId: user.id, // Only allow access to user's own projects
      },
      include: {
        subtasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error(`Failed to fetch project ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch project", error: (error as Error).message }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update a project for the authenticated user
export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const user = await requireAuth();
    const body = await request.json();
    const {
      name,
      description,
      status,
      dueDate,
      progress,
      priority,
      course,
      assignmentType,
      instructor,
      grade,
      maxGrade,
      notes,
      estimatedHours,
      actualHours,
      tags,
      subtasks
    } = body;

    if (!name || !status) {
      return NextResponse.json({ message: 'Name and status are required' }, { status: 400 });
    }

    // If subtasks are provided, we need to handle them separately
    const updateData: {[key: string]: any} = {
      name,
      description,
      status,
      dueDate: dueDate ? new Date(dueDate) : null,
      progress: progress ? parseInt(progress, 10) : 0,
      priority: priority || 'Medium',
      course: course || null,
      assignmentType: assignmentType || null,
      instructor: instructor || null,
      grade: grade ? parseInt(grade, 10) : null,
      maxGrade: maxGrade ? parseInt(maxGrade, 10) : null,
      notes: notes || null,
      estimatedHours: estimatedHours ? parseInt(estimatedHours, 10) : null,
      actualHours: actualHours ? parseInt(actualHours, 10) : null,
      tags: tags || [],
      updatedAt: new Date(),
    };

    // Handle subtasks if provided
    if (subtasks !== undefined) {
      updateData.subtasks = {
        deleteMany: {}, // Delete all existing subtasks first
        create: subtasks.map((subtask: {name?: string, title?: string, description?: string, status?: string, completed?: boolean, priority?: string, dueDate?: string}, index: number) => ({
          name: subtask.name || subtask.title,
          description: subtask.description,
          status: subtask.status || (subtask.completed ? 'Completed' : 'Not Started'),
          priority: subtask.priority || 'Medium',
          dueDate: subtask.dueDate ? new Date(subtask.dueDate) : null,
          progress: subtask.completed ? 100 : 0,
          order: index
        }))
      };
    }

    const updatedProject = await prisma.project.update({
      where: { 
        id,
        userId: user.id, // Only allow updates to user's own projects
      },
      data: updateData,
      include: {
        subtasks: true
      }
    });

    // Schedule due date reminder if project has a due date and user exists
    if (updatedProject.dueDate && updatedProject.userId) {
      try {
        await scheduleItemReminder(
          updatedProject.userId,
          'project',
          updatedProject.id,
          updatedProject.name,
          updatedProject.dueDate
        );
      } catch (reminderError) {
        console.error('Failed to schedule reminder for updated project:', reminderError);
        // Don't fail the project update if reminder scheduling fails
      }
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error(`Failed to update project ${id}:`, error);
    // Handle specific errors like P2025 (Record to update not found)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Project not found for update' }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to update project", error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project for the authenticated user
export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const user = await requireAuth();
    
    await prisma.project.delete({
      where: { 
        id,
        userId: user.id, // Only allow deletion of user's own projects
      },
    });
    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error(`Failed to delete project ${id}:`, error);
    // Handle specific errors like P2025 (Record to delete not found)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Project not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to delete project", error: (error as Error).message }, { status: 500 });
  }
} 