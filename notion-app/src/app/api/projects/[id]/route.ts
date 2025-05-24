import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Project } from '@prisma/client';

interface Params {
  params: { id: string };
}

// GET /api/projects/[id] - Fetch a single project
export async function GET(request: Request, { params }: Params) {
  const { id } = params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error(`Failed to fetch project ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch project", error: (error as Error).message }, { status: 500 });
  }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(request: Request, { params }: Params) {
  const { id } = params;
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

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        progress: progress ? parseInt(progress, 10) : null,
        updatedAt: new Date(), // Explicitly set updatedAt
      },
    });
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error(`Failed to update project ${id}:`, error);
    // Handle specific errors like P2025 (Record to update not found)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Project not found for update' }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to update project", error: (error as Error).message }, { status: 500 });
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: Request, { params }: Params) {
  const { id } = params;
  try {
    await prisma.project.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (error) {
    console.error(`Failed to delete project ${id}:`, error);
    // Handle specific errors like P2025 (Record to delete not found)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Project not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to delete project", error: (error as Error).message }, { status: 500 });
  }
} 