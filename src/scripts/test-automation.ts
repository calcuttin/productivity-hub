import { PrismaClient } from '@prisma/client';
import { AssignmentAutomation } from '../lib/automation';

const prisma = new PrismaClient();

async function testAutomation() {
  try {
    console.log('🧪 Testing Assignment Automation Features...\n');

    // Test 1: Run automation checks on all projects
    console.log('1️⃣ Running automation checks on all projects...');
    const automationResults = await AssignmentAutomation.runAutomationChecks();
    
    console.log(`   Found ${automationResults.length} projects to process:`);
    automationResults.forEach(result => {
      console.log(`   - Project ${result.projectId}: ${result.status} (${result.progress}% progress)`);
      if (result.isOverdue) {
        console.log(`     ⚠️  OVERDUE! Due ${Math.abs(result.daysUntilDue || 0)} days ago`);
      } else if (result.daysUntilDue !== null) {
        console.log(`     📅 Due in ${result.daysUntilDue} days`);
      }
    });

    // Test 2: Get projects needing attention
    console.log('\n2️⃣ Getting projects that need attention...');
    const attentionProjects = await AssignmentAutomation.getProjectsNeedingAttention();
    console.log(`   Found ${attentionProjects.length} projects needing attention:`);
    attentionProjects.forEach(project => {
      const dueDate = project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date';
      console.log(`   - ${project.name}: ${project.status} (Due: ${dueDate}, Priority: ${project.priority})`);
    });

    // Test 3: Get dashboard statistics
    console.log('\n3️⃣ Getting dashboard statistics...');
    const stats = await AssignmentAutomation.getDashboardStats();
    console.log('   📊 Dashboard Stats:');
    console.log(`   - Total assignments: ${stats.total}`);
    console.log(`   - Completed: ${stats.completed}`);
    console.log(`   - In Progress: ${stats.inProgress}`);
    console.log(`   - Overdue: ${stats.overdue}`);
    console.log(`   - Due Today: ${stats.dueToday}`);
    console.log(`   - Due This Week: ${stats.dueThisWeek}`);
    console.log(`   - Urgent Priority: ${stats.urgent}`);
    console.log(`   - High Priority: ${stats.highPriority}`);

    // Test 4: Get priority recommendations
    console.log('\n4️⃣ Getting priority recommendations...');
    const recommendations = await AssignmentAutomation.getPriorityRecommendations();
    console.log(`   Top ${recommendations.length} priority recommendations:`);
    recommendations.forEach((project, index) => {
      const dueDate = project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date';
      console.log(`   ${index + 1}. ${project.name}: ${project.priority} priority (Due: ${dueDate})`);
    });

    // Test 5: Get projects by course
    console.log('\n5️⃣ Getting projects grouped by course...');
    const projectsByCourse = await AssignmentAutomation.getProjectsByCourse();
    Object.entries(projectsByCourse).forEach(([course, projects]) => {
      console.log(`   📚 ${course}: ${(projects as any[]).length} assignments`);
      (projects as any[]).forEach((project: any) => {
        console.log(`     - ${project.name}: ${project.status} (${project.progress}% complete)`);
      });
    });

    // Test 6: Get upcoming deadlines
    console.log('\n6️⃣ Getting upcoming deadlines (next 7 days)...');
    const upcomingDeadlines = await AssignmentAutomation.getUpcomingDeadlines();
    console.log(`   Found ${upcomingDeadlines.length} upcoming deadlines:`);
    upcomingDeadlines.forEach(project => {
      const dueDate = project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date';
      console.log(`   - ${project.name}: Due ${dueDate} (${project.priority} priority)`);
    });

    // Test 7: Check specific project details
    console.log('\n7️⃣ Checking specific project details...');
    const projects = await prisma.project.findMany({
      include: {
        subtasks: true,
      },
    });

    projects.forEach(project => {
      console.log(`\n   📋 ${project.name}:`);
      console.log(`   - Status: ${project.status}`);
      console.log(`   - Progress: ${project.progress}%`);
      console.log(`   - Priority: ${project.priority}`);
      console.log(`   - Assignment Type: ${project.assignmentType || 'N/A'}`);
      console.log(`   - Course: ${project.course || 'N/A'}`);
      console.log(`   - Instructor: ${project.instructor || 'N/A'}`);
      if (project.grade !== null && project.maxGrade !== null) {
        console.log(`   - Grade: ${project.grade}/${project.maxGrade} (${((project.grade / project.maxGrade) * 100).toFixed(1)}%)`);
      }
      if (project.subtasks.length > 0) {
        console.log(`   - Subtasks: ${project.subtasks.length} total`);
        project.subtasks.forEach(subtask => {
          console.log(`     • ${subtask.name}: ${subtask.status} (${subtask.progress}%)`);
        });
      }
    });

    console.log('\n✅ Automation testing completed successfully!');

  } catch (error) {
    console.error('❌ Error testing automation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAutomation(); 