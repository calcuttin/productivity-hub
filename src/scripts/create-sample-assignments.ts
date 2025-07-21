import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleAssignments() {
  try {
    console.log('Creating sample assignments...');

    // Sample Assignment 1: Research Paper
    const researchPaper = await prisma.project.create({
      data: {
        name: 'Machine Learning Research Paper',
        description: 'Write a comprehensive research paper on recent advances in machine learning',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        startDate: new Date(),
        progress: 30,
        estimatedHours: 20,
        tags: ['research', 'machine-learning', 'academic'],
        assignmentType: 'Research',
        course: 'Advanced Machine Learning',
        instructor: 'Dr. Smith',
        maxGrade: 100,
        rubric: {
          introduction: 15,
          methodology: 25,
          results: 30,
          conclusion: 15,
          references: 15
        },
        subtasks: {
          create: [
            {
              name: 'Literature Review',
              description: 'Review existing research papers',
              status: 'Completed',
              priority: 'High',
              progress: 100,
              order: 1
            },
            {
              name: 'Data Collection',
              description: 'Gather datasets for analysis',
              status: 'In Progress',
              priority: 'Medium',
              progress: 60,
              order: 2
            },
            {
              name: 'Model Implementation',
              description: 'Implement the ML models',
              status: 'Not Started',
              priority: 'High',
              progress: 0,
              order: 3
            },
            {
              name: 'Write Paper',
              description: 'Write the final paper',
              status: 'Not Started',
              priority: 'Medium',
              progress: 0,
              order: 4
            }
          ]
        }
      }
    });

    // Sample Assignment 2: Programming Project
    const programmingProject = await prisma.project.create({
      data: {
        name: 'Web Application Development',
        description: 'Build a full-stack web application using React and Node.js',
        status: 'Not Started',
        priority: 'Urgent',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        startDate: new Date(),
        progress: 0,
        estimatedHours: 15,
        tags: ['programming', 'web-development', 'react'],
        assignmentType: 'Project',
        course: 'Web Development',
        instructor: 'Prof. Johnson',
        maxGrade: 100,
        rubric: {
          functionality: 40,
          design: 25,
          codeQuality: 20,
          documentation: 15
        },
        subtasks: {
          create: [
            {
              name: 'Project Setup',
              description: 'Initialize project and install dependencies',
              status: 'Not Started',
              priority: 'High',
              progress: 0,
              order: 1
            },
            {
              name: 'Frontend Development',
              description: 'Build React components and UI',
              status: 'Not Started',
              priority: 'High',
              progress: 0,
              order: 2
            },
            {
              name: 'Backend API',
              description: 'Create REST API endpoints',
              status: 'Not Started',
              priority: 'High',
              progress: 0,
              order: 3
            },
            {
              name: 'Testing',
              description: 'Write unit and integration tests',
              status: 'Not Started',
              priority: 'Medium',
              progress: 0,
              order: 4
            }
          ]
        }
      }
    });

    // Sample Assignment 3: Overdue Assignment
    const overdueAssignment = await prisma.project.create({
      data: {
        name: 'Database Design Assignment',
        description: 'Design and implement a database schema for a library management system',
        status: 'Not Started',
        priority: 'High',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Started 10 days ago
        progress: 0,
        estimatedHours: 8,
        tags: ['database', 'design', 'sql'],
        assignmentType: 'Homework',
        course: 'Database Systems',
        instructor: 'Dr. Brown',
        maxGrade: 50,
        rubric: {
          schemaDesign: 30,
          implementation: 40,
          documentation: 30
        }
      }
    });

    // Sample Assignment 4: Completed Assignment
    const completedAssignment = await prisma.project.create({
      data: {
        name: 'Algorithm Analysis Report',
        description: 'Analyze time complexity of sorting algorithms',
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Due 5 days ago
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // Started 15 days ago
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Completed 2 days ago
        progress: 100,
        actualHours: 6,
        estimatedHours: 8,
        tags: ['algorithms', 'analysis', 'computer-science'],
        assignmentType: 'Homework',
        course: 'Data Structures & Algorithms',
        instructor: 'Prof. Davis',
        grade: 95,
        maxGrade: 100,
        rubric: {
          analysis: 50,
          implementation: 30,
          report: 20
        },
        subtasks: {
          create: [
            {
              name: 'Algorithm Research',
              description: 'Research different sorting algorithms',
              status: 'Completed',
              priority: 'Medium',
              progress: 100,
              order: 1
            },
            {
              name: 'Implementation',
              description: 'Implement algorithms in code',
              status: 'Completed',
              priority: 'High',
              progress: 100,
              order: 2
            },
            {
              name: 'Performance Testing',
              description: 'Test and measure performance',
              status: 'Completed',
              priority: 'Medium',
              progress: 100,
              order: 3
            },
            {
              name: 'Write Report',
              description: 'Write the final analysis report',
              status: 'Completed',
              priority: 'High',
              progress: 100,
              order: 4
            }
          ]
        }
      }
    });

    console.log('Sample assignments created successfully!');
    console.log('Created assignments:');
    console.log(`1. ${researchPaper.name} (ID: ${researchPaper.id})`);
    console.log(`2. ${programmingProject.name} (ID: ${programmingProject.id})`);
    console.log(`3. ${overdueAssignment.name} (ID: ${overdueAssignment.id})`);
    console.log(`4. ${completedAssignment.name} (ID: ${completedAssignment.id})`);

  } catch (error) {
    console.error('Error creating sample assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSampleAssignments(); 