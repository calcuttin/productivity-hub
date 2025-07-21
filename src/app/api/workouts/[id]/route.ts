import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { scheduleWorkoutReminder } from '@/lib/workout-notifications';

// Schema for updating exercises (all fields optional, but if exercise is present, it needs a name)
const exerciseUpdateSchema = z.object({
  id: z.string().uuid().optional(), // Existing exercise ID
  name: z.string().min(1, "Exercise name is required"),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().positive(),
});

const workoutUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  date: z.string().datetime().optional(),
  notes: z.string().optional().nullable(),
  completed: z.boolean().optional(),
  exercises: z.array(exerciseUpdateSchema).optional(),
});

interface Params {
  id: string;
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    
    const workout = await prisma.workout.findFirst({
      where: { 
        id,
        userId: user.id, // Only allow access to user's own workouts
      },
      include: { exercises: true },
    });
    if (!workout) {
      return NextResponse.json({ message: 'Workout not found' }, { status: 404 });
    }
    return NextResponse.json(workout);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error("Error fetching workout:", error);
    return NextResponse.json({ message: 'Failed to fetch workout', error: (error instanceof Error) ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsedData = workoutUpdateSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ message: 'Invalid data', errors: parsedData.error.errors }, { status: 400 });
    }

    const { name, date, notes, completed, exercises } = parsedData.data;

    // Check if workout exists and belongs to the user
    const existingWorkout = await prisma.workout.findFirst({
      where: { 
        id,
        userId: user.id, // Only allow updates to user's own workouts
      },
    });

    if (!existingWorkout) {
      return NextResponse.json({ message: 'Workout not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (date !== undefined) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;
    if (completed !== undefined) updateData.completed = completed;

    if (exercises !== undefined) {
      // Delete existing exercises and create new ones
      // This is a common pattern, but for more complex scenarios, you might want to update/delete/create selectively
      await prisma.exercise.deleteMany({ where: { workoutId: params.id } });
      if (exercises.length > 0) {
        updateData.exercises = {
          create: exercises.map(ex => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
          })),
        };
      }
    }

    const updatedWorkout = await prisma.workout.update({
      where: { 
        id: params.id,
        userId: user.id, // Only allow updates to user's own workouts
      },
      data: updateData,
      include: { exercises: true },
    });

    // Reschedule workout reminder if date changed and workout is incomplete
    if (date !== undefined && !updatedWorkout.completed) {
      const workoutDate = new Date(updatedWorkout.date);
      if (workoutDate > new Date()) {
        try {
          await scheduleWorkoutReminder(
            user.id,
            updatedWorkout.id,
            updatedWorkout.name,
            workoutDate
          );
        } catch (reminderError) {
          console.error('Failed to reschedule workout reminder:', reminderError);
          // Don't fail the workout update if reminder scheduling fails
        }
      }
    }

    return NextResponse.json(updatedWorkout);
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error("Error updating workout:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation failed', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Failed to update workout', error: (error instanceof Error) ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const user = await requireAuth();
    
    // Check if workout exists and belongs to the user before attempting to delete
    const existingWorkout = await prisma.workout.findFirst({
      where: { 
        id: params.id,
        userId: user.id, // Only allow deletion of user's own workouts
      },
    });

    if (!existingWorkout) {
      return NextResponse.json({ message: 'Workout not found' }, { status: 404 });
    }

    // Delete associated exercises first due to the relation (or use onDelete: Cascade in schema)
    await prisma.exercise.deleteMany({ where: { workoutId: params.id } });
    
    await prisma.workout.delete({
      where: { 
        id: params.id,
        userId: user.id, // Only allow deletion of user's own workouts
      },
    });

    return NextResponse.json({ message: 'Workout deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    console.error("Error deleting workout:", error);
    // Prisma P2025 is for record not found during delete, which we pre-check
    return NextResponse.json({ message: 'Failed to delete workout', error: (error instanceof Error) ? error.message : String(error) }, { status: 500 });
  }
} 