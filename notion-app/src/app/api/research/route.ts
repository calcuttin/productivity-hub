import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ResearchPaper, Author, Citation } from '@prisma/client'; // Prisma-generated types

// GET /api/research - Fetch all research papers
export async function GET(request: Request) {
  try {
    const papers = await prisma.researchPaper.findMany({
      include: {
        authors: true, // Include related authors
        citations: true, // Include related citations
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return NextResponse.json(papers);
  } catch (error) {
    console.error("Failed to fetch research papers:", error);
    return NextResponse.json({ message: "Failed to fetch research papers", error: (error as Error).message }, { status: 500 });
  }
}

// POST /api/research - Create a new research paper
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      authors, // Expecting an array of Author objects with id, or new author data
      publication,
      year,
      abstract,
      keywords,
      filePath,
      notes,
      citations, // Expecting an array of Citation objects with id, or new citation data
    } = body;

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    // Handle authors: connect to existing or create new ones
    const authorConnectOrCreate = authors ? authors.map((author: any) => ({
      where: { id: author.id || undefined }, // If ID is provided, try to connect
      create: { 
        firstName: author.firstName,
        lastName: author.lastName,
        middleName: author.middleName,
        orcid: author.orcid
       },
    })) : [];

    const newPaper = await prisma.researchPaper.create({
      data: {
        title,
        publication,
        year,
        abstract,
        keywords: keywords || [],
        filePath,
        notes,
        authors: {
          connectOrCreate: authorConnectOrCreate,
        },
        // Citations will be handled similarly, potentially in a separate step or endpoint for complexity
        // For now, we'll create citations if provided, assuming they don't have complex relations themselves yet.
        citations: citations ? {
          create: citations.map((citation: any) => ({
            key: citation.key,
            type: citation.type,
            fields: citation.fields || {},
          })),
        } : undefined,
      },
      include: {
        authors: true,
        citations: true,
      },
    });

    return NextResponse.json(newPaper, { status: 201 });
  } catch (error) {
    console.error("Failed to create research paper:", error);
    // Check for unique constraint violation for ORCID
    // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
    if ((error as any).code === 'P2002' && (error as any).meta?.target?.includes('orcid')) {
        return NextResponse.json({ message: "An author with this ORCID already exists.", error: (error as Error).message }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create research paper", error: (error as Error).message }, { status: 500 });
  }
} 