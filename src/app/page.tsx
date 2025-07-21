"use client";
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import MiniStreakWidget from '@/components/MiniStreakWidget'
import TimeTracker from '@/components/TimeTracker'
import OnboardingWizard from '@/components/OnboardingWizard'
import FeatureTour from '@/components/FeatureTour'
import SampleDataGenerator from '@/components/SampleDataGenerator'
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// Define interfaces for the data
interface Project {
  id: string;
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  dueDate?: string | null;
  progress?: number | null;
  course?: string | null;
  instructor?: string | null;
  assignmentType?: string | null;
  grade?: number | null;
  maxGrade?: number | null;
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

interface Todo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string | null;
  tags: string[];
}

export default function Home() {
  const { data: session } = useSession();
  const [upcomingProjects, setUpcomingProjects] = useState<Project[]>([]);
  const [upcomingSchoolWork, setUpcomingSchoolWork] = useState<Project[]>([]);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [activeSchoolWork, setActiveSchoolWork] = useState<Project[]>([]);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<Workout[]>([]);
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [researchCount, setResearchCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const [showSampleData, setShowSampleData] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const [projectsRes, workoutsRes, researchRes, todosRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/workouts'),
          fetch('/api/research'),
          fetch('/api/todos')
        ]);

        if (!projectsRes.ok) throw new Error(`Failed to fetch projects: ${projectsRes.statusText}`);
        if (!workoutsRes.ok) throw new Error(`Failed to fetch workouts: ${workoutsRes.statusText}`);
        if (!researchRes.ok) throw new Error(`Failed to fetch research papers: ${researchRes.statusText}`);
        if (!todosRes.ok) throw new Error(`Failed to fetch todos: ${todosRes.statusText}`);

        const projectsData: Project[] = await projectsRes.json();
        const workoutsData: Workout[] = await workoutsRes.json();
        const researchData: ResearchPaper[] = await researchRes.json();
        const todosData: Todo[] = await todosRes.json();

        const today = new Date();
        today.setHours(0,0,0,0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(today.getDate() + 7);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Separate projects and school work
        const generalProjects = projectsData.filter(p => !p.course && !p.assignmentType);
        const schoolWork = projectsData.filter(p => p.course || p.assignmentType);

        // Filter upcoming deadlines
        const upcomingGeneral = generalProjects.filter(p => {
          if (!p.dueDate || p.status === 'Completed') return false;
          const dueDate = new Date(p.dueDate);
          return dueDate >= today && dueDate <= sevenDaysFromNow;
        }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
        setUpcomingProjects(upcomingGeneral);

        const upcomingSchool = schoolWork.filter(p => {
          if (!p.dueDate || p.status === 'Completed') return false;
          const dueDate = new Date(p.dueDate);
          return dueDate >= today && dueDate <= sevenDaysFromNow;
        }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
        setUpcomingSchoolWork(upcomingSchool);

        // Filter active items
        const activeGeneral = generalProjects.filter(p => p.status === 'In Progress' || p.status === 'On Hold');
        setActiveProjects(activeGeneral);

        const activeSchool = schoolWork.filter(p => p.status === 'In Progress' || p.status === 'On Hold');
        setActiveSchoolWork(activeSchool);
        
        const futureWorkouts = workoutsData.filter(w => {
            if (w.completed) return false;
            const workoutDate = new Date(w.date);
            // Consider workouts for today and tomorrow
            return workoutDate >= today && workoutDate <= tomorrow;
        }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setUpcomingWorkouts(futureWorkouts);

        // Filter today's todos (not completed)
        const todayTodosData = todosData.filter(todo => {
          if (todo.completed) return false;
          if (!todo.dueDate) return true; // Show todos without due dates
          const dueDate = new Date(todo.dueDate);
          return dueDate.toDateString() === today.toDateString();
        }).sort((a, b) => {
          // Sort by priority first, then by due date
          const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          if (aPriority !== bPriority) return bPriority - aPriority;
          return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
        });
        setTodayTodos(todayTodosData);

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

  // Check if user has any data
  const hasAnyData = upcomingProjects.length > 0 || upcomingSchoolWork.length > 0 || 
                    activeProjects.length > 0 || activeSchoolWork.length > 0 || 
                    upcomingWorkouts.length > 0 || todayTodos.length > 0 || researchCount > 0;

  // Show onboarding for new users without data
  useEffect(() => {
    if (!isLoading && !error && session?.user && !hasAnyData) {
      // Check if user has completed onboarding
      const onboardingCompleted = localStorage.getItem('onboarding-completed');
      if (!onboardingCompleted) {
        setShowOnboarding(true);
      }
    }
  }, [isLoading, error, session, hasAnyData]);

  return (
    <div className="page-container">
      <Navigation />
        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Analytics Dashboard for users with data */}
          {!isLoading && !error && hasAnyData && (
            <div className="mb-6 sm:mb-8">
              <AnalyticsDashboard />
            </div>
          )}

          {/* Streak Widget and Time Tracker for all users */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
              <MiniStreakWidget />
              <TimeTracker />
            </div>
          )}

          {/* Welcome Section for New Users */}
          {!isLoading && !error && !hasAnyData && (
            <div className="mb-6 sm:mb-8 bg-card/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 border border-card shadow-lg">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎉</div>
                <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3 sm:mb-4">
                  Welcome to Productivity Hub, {session?.user?.name || 'User'}!
                </h1>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 max-w-2xl mx-auto">
                  You're all set up! Start organizing your life by creating your first project, todo, or workout. 
                  Your dashboard will show your progress and upcoming deadlines once you add some items.
                </p>
                
                {/* Onboarding Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="w-full btn-primary inline-flex items-center justify-center text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Take Guided Tour
                    </button>
                    <button
                      onClick={() => setShowFeatureTour(true)}
                      className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Feature Tour
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowSampleData(true)}
                      className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Get Sample Data
                    </button>
                    <Link href="/projects" className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm text-sm sm:text-base">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Start from Scratch
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Existing Navigation Cards */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-xl sm:text-2xl font-semibold text-primary mb-4 sm:mb-6">Quick Access</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
              {/* Project Tracker Card */}
              <Link href="/projects" className="block">
                <div className="card p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-primary mb-1 sm:mb-2">Project Tracker</h2>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">Manage your development projects.</p>
                </div>
              </Link>

              {/* Research Papers Card */}
              <Link href="/research" className="block">
                <div className="card p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-primary mb-1 sm:mb-2">Research Papers</h2>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">Organize your research.</p>
                </div>
              </Link>

              {/* Todo Board Card */}
              <Link href="/todos" className="block">
                <div className="card p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-primary mb-1 sm:mb-2">Todo Board</h2>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">Daily tasks and reminders.</p>
                </div>
              </Link>

              {/* Calendar Card */}
              <Link href="/calendar" className="block">
                <div className="card p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-primary mb-1 sm:mb-2">Calendar</h2>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">View your schedule.</p>
                </div>
              </Link>

              {/* Workout Planner Card */}
              <Link href="/workout" className="block">
                <div className="card p-3 sm:p-4 lg:p-6 hover:shadow-lg transition-shadow transform hover:-translate-y-1">
                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-primary mb-1 sm:mb-2">Workout Planner</h2>
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">Track your fitness goals.</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Dashboard Sections */}
          {isLoading && <div className="text-center py-10 text-secondary"><p>Loading dashboard...</p></div>}
          {error && <div className="text-center py-10 text-red-500 dark:text-red-400"><p>Error loading dashboard: {error}</p></div>}
          
          {!isLoading && !error && hasAnyData && (
            <div className="space-y-6 sm:space-y-8">
              {/* Projects and School Work Dashboard */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* General Projects Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="card p-4 sm:p-5 lg:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-primary">📁 General Projects</h2>
                      <Link href="/projects" className="text-xs lg:text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        View All →
                      </Link>
                    </div>
                    
                    {/* Upcoming Project Deadlines */}
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-sm sm:text-base lg:text-lg font-medium text-primary mb-2 sm:mb-3">Upcoming Deadlines</h3>
                      {upcomingProjects.length > 0 ? (
                        <ul className="space-y-2">
                          {upcomingProjects.slice(0, 3).map(p => (
                            <li key={p.id} className="p-2 sm:p-3 bg-card-secondary rounded-md shadow-sm hover:shadow-md transition-shadow">
                              <Link href="/projects" className="block">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-primary text-xs sm:text-sm truncate">{p.name}</span>
                                  <span className="text-xs text-red-500 dark:text-red-400 flex-shrink-0 ml-2">{new Date(p.dueDate!).toLocaleDateString()}</span>
                                </div>
                                {p.progress !== null && p.progress !== undefined && (
                                  <div className="mt-1">
                                    <div className="h-1.5 bg-card-secondary rounded-full">
                                      <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${p.progress}%` }}></div>
                                    </div>
                                  </div>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted text-sm">No upcoming deadlines.</p>
                      )}
                    </div>

                    {/* Active Projects */}
                    <div>
                      <h3 className="text-base lg:text-lg font-medium text-primary mb-3">Active Projects</h3>
                      {activeProjects.length > 0 ? (
                        <ul className="space-y-2">
                          {activeProjects.slice(0, 3).map(p => (
                            <li key={p.id} className="p-3 bg-card-secondary rounded-md shadow-sm hover:shadow-md transition-shadow">
                              <Link href="/projects" className="block">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-primary text-xs lg:text-sm truncate">{p.name}</span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-semibold flex-shrink-0 ml-2
                                    ${p.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' : ''}
                                    ${p.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : ''}
                                  `}>{p.status}</span>
                                </div>
                                {p.progress !== null && p.progress !== undefined && (
                                  <div className="mt-1">
                                    <div className="h-1.5 bg-card-secondary rounded-full">
                                      <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${p.progress}%` }}></div>
                                    </div>
                                  </div>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted text-sm">No active projects.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* School Work Section */}
                <div className="space-y-6">
                  <div className="card p-4 lg:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg lg:text-xl font-semibold text-primary">🎓 School Work</h2>
                      <Link href="/projects" className="text-xs lg:text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        View All →
                      </Link>
                    </div>
                    
                    {/* Upcoming School Deadlines */}
                    <div className="mb-6">
                      <h3 className="text-base lg:text-lg font-medium text-primary mb-3">Upcoming Assignments</h3>
                      {upcomingSchoolWork.length > 0 ? (
                        <ul className="space-y-2">
                          {upcomingSchoolWork.slice(0, 3).map(p => (
                            <li key={p.id} className="p-3 bg-card-secondary rounded-md shadow-sm hover:shadow-md transition-shadow">
                              <Link href="/projects" className="block">
                                <div className="flex justify-between items-center">
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium text-primary text-xs lg:text-sm block truncate">{p.name}</span>
                                    {p.course && (
                                      <span className="text-xs text-secondary block truncate">{p.course}</span>
                                    )}
                                  </div>
                                  <span className="text-xs text-red-500 dark:text-red-400 flex-shrink-0 ml-2">{new Date(p.dueDate!).toLocaleDateString()}</span>
                                </div>
                                {p.progress !== null && p.progress !== undefined && (
                                  <div className="mt-1">
                                    <div className="h-1.5 bg-card-secondary rounded-full">
                                      <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: `${p.progress}%` }}></div>
                                    </div>
                                  </div>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted text-sm">No upcoming assignments.</p>
                      )}
                    </div>

                    {/* Active Assignments */}
                    <div>
                      <h3 className="text-base lg:text-lg font-medium text-primary mb-3">Active Assignments</h3>
                      {activeSchoolWork.length > 0 ? (
                        <ul className="space-y-2">
                          {activeSchoolWork.slice(0, 3).map(p => (
                            <li key={p.id} className="p-3 bg-card-secondary rounded-md shadow-sm hover:shadow-md transition-shadow">
                              <Link href="/projects" className="block">
                                <div className="flex justify-between items-center">
                                  <div className="flex-1 min-w-0">
                                    <span className="font-medium text-primary text-xs lg:text-sm block truncate">{p.name}</span>
                                    {p.course && (
                                      <span className="text-xs text-secondary block truncate">{p.course}</span>
                                    )}
                                  </div>
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-semibold flex-shrink-0 ml-2
                                    ${p.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' : ''}
                                    ${p.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : ''}
                                  `}>{p.status}</span>
                                </div>
                                {p.progress !== null && p.progress !== undefined && (
                                  <div className="mt-1">
                                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                                      <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: `${p.progress}%` }}></div>
                                    </div>
                                  </div>
                                )}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted text-sm">No active assignments.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Dashboard Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Column 1: Today's Todos */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-primary">📝 Today's Todos</h2>
                    <Link href="/todos" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View All →
                    </Link>
                  </div>
                  {todayTodos.length > 0 ? (
                    <ul className="space-y-2">
                      {todayTodos.slice(0, 5).map(todo => (
                        <li key={todo.id} className="p-3 bg-card-secondary rounded-md shadow-sm hover:shadow-md transition-shadow">
                          <Link href="/todos" className="block">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <span className="font-medium text-primary text-sm block">{todo.title}</span>
                                {todo.description && (
                                  <span className="text-xs text-secondary block mt-1">{todo.description}</span>
                                )}
                              </div>
                              <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ml-2
                                ${todo.priority === 'Urgent' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' : ''}
                                ${todo.priority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100' : ''}
                                ${todo.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : ''}
                                ${todo.priority === 'Low' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : ''}
                              `}>{todo.priority}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted text-sm">No todos for today.</p>
                  )}
                </div>

                {/* Column 2: Upcoming Workouts */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-primary">💪 Workouts</h2>
                    <Link href="/workout" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View All →
                    </Link>
                  </div>
                  <h3 className="text-lg font-medium text-primary mb-3">Today & Tomorrow</h3>
                  {upcomingWorkouts.length > 0 ? (
                    <ul className="space-y-2">
                      {upcomingWorkouts.map(w => (
                        <li key={w.id} className="p-3 bg-card-secondary rounded-md shadow-sm hover:shadow-md transition-shadow">
                          <Link href="/workout" className="block">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-primary text-sm">{w.name}</span>
                              <span className="text-xs text-purple-500 dark:text-purple-400">{new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted text-sm">No workouts scheduled for today or tomorrow.</p>
                  )}
                </div>

                {/* Column 3: Research Summary */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-primary">📚 Research</h2>
                    <Link href="/research" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View All →
                    </Link>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{researchCount}</div>
                    <p className="text-secondary text-sm">Total Papers</p>
                  </div>
                </div>

                {/* Column 4: Quick Stats */}
                <div className="card p-6">
                  <h2 className="text-xl font-semibold text-primary mb-4">📊 Quick Stats</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-secondary text-sm">Upcoming Deadlines:</span>
                      <span className="font-semibold text-primary">{upcomingProjects.length + upcomingSchoolWork.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary text-sm">Active Items:</span>
                      <span className="font-semibold text-primary">{activeProjects.length + activeSchoolWork.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary text-sm">Today's Todos:</span>
                      <span className="font-semibold text-primary">{todayTodos.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-secondary text-sm">Today's Workouts:</span>
                      <span className="font-semibold text-primary">{upcomingWorkouts.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

      {/* Onboarding Components */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('onboarding-completed', 'true');
          // Refresh data after onboarding
          window.location.reload();
        }}
      />

      <FeatureTour
        isOpen={showFeatureTour}
        onClose={() => setShowFeatureTour(false)}
        onComplete={() => {
          setShowFeatureTour(false);
          localStorage.setItem('feature-tour-completed', 'true');
        }}
      />

      {/* Sample Data Modal */}
      {showSampleData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <SampleDataGenerator
                onDataCreated={() => {
                  setShowSampleData(false);
                  // Refresh data after sample data creation
                  window.location.reload();
                }}
              />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <button
                onClick={() => setShowSampleData(false)}
                className="w-full px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
    </div>
  )
}
