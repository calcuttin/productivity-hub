import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const exerciseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Exercise name is required"),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().positive(),
});

// Infer the type for a single exercise for use in the map function
type ExerciseData = z.infer<typeof exerciseSchema>;

const workoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().datetime(), // Expect ISO string from client
  notes: z.string().optional(),
  completed: z.boolean().default(false),
  exercises: z.array(exerciseSchema).optional(), // Use the defined exerciseSchema
});

export async function GET() {
  try {
    const workouts = await prisma.workout.findMany({
      include: {
        exercises: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return NextResponse.json({ message: 'Failed to fetch workouts', error: (error instanceof Error) ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedData = workoutSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parsedData.error.errors }, { status: 400 });
    }

    const { name, date, notes, completed, exercises } = parsedData.data;

    const newWorkout = await prisma.workout.create({
      data: {
        name,
        date: new Date(date), // Convert ISO string to Date object
        notes,
        completed,
        exercises: exercises && exercises.length > 0 ? {
          create: exercises.map((ex: ExerciseData) => ({ // Added type for ex
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          })),
        } : undefined,
      },
      include: {
        exercises: true,
      },
    });

    return NextResponse.json(newWorkout, { status: 201 });
  } catch (error) {
    console.error("Error creating workout:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create workout', error: (error instanceof Error) ? error.message : String(error) }, { status: 500 });
  }
} 