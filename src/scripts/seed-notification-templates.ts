import { prisma } from '../lib/prisma';

const defaultTemplates = [
  {
    name: 'project_due_reminder',
    type: 'due_date',
    title: 'Project Due: {{projectName}}',
    message: 'Your project "{{projectName}}" is due on {{dueDate}}. Don\'t forget to complete it!',
    priority: 'high',
    emailEnabled: true,
    browserEnabled: true,
    pushEnabled: false,
    defaultTiming: '1_day',
    variables: ['projectName', 'dueDate'],
    description: 'Reminder notification for project due dates',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'todo_due_reminder',
    type: 'due_date',
    title: 'Todo Due: {{todoTitle}}',
    message: 'Your todo "{{todoTitle}}" is due on {{dueDate}}. Time to get it done!',
    priority: 'medium',
    emailEnabled: true,
    browserEnabled: true,
    pushEnabled: false,
    defaultTiming: '1_day',
    variables: ['todoTitle', 'dueDate'],
    description: 'Reminder notification for todo due dates',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'workout_reminder',
    type: 'workout',
    title: 'Workout Time: {{workoutName}}',
    message: 'Time for your workout: {{workoutName}}. Let\'s get moving!',
    priority: 'medium',
    emailEnabled: false,
    browserEnabled: true,
    pushEnabled: true,
    defaultTiming: 'immediate',
    variables: ['workoutName'],
    description: 'Reminder notification for scheduled workouts',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'research_deadline',
    type: 'research',
    title: 'Research Deadline: {{paperTitle}}',
    message: 'Your research paper "{{paperTitle}}" has a deadline on {{deadline}}. Review your progress.',
    priority: 'high',
    emailEnabled: true,
    browserEnabled: true,
    pushEnabled: false,
    defaultTiming: '1_week',
    variables: ['paperTitle', 'deadline'],
    description: 'Reminder notification for research deadlines',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'overdue_item',
    type: 'reminder',
    title: 'Overdue: {{itemTitle}}',
    message: 'Your {{itemType}} "{{itemTitle}}" was due on {{dueDate}} and is now overdue. Please complete it as soon as possible.',
    priority: 'urgent',
    emailEnabled: true,
    browserEnabled: true,
    pushEnabled: true,
    defaultTiming: 'immediate',
    variables: ['itemTitle', 'itemType', 'dueDate'],
    description: 'Notification for overdue items',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'achievement_unlock',
    type: 'achievement',
    title: 'Achievement Unlocked: {{achievementName}}',
    message: 'Congratulations! You\'ve unlocked the "{{achievementName}}" achievement. {{description}}',
    priority: 'medium',
    emailEnabled: false,
    browserEnabled: true,
    pushEnabled: false,
    defaultTiming: 'immediate',
    variables: ['achievementName', 'description'],
    description: 'Notification for unlocked achievements',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'streak_milestone',
    type: 'achievement',
    title: 'Streak Milestone: {{streakType}}',
    message: 'Amazing! You\'ve reached a {{days}}-day streak for {{streakType}}. Keep up the great work!',
    priority: 'medium',
    emailEnabled: false,
    browserEnabled: true,
    pushEnabled: false,
    defaultTiming: 'immediate',
    variables: ['streakType', 'days'],
    description: 'Notification for streak milestones',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'daily_digest',
    type: 'system',
    title: 'Daily Digest - {{date}}',
    message: 'Here\'s your daily summary: {{completedTasks}} tasks completed, {{upcomingDeadlines}} upcoming deadlines, {{workoutStatus}}.',
    priority: 'low',
    emailEnabled: true,
    browserEnabled: false,
    pushEnabled: false,
    defaultTiming: 'immediate',
    variables: ['date', 'completedTasks', 'upcomingDeadlines', 'workoutStatus'],
    description: 'Daily digest with summary of activities',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'weekly_summary',
    type: 'system',
    title: 'Weekly Summary - {{weekRange}}',
    message: 'Your weekly productivity summary: {{totalCompleted}} items completed, {{totalTimeSpent}} hours tracked, {{streakStatus}}.',
    priority: 'low',
    emailEnabled: true,
    browserEnabled: false,
    pushEnabled: false,
    defaultTiming: 'immediate',
    variables: ['weekRange', 'totalCompleted', 'totalTimeSpent', 'streakStatus'],
    description: 'Weekly summary with productivity metrics',
    isActive: true,
    isSystem: true,
  },
  {
    name: 'system_update',
    type: 'system',
    title: 'System Update: {{updateTitle}}',
    message: '{{updateMessage}}',
    priority: 'low',
    emailEnabled: false,
    browserEnabled: true,
    pushEnabled: false,
    defaultTiming: 'immediate',
    variables: ['updateTitle', 'updateMessage'],
    description: 'System update notifications',
    isActive: true,
    isSystem: true,
  },
];

async function seedNotificationTemplates() {
  console.log('🌱 Seeding notification templates...');

  try {
    for (const template of defaultTemplates) {
      await prisma.notificationTemplate.upsert({
        where: { name: template.name },
        update: {
          ...template,
          updatedAt: new Date(),
        },
        create: template,
      });
      console.log(`✅ Created/updated template: ${template.name}`);
    }

    console.log('🎉 Notification templates seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding notification templates:', error);
    throw error;
  }
}

// Run the seeding function if this script is called directly
if (require.main === module) {
  seedNotificationTemplates()
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedNotificationTemplates }; 