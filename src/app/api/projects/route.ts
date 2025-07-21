import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Import Prisma-generated Project type
import { requireAuth } from '@/lib/auth';
import { scheduleItemReminder } from '@/lib/due-date-reminders';

// GET /api/projects - Fetch all projects for the authenticated user
export async function GET() {
  try {
    const user = await requireAuth();
    
    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
      },
      include: {
        subtasks: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        dueDate: 'asc', // Or createdAt, or another preferred order
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ message: "Failed to fetch projects", error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/projects - Create a new project for the authenticated user
export async function POST(request: Request) {
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

    const newProject = await prisma.project.create({
      data: {
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
        userId: user.id,
        subtasks: subtasks ? {
          create: subtasks.map((subtask: {name?: string, title?: string, description?: string, status?: string, completed?: boolean, priority?: string, dueDate?: string}, index: number) => ({
            name: subtask.name || subtask.title,
            description: subtask.description,
            status: subtask.status || (subtask.completed ? 'Completed' : 'Not Started'),
            priority: subtask.priority || 'Medium',
            dueDate: subtask.dueDate ? new Date(subtask.dueDate) : null,
            progress: subtask.completed ? 100 : 0,
            order: index
          }))
        } : undefined,
      },
      include: {
        subtasks: true
      }
    });

    // Schedule due date reminder if project has a due date
    if (newProject.dueDate && newProject.userId) {
      try {
        await scheduleItemReminder(
          newProject.userId,
          'project',
          newProject.id,
          newProject.name,
          newProject.dueDate
        );
      } catch (reminderError) {
        console.error('Failed to schedule reminder for project:', reminderError);
        // Don't fail the project creation if reminder scheduling fails
      }
    }

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error("Failed to create project:", error);
    return NextResponse.json({ message: "Failed to create project", error: (error as Error).message }, { status: 500 });
  }
} 