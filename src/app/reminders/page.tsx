'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Navigation from '@/components/Navigation';
import DueDateReminders from '@/components/DueDateReminders';

export default function RemindersPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Due Date Reminders
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and monitor upcoming due dates for your projects and todos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <DueDateReminders />
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                How Due Date Reminders Work
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    <strong>Automatic Scheduling:</strong> When you create or update a project or todo with a due date, 
                    a reminder is automatically scheduled based on your notification settings.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    <strong>Smart Timing:</strong> Reminders are sent at optimal times based on priority level and your preferences. 
                    High priority items get more frequent reminders as due dates approach.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    <strong>No Duplicates:</strong> Our system prevents duplicate reminders and updates existing ones 
                    when you modify due dates or priorities.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    <strong>Customizable:</strong> Set your preferred reminder windows and quiet hours in your notification settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Reminder Timeline Examples
              </h2>
              <div className="space-y-6">
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-red-600 dark:text-red-400">High Priority Items</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    7 days before → 3 days before → 1 day before → Due date
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-yellow-600 dark:text-yellow-400">Medium Priority Items</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    3 days before → 1 day before → Due date
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-semibold text-green-600 dark:text-green-400">Low Priority Items</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    1 day before → Due date
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
                💡 Pro Tips
              </h2>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                <li>• Use descriptive titles for your projects and todos to make reminders more helpful</li>
                <li>• Set realistic due dates to avoid reminder fatigue</li>
                <li>• Update your notification preferences in Settings to customize reminder frequency</li>
                <li>• Mark items as completed to stop receiving reminders</li>
                <li>• Use priority levels strategically - not everything needs to be high priority</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 