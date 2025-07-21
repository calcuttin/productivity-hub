import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import ResearchAlerts from '@/components/ResearchAlerts';

export const metadata: Metadata = {
  title: 'Research Alerts - Productivity Hub',
  description: 'Manage your research deadlines, follow-up reminders, and academic progress tracking.',
};

export default function ResearchAlertsPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Research Alerts
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Stay on top of your academic deadlines with intelligent research tracking and follow-up reminders.
            </p>
          </div>
          
          <ResearchAlerts />
          
          {/* Additional Information */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Smart Research Alert Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  📅 Deadline Detection
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Automatic scanning of paper titles and notes</li>
                  <li>• Natural language deadline parsing</li>
                  <li>• Multiple deadline types (submission, review, conference)</li>
                  <li>• Priority-based urgency levels</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  ⏰ Smart Reminders
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Customizable reminder timing (2 weeks to 1 hour)</li>
                  <li>• Escalating urgency as deadlines approach</li>
                  <li>• Venue and submission details included</li>
                  <li>• Respects your quiet hours preferences</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  📊 Progress Analysis
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Activity tracking with time session integration</li>
                  <li>• Identification of stagnant research projects</li>
                  <li>• Progress momentum analysis</li>
                  <li>• Actionable suggestions for improvement</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🔄 Follow-up System
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Intelligent follow-up reminders for inactive papers</li>
                  <li>• Escalating attention levels based on inactivity</li>
                  <li>• Research milestone celebrations</li>
                  <li>• Collaboration and achievement notifications</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🎯 Deadline Types
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Submission deadlines for papers and abstracts</li>
                  <li>• Conference and journal review dates</li>
                  <li>• Funding application deadlines</li>
                  <li>• Presentation and revision timelines</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🛠️ Parser Tools
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>• Natural language deadline extraction</li>
                  <li>• Multiple date format recognition</li>
                  <li>• Context-aware deadline type detection</li>
                  <li>• Manual deadline scheduling tools</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 Research Alert Best Practices
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <ul className="space-y-1">
                  <li>• Include deadline info in paper notes using natural language</li>
                  <li>• Use specific venues and conference names for better context</li>
                  <li>• Set multiple reminder timings for critical deadlines</li>
                  <li>• Regular progress updates to maintain activity tracking</li>
                </ul>
                <ul className="space-y-1">
                  <li>• Link related time tracking sessions to research papers</li>
                  <li>• Use the deadline parser tool to test text recognition</li>
                  <li>• Review stagnant papers regularly and set action plans</li>
                  <li>• Leverage collaboration features for team research</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">
                📝 Example Deadline Formats
              </h4>
              <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <p><strong>Submission:</strong> "Submission deadline: March 15, 2024" or "Submit by 12/01/2024"</p>
                <p><strong>Conference:</strong> "ICML 2024 deadline June 1st" or "Conference due: Jan 15, 2025"</p>
                <p><strong>Review:</strong> "Peer review deadline: February 28, 2024" or "Review due 02/28/24"</p>
                <p><strong>Funding:</strong> "Grant application deadline: April 30, 2024" or "NSF due May 1"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 