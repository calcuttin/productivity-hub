"use client";
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { useEffect, useState } from 'react';

// Define interfaces for the data
interface Project {
  id: string;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  dueDate?: string | null;
  progress?: number | null;
}

interface Workout {
  id: string;
  name: string;
  date: string; // ISO string
  completed: boolean;
}

interface ResearchPaper {
  id: string;
  // We only need the ID for counting, but defining a minimal interface
}

export default function Home() {
  const [upcomingProjects, setUpcomingProjects] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<Workout[]>([]);
  const [researchCount, setResearchCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [projectsRes, workoutsRes, researchRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/workouts'),
          fetch('/api/research')
        ]);

        if (!projectsRes.ok) throw new Error(`Failed to fetch projects: ${projectsRes.statusText}`);
        if (!workoutsRes.ok) throw new Error(`Failed to fetch workouts: ${workoutsRes.statusText}`);
        if (!researchRes.ok) throw new Error(`Failed to fetch research papers: ${researchRes.statusText}`);

        const projectsData: Project[] = await projectsRes.json();
        const workoutsData: Workout[] = await workoutsRes.json();
        const researchData: ResearchPaper[] = await researchRes.json();

        const today = new Date();
        today.setHours(0,0,0,0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);


        const upcoming = projectsData.filter(p => {
          if (!p.dueDate || p.status === 'Completed') return false;
          const dueDate = new Date(p.dueDate);
          return dueDate >= today && dueDate <= sevenDaysFromNow;
        }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
        setUpcomingProjects(upcoming);

        const active = projectsData.filter(p => p.status === 'In Progress' || p.status === 'On Hold');
        setActiveProjects(active);
        
        const futureWorkouts = workoutsData.filter(w => {
            if (w.completed) return false;
            const workoutDate = new Date(w.date);
            // Consider workouts for today and tomorrow
            return workoutDate >= today && workoutDate <= tomorrow;
        }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setUpcomingWorkouts(futureWorkouts);

        setResearchCount(researchData.length);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Existing Navigation Cards */}
        <div className="mb-12">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">Quick Access</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Project Tracker Card */}
            <Link href="/projects" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Project Tracker</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Manage your development projects.</p>
              </div>
            </Link>

            {/* Research Papers Card */}
            <Link href="/research" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Research Papers</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Organize your research.</p>
              </div>
            </Link>

            {/* Calendar Card */}
            <Link href="/calendar" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Calendar</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">View your schedule.</p>
              </div>
            </Link>

            {/* Workout Planner Card */}
            <Link href="/workout" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Workout Planner</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Track your fitness goals.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Dashboard Sections */}
        {isLoading && <div className="text-center py-10 text-gray-600 dark:text-gray-300"><p>Loading dashboard...</p></div>}
        {error && <div className="text-center py-10 text-red-500 dark:text-red-400"><p>Error loading dashboard: {error}</p></div>}
        
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Upcoming Deadlines & Active Projects */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Deadlines */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upcoming Deadlines (Next 7 Days)</h2>
                {upcomingProjects.length > 0 ? (
                  <ul className="space-y-3">
                    {upcomingProjects.map(p => (
                      <li key={p.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <Link href="/projects" className="block">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800 dark:text-gray-100">{p.name}</span>
                            <span className="text-sm text-red-500 dark:text-red-400">{new Date(p.dueDate!).toLocaleDateString()}</span>
                          </div>
                          {p.progress !== null && p.progress !== undefined && (
                             <div className="mt-1">
                                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${p.progress}%` }}></div>
                                </div>
                             </div>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No upcoming deadlines in the next 7 days.</p>
                )}
              </div>

              {/* Active Projects */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Projects</h2>
                {activeProjects.length > 0 ? (
                  <ul className="space-y-3">
                    {activeProjects.map(p => (
                      <li key={p.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <Link href="/projects" className="block">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800 dark:text-gray-100">{p.name}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-semibold
                              ${p.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' : ''}
                              ${p.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : ''}
                            `}>{p.status}</span>
                          </div>
                           {p.progress !== null && p.progress !== undefined && (
                             <div className="mt-1">
                                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                                  <div className="h-2 bg-green-500 rounded-full" style={{ width: `${p.progress}%` }}></div>
                                </div>
                             </div>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No active projects.</p>
                )}
              </div>
            </div>
            
            {/* Column 2: Upcoming Workouts & Research Count */}
            <div className="space-y-8">
              {/* Upcoming Workouts */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Today's/Tomorrow's Workouts</h2>
                {upcomingWorkouts.length > 0 ? (
                  <ul className="space-y-3">
                    {upcomingWorkouts.map(w => (
                      <li key={w.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <Link href="/workout" className="block">
                           <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800 dark:text-gray-100">{w.name}</span>
                            <span className="text-sm text-purple-500 dark:text-purple-400">{new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No workouts scheduled for today or tomorrow.</p>
                )}
              </div>

              {/* Research Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Research Snapshot</h2>
                <div className="flex items-center justify-between text-gray-700 dark:text-gray-200">
                    <p>Total Papers:</p>
                    <p className="text-2xl font-bold">{researchCount}</p>
                </div>
                <Link href="/research" className="mt-3 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Go to Research →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
