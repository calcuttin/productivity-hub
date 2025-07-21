import { prisma } from '@/lib/prisma';

interface SampleDataOptions {
  userId: string;
  includeProjects?: boolean;
  includeTodos?: boolean;
  includeWorkouts?: boolean;
  includeResearch?: boolean;
}

export async function createSampleData({
  userId,
  includeProjects = true,
  includeTodos = true,
  includeWorkouts = true,
  includeResearch = true
}: SampleDataOptions) {
  const results: {
    projects: any[];
    todos: any[];
    workouts: any[];
    research: any[];
  } = {
    projects: [],
    todos: [],
    workouts: [],
    research: []
  };

  try {
    // Create sample projects
    if (includeProjects) {
      const sampleProjects = [
        {
          name: 'Learn Next.js',
          description: 'Master the Next.js framework for building modern web applications',
          status: 'In Progress' as const,
          priority: 'High' as const,
          progress: 65,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          course: 'Web Development',
          assignmentType: 'Learning Project',
          estimatedHours: 40,
          tags: ['programming', 'learning', 'web-dev']
        },
        {
          name: 'Portfolio Website',
          description: 'Create a personal portfolio website to showcase my work',
          status: 'Not Started' as const,
          priority: 'Medium' as const,
          progress: 0,
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
          estimatedHours: 25,
          tags: ['portfolio', 'design', 'web-dev']
        },
        {
          name: 'Fitness App Design',
          description: 'Design a mobile app for tracking workouts and nutrition',
          status: 'On Hold' as const,
          priority: 'Low' as const,
          progress: 30,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
          estimatedHours: 60,
          tags: ['design', 'mobile', 'fitness']
        }
      ];

      for (const projectData of sampleProjects) {
        const project = await prisma.project.create({
          data: {
            name: projectData.name,
            description: projectData.description,
            status: projectData.status,
            priority: projectData.priority,
            progress: projectData.progress,
            dueDate: projectData.dueDate,
            course: projectData.course,
            assignmentType: projectData.assignmentType,
            estimatedHours: projectData.estimatedHours,
            tags: projectData.tags,
            userId,
            subtasks: {
              create: [
                {
                  name: 'Research and planning',
                  description: 'Gather requirements and create project plan',
                  status: 'Completed',
                  priority: 'High',
                  progress: 100,
                  order: 0
                },
                {
                  name: 'Design phase',
                  description: 'Create wireframes and mockups',
                  status: 'In Progress',
                  priority: 'Medium',
                  progress: 60,
                  order: 1
                },
                {
                  name: 'Development',
                  description: 'Implement the core functionality',
                  status: 'Not Started',
                  priority: 'High',
                  progress: 0,
                  order: 2
                }
              ]
            }
          }
        });
        results.projects.push(project);
      }
    }

    // Create sample todos
    if (includeTodos) {
      const sampleTodos = [
        {
          title: 'Read Next.js documentation',
          description: 'Go through the official Next.js docs to understand the framework better',
          priority: 'High' as const,
          completed: false,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          tags: ['learning', 'programming']
        },
        {
          title: 'Set up development environment',
          description: 'Install necessary tools and configure the development setup',
          priority: 'High' as const,
          completed: true,
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          tags: ['setup', 'development']
        },
        {
          title: 'Create project wireframes',
          description: 'Design basic wireframes for the portfolio website',
          priority: 'Medium' as const,
          completed: false,
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          tags: ['design', 'planning']
        },
        {
          title: 'Research UI libraries',
          description: 'Look into popular UI component libraries for the project',
          priority: 'Low' as const,
          completed: false,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          tags: ['research', 'ui']
        },
        {
          title: 'Schedule team meeting',
          description: 'Set up a meeting with the team to discuss project progress',
          priority: 'Medium' as const,
          completed: false,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
          tags: ['meeting', 'communication']
        }
      ];

      for (const todoData of sampleTodos) {
        const todo = await prisma.todo.create({
          data: {
            title: todoData.title,
            description: todoData.description,
            priority: todoData.priority,
            completed: todoData.completed,
            dueDate: todoData.dueDate,
            tags: todoData.tags,
            userId
          }
        });
        results.todos.push(todo);
      }
    }

    // Create sample workouts
    if (includeWorkouts) {
      const sampleWorkouts = [
        {
          name: 'Morning Cardio',
          description: '30-minute cardio session to start the day',
          date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
          completed: false,
          workoutType: 'Cardio',
          duration: 30,
          intensity: 'Medium',
          notes: 'Focus on maintaining steady pace'
        },
        {
          name: 'Strength Training',
          description: 'Upper body strength workout',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          completed: false,
          workoutType: 'Strength',
          duration: 45,
          intensity: 'High',
          notes: 'Include bench press, pull-ups, and shoulder press'
        },
        {
          name: 'Yoga Session',
          description: 'Relaxing yoga for flexibility and mindfulness',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          completed: false,
          workoutType: 'Flexibility',
          duration: 60,
          intensity: 'Low',
          notes: 'Focus on breathing and stretching'
        },
        {
          name: 'HIIT Workout',
          description: 'High-intensity interval training',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday (completed)
          completed: true,
          workoutType: 'HIIT',
          duration: 25,
          intensity: 'High',
          notes: 'Great session, felt energized afterwards'
        }
      ];

      for (const workoutData of sampleWorkouts) {
        const workout = await prisma.workout.create({
          data: {
            name: workoutData.name,
            date: workoutData.date,
            completed: workoutData.completed,
            notes: workoutData.notes,
            userId
          }
        });
        results.workouts.push(workout);
      }
    }

    // Create sample research papers
    if (includeResearch) {
      const sampleResearch = [
        {
          title: 'The Future of Web Development',
          authors: 'Smith, J., Johnson, A.',
          publication: 'Tech Trends Journal',
          year: 2024,
          abstract: 'An analysis of emerging trends in web development and their impact on the industry.',
          url: 'https://example.com/paper1',
          tags: ['web-development', 'trends', 'technology'],
          notes: 'Interesting insights on React vs Vue adoption rates'
        },
        {
          title: 'Productivity in Remote Work Environments',
          authors: 'Brown, M., Davis, R.',
          publication: 'Management Science',
          year: 2023,
          abstract: 'Study on productivity patterns and best practices for remote work teams.',
          url: 'https://example.com/paper2',
          tags: ['productivity', 'remote-work', 'management'],
          notes: 'Key findings about communication tools and team collaboration'
        },
        {
          title: 'Machine Learning in Healthcare',
          authors: 'Wilson, K., Taylor, L.',
          publication: 'Healthcare Technology Review',
          year: 2024,
          abstract: 'Applications of machine learning algorithms in medical diagnosis and treatment.',
          url: 'https://example.com/paper3',
          tags: ['machine-learning', 'healthcare', 'ai'],
          notes: 'Promising results in early disease detection'
        }
      ];

      for (const researchData of sampleResearch) {
        const research = await prisma.researchPaper.create({
          data: {
            title: researchData.title,
            publication: researchData.publication,
            year: researchData.year,
            abstract: researchData.abstract,
            keywords: researchData.tags,
            notes: researchData.notes,
            userId
          }
        });
        results.research.push(research);
      }
    }

    return results;
  } catch (error) {
    console.error('Error creating sample data:', error);
    throw new Error('Failed to create sample data');
  }
}

export async function checkUserHasData(userId: string): Promise<boolean> {
  try {
    const [projectCount, todoCount, workoutCount, researchCount] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.todo.count({ where: { userId } }),
      prisma.workout.count({ where: { userId } }),
      prisma.researchPaper.count({ where: { userId } })
    ]);

    return projectCount > 0 || todoCount > 0 || workoutCount > 0 || researchCount > 0;
  } catch (error) {
    console.error('Error checking user data:', error);
    return false;
  }
}

export async function clearSampleData(userId: string) {
  try {
    await Promise.all([
      prisma.project.deleteMany({ where: { userId } }),
      prisma.todo.deleteMany({ where: { userId } }),
      prisma.workout.deleteMany({ where: { userId } }),
      prisma.researchPaper.deleteMany({ where: { userId } })
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error clearing sample data:', error);
    throw new Error('Failed to clear sample data');
  }
} 