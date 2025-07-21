import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const includeSystem = searchParams.get('includeSystem') === 'true';

    // Build filter conditions
    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    if (!includeSystem) {
      where.isSystem = false;
    }

    const templates = await prisma.notificationTemplate.findMany({
      where,
      orderBy: [
        { isSystem: 'desc' },
        { type: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ templates });

  } catch (error) {
    console.error('Error fetching notification templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      type,
      title,
      message,
      priority = 'medium',
      emailEnabled = true,
      browserEnabled = true,
      pushEnabled = false,
      defaultTiming,
      customTiming,
      variables = [],
      description,
      isActive = true,
    } = body;

    // Validate required fields
    if (!name || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Name, type, title, and message are required' },
        { status: 400 }
      );
    }

    // Check if template name already exists
    const existingTemplate = await prisma.notificationTemplate.findUnique({
      where: { name },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Template with this name already exists' },
        { status: 409 }
      );
    }

    // Create the template
    const template = await prisma.notificationTemplate.create({
      data: {
        name,
        type,
        title,
        message,
        priority,
        emailEnabled,
        browserEnabled,
        pushEnabled,
        defaultTiming,
        customTiming,
        variables,
        description,
        isActive,
        isSystem: false, // User-created templates are not system templates
      },
    });

    return NextResponse.json(template, { status: 201 });

  } catch (error) {
    console.error('Error creating notification template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 