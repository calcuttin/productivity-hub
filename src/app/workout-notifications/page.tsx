import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import WorkoutNotifications from '@/components/WorkoutNotifications';

export const metadata: Metadata = {
  title: 'Workout Notifications - Productivity Hub',
  description: 'Manage your workout reminders, rest day suggestions, and streak tracking.',
};

export default function WorkoutNotificationsPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Workout Notifications
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Stay motivated with intelligent workout reminders, rest day suggestions, and streak tracking.
            </p>
          </div>
          
          <WorkoutNotifications />
          
          {/* Additional Information */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Smart Workout Notification Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🏋️ Workout Reminders
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Automatic reminders before scheduled workouts</li>
                  <li>• Customizable timing (15 minutes to 1 day ahead)</li>
                  <li>• Respects your quiet hours settings</li>
                  <li>• Links directly to your workout details</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  😌 Rest Day Suggestions
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Intelligent analysis of your workout pattern</li>
                  <li>• Suggests rest after 3+ consecutive days</li>
                  <li>• Includes recovery tips and activities</li>
                  <li>• Helps prevent overtraining and burnout</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🔥 Streak Tracking
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Automatic streak calculation</li>
                  <li>• Milestone celebrations (3, 7, 14, 21, 30+ days)</li>
                  <li>• Motivational messages based on progress</li>
                  <li>• Achievement notifications for milestones</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  💪 Motivation Reminders
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Gentle nudges during inactive periods</li>
                  <li>• Encouraging messages to restart routines</li>
                  <li>• Progressive urgency based on time away</li>
                  <li>• Positive reinforcement for consistency</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  ⚙️ Smart Scheduling
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Automatic reminder scheduling on workout creation</li>
                  <li>• Updates when workout times change</li>
                  <li>• Prevents duplicate notifications</li>
                  <li>• Integrates with your notification preferences</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  📊 Analytics Integration
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Uses your actual workout completion data</li>
                  <li>• Learns from your patterns and preferences</li>
                  <li>• Provides insights on your consistency</li>
                  <li>• Tracks progress over time</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 Pro Tips for Better Workout Notifications
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Set consistent workout times to get the most accurate reminders</li>
                <li>• Mark workouts as complete to help the system track your streaks</li>
                <li>• Adjust your notification settings in preferences for optimal timing</li>
                <li>• Use the manual "Process Now" button to trigger immediate analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 