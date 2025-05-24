import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Project } from '@prisma/client'; // Import Prisma-generated Project type

// GET /api/projects - Fetch all projects
export async function GET(request: Request) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        dueDate: 'asc', // Or createdAt, or another preferred order
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ message: "Failed to fetch projects", error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      status,
      dueDate,
      progress
    } = body;

    if (!name || !status) {
      return NextResponse.json({ message: 'Name and status are required' }, { status: 400 });
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null, // Ensure dueDate is a Date object or null
        progress: progress ? parseInt(progress, 10) : null,
      },
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ message: "Failed to create project", error: (error as Error).message }, { status: 500 });
  }
} 