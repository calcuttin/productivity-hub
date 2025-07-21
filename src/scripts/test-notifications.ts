import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testNotifications() {
  console.log('🧪 Testing Email Notification System...\n');

  try {
    // Get the first user
    const user = await prisma.user.findFirst({
      include: {
        preferences: true,
      },
    });

    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    console.log(`👤 Testing with user: ${user.name} (${user.email})`);
    console.log(`📧 Email notifications: ${user.preferences?.emailNotifications ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`🔔 Browser notifications: ${user.preferences?.browserNotifications ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`⏰ Reminder notifications: ${user.preferences?.reminderNotifications ? '✅ Enabled' : '❌ Disabled'}\n`);

    // Test notification sending
    console.log('📤 Sending test notifications...\n');

    // Test project due reminder
    console.log('1. Project Due Reminder:');
    await sendTestNotification(user.id, 'project_due', 'Project Due Soon', 'Your project "Final Assignment" is due tomorrow!', '/projects');

    // Test workout reminder
    console.log('\n2. Workout Reminder:');
    await sendTestNotification(user.id, 'workout_reminder', 'Workout Time!', 'Time for your daily workout routine', '/workout');

    // Test todo reminder
    console.log('\n3. Todo Reminder:');
    await sendTestNotification(user.id, 'todo_reminder', 'Todo Reminder', 'Don\'t forget to complete your tasks', '/todos');

    console.log('\n✅ Notification tests completed!');
    console.log('\n📝 To enable real email sending:');
    console.log('1. Sign up for an email service (Resend, SendGrid, etc.)');
    console.log('2. Add your API key to .env');
    console.log('3. Uncomment the email sending code in src/lib/notifications.ts');

  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function sendTestNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    // Get user preferences
    const userPreferences = await prisma.userPreferences.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!userPreferences || !userPreferences.user) {
      console.log('  ❌ User preferences not found');
      return;
    }

    console.log(`  📧 Email: ${userPreferences.emailNotifications ? 'Would send to ' + userPreferences.user.email : 'Disabled'}`);
    console.log(`  🔔 Browser: ${userPreferences.browserNotifications ? 'Would show notification' : 'Disabled'}`);
    console.log(`  📝 Message: ${message}`);

    // Simulate notification sending
    if (userPreferences.emailNotifications) {
      console.log('  📤 Email notification logged to console');
    }
    
    if (userPreferences.browserNotifications) {
      console.log('  📤 Browser notification logged to console');
    }

  } catch (error) {
    console.log(`  ❌ Error: ${error}`);
  }
}

// Run the test
testNotifications(); 