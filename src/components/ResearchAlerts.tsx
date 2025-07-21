'use client';

import { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, BookOpen, Clock, TrendingDown, Play, CheckCircle, AlertCircle } from 'lucide-react';

interface ResearchAlertStats {
  totalPapers: number;
  recentlyActive: number;
  stagnant: number;
  needsAttention: number;
  upcomingDeadlines: number;
  urgentDeadlines: number;
}

interface ResearchDeadline {
  id: string;
  type: string;
  title: string;
  deadline: string;
  priority: string;
  venue?: string;
  paperId: string;
  paperTitle: string;
}

interface NeedsAttentionItem {
  paper: {
    id: string;
    title: string;
    publication?: string;
    updatedAt: string;
  };
  daysSinceActivity: number;
  reason: string;
}

interface ResearchAlertData {
  stats: ResearchAlertStats;
  upcomingDeadlines: ResearchDeadline[];
  needsAttention: NeedsAttentionItem[];
  suggestions: string[];
  deadlineTypes: string[];
  reminderTimings: string[];
}

export default function ResearchAlerts() {
  const [data, setData] = useState<ResearchAlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deadlineText, setDeadlineText] = useState('');
  const [parsingDeadline, setParsingDeadline] = useState(false);
  const [parsedResult, setParsedResult] = useState<any>(null);

  useEffect(() => {
    fetchAlertData();
  }, []);

  async function fetchAlertData() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/research-alerts', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch research alert data');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function processAlerts() {
    try {
      setProcessing(true);
      setError(null);
      const response = await fetch('/api/research-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'process_user' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process alerts');
      }
      
      // Refresh data after processing
      await fetchAlertData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setProcessing(false);
    }
  }

  async function parseDeadline() {
    if (!deadlineText.trim()) return;

    try {
      setParsingDeadline(true);
      const response = await fetch('/api/research-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          action: 'parse_deadline',
          text: deadlineText 
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to parse deadline');
      }
      
      const result = await response.json();
      setParsedResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setParsingDeadline(false);
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  }

  function getUrgencyLevel(deadline: string) {
    const hoursUntil = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntil <= 24) return 'urgent';
    if (hoursUntil <= 72) return 'high';
    if (hoursUntil <= 168) return 'medium';
    return 'low';
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>Error: {error}</span>
        </div>
        <button
          onClick={fetchAlertData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Research Alerts
          </h2>
          <button
            onClick={processAlerts}
            disabled={processing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            <Play className="w-4 h-4" />
            <span>{processing ? 'Processing...' : 'Process Now'}</span>
          </button>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Intelligent deadline tracking, follow-up reminders, and progress analysis for your research papers.
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Papers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.stats.totalPapers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Research Papers
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {data.stats.recentlyActive} recently active
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.stats.upcomingDeadlines}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Upcoming Deadlines
              </div>
            </div>
          </div>
          {data.stats.urgentDeadlines > 0 && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
              {data.stats.urgentDeadlines} urgent (≤3 days)
            </div>
          )}
        </div>

        {/* Needs Attention */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className={`w-8 h-8 ${data.stats.needsAttention > 0 ? 'text-orange-600' : 'text-gray-400'}`} />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.stats.needsAttention}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Need Attention
              </div>
            </div>
          </div>
          {data.stats.needsAttention > 0 && (
            <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
              Inactive research papers
            </div>
          )}
        </div>

        {/* Stagnant Papers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-3">
            <TrendingDown className={`w-8 h-8 ${data.stats.stagnant > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.stats.stagnant}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Stagnant Papers
              </div>
            </div>
          </div>
          {data.stats.stagnant > 0 && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              Long-term inactivity
            </div>
          )}
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Deadlines
          </h3>
          {data.upcomingDeadlines.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No upcoming deadlines detected</p>
              <p className="text-sm mt-1">Add deadline information to your research paper notes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.upcomingDeadlines.slice(0, 5).map((deadline) => (
                <div key={deadline.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {deadline.type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {deadline.paperTitle}
                      </div>
                      {deadline.venue && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {deadline.venue}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className={`text-sm font-medium ${getPriorityColor(getUrgencyLevel(deadline.deadline))}`}>
                        {new Date(deadline.deadline).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(deadline.deadline).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Papers Needing Attention */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Papers Needing Attention
          </h3>
          {data.needsAttention.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>All papers are up to date!</p>
              <p className="text-sm mt-1">Keep up the great research momentum</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.needsAttention.map((item, index) => (
                <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {item.paper.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {item.reason}
                      </div>
                      {item.paper.publication && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.paper.publication}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        {item.daysSinceActivity} days
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        since activity
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deadline Parser Tool */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Deadline Parser Tool
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter text containing deadline information:
            </label>
            <textarea
              value={deadlineText}
              onChange={(e) => setDeadlineText(e.target.value)}
              placeholder="e.g., 'Submission deadline: March 15, 2024' or 'Conference review due 12/01/2024'"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>
          
          <button
            onClick={parseDeadline}
            disabled={parsingDeadline || !deadlineText.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {parsingDeadline ? 'Parsing...' : 'Parse Deadline'}
          </button>
          
          {parsedResult && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Parse Result:</h4>
              {parsedResult.found ? (
                <div className="space-y-2">
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ✅ Found deadline: {new Date(parsedResult.parsedDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Original text: "{parsedResult.originalText}"
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-600 dark:text-red-400">
                  ❌ No deadline found in the provided text
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {data.suggestions.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Suggestions
          </h3>
          <div className="space-y-2">
            {data.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm text-blue-800 dark:text-blue-200">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How Research Alerts Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">📅 Deadline Detection</h4>
              <p>Automatically scans your research paper titles and notes for deadline-related keywords and dates.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">⏰ Smart Reminders</h4>
              <p>Sends timely notifications based on deadline proximity and importance.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">📊 Progress Analysis</h4>
              <p>Tracks your research activity and identifies papers that need attention.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">🔄 Follow-up System</h4>
              <p>Suggests when to revisit stagnant research projects and maintains momentum.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            <strong>Tip:</strong> Include deadline information in your research paper notes using natural language like 
            "submission due March 15, 2024" or "conference deadline: 12/01/2024" for automatic detection.
          </p>
        </div>
      </div>
    </div>
  );
} 