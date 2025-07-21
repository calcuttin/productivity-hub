import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { scheduleWorkoutReminder } from '@/lib/workout-notifications';

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
    const user = await requireAuth();
    
    const workouts = await prisma.workout.findMany({
      where: {
        userId: user.id,
      },
      include: {
        exercises: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    return NextResponse.json(workouts);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error("Error fetching workouts:", error);
    return NextResponse.json({ message: 'Failed to fetch workouts', error: (error instanceof Error) ? error.message : String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
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
        userId: user.id, // Associate with the authenticated user
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

    // Schedule workout reminder if workout is in the future
    const workoutDate = new Date(date);
    if (workoutDate > new Date() && !completed) {
      try {
        await scheduleWorkoutReminder(
          user.id,
          newWorkout.id,
          newWorkout.name,
          workoutDate
        );
      } catch (reminderError) {
        console.error('Failed to schedule workout reminder:', reminderError);
        // Don't fail the workout creation if reminder scheduling fails
      }
    }

    return NextResponse.json(newWorkout, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error("Error creating workout:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to create workout', error: (error instanceof Error) ? error.message : String(error) }, { status: 500 });
  }
} 