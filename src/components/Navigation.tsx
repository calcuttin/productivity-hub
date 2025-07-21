'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useRecentItems } from '@/context/RecentItemsContext';
import GlobalSearchBar from './GlobalSearchBar';
import NotificationCenter from './NotificationCenter';
import { useQuickAdd } from './QuickAddProvider';
import { useKeyboardShortcuts } from './KeyboardShortcutsHelp';
import GlobalKeyboardShortcuts from './GlobalKeyboardShortcuts';
import { Plus, HelpCircle, Clock, ChevronDown, BarChart3, Calendar, Target, Bell, Settings } from 'lucide-react';

export default function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [analyticsPosition, setAnalyticsPosition] = useState({ top: 80, left: 200 });
  const [notificationsPosition, setNotificationsPosition] = useState({ top: 80, right: 200 });
  const { theme, setTheme } = useTheme();
  const { openModal } = useQuickAdd();
  const { openHelp, HelpComponent } = useKeyboardShortcuts();
  const { toggleSidebar, items: recentItems } = useRecentItems();
  const router = useRouter();
  
  const analyticsRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (analyticsRef.current && !analyticsRef.current.contains(target)) {
        setIsAnalyticsOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAnalyticsOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const toggleAnalytics = () => {
    if (!isAnalyticsOpen && analyticsRef.current) {
      const rect = analyticsRef.current.getBoundingClientRect();
      setAnalyticsPosition({
        top: rect.bottom + 5,
        left: rect.left
      });
    }
    setIsAnalyticsOpen(!isAnalyticsOpen);
    setIsNotificationsOpen(false); // Close other dropdown
  };

  const toggleNotifications = () => {
    if (!isNotificationsOpen && notificationsRef.current) {
      const rect = notificationsRef.current.getBoundingClientRect();
      setNotificationsPosition({
        top: rect.bottom + 5,
        right: window.innerWidth - rect.right
      });
    }
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsAnalyticsOpen(false); // Close other dropdown
  };

  return (
    <>
      <HelpComponent />
      <GlobalKeyboardShortcuts onToggleHelp={openHelp} />
      <nav className="bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="text-xl font-bold text-primary">
                Personal Hub
              </Link>
              
              {/* Desktop Navigation - Core Items */}
              <div className="hidden lg:ml-6 lg:flex lg:space-x-4">
                <Link href="/projects" className="text-primary hover:text-secondary px-3 py-2 rounded-md text-sm font-medium">
                  Projects
                </Link>
                <Link href="/assignments" className="text-primary hover:text-secondary px-3 py-2 rounded-md text-sm font-medium">
                  Assignments
                </Link>
                <Link href="/research" className="text-primary hover:text-secondary px-3 py-2 rounded-md text-sm font-medium">
                  Research
                </Link>
                <Link href="/workout" className="text-primary hover:text-secondary px-3 py-2 rounded-md text-sm font-medium">
                  Workout
                </Link>
                <Link href="/todos" className="text-primary hover:text-secondary px-3 py-2 rounded-md text-sm font-medium">
                  Todos
                </Link>
                <Link href="/calendar" className="text-primary hover:text-secondary px-3 py-2 rounded-md text-sm font-medium">
                  Calendar
                </Link>
              </div>

              {/* Desktop Navigation - Dropdown Menus */}
              <div className="hidden lg:ml-4 lg:flex lg:space-x-2">
                {/* Analytics Dropdown */}
                <div className="relative" ref={analyticsRef}>
                  <button
                    onClick={toggleAnalytics}
                    className="text-primary hover:text-secondary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                    <ChevronDown className={`h-3 w-3 transition-transform ${isAnalyticsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isAnalyticsOpen && (
                    <div 
                      className="fixed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 z-[99999]"
                      style={{
                        top: `${analyticsPosition.top}px`,
                        left: `${analyticsPosition.left}px`,
                        minWidth: '200px'
                      }}
                    >
                      <Link 
                        href="/productivity-summary" 
                        className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => {
                          setIsAnalyticsOpen(false);
                        }}
                      >
                        Summary
                      </Link>
                      <Link 
                        href="/analytics" 
                        className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => {
                          setIsAnalyticsOpen(false);
                        }}
                      >
                        Advanced Analytics
                      </Link>
                      <Link 
                        href="/streaks" 
                        className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => {
                          setIsAnalyticsOpen(false);
                        }}
                      >
                        Streaks
                      </Link>
                      <Link 
                        href="/time-tracking" 
                        className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => {
                          setIsAnalyticsOpen(false);
                        }}
                      >
                        Time Tracking
                      </Link>
                      <Link 
                        href="/time-tracking-dashboard" 
                        className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => {
                          setIsAnalyticsOpen(false);
                        }}
                      >
                        Analytics Dashboard
                      </Link>
                    </div>
                  )}
                </div>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={toggleNotifications}
                    className="text-primary hover:text-secondary px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors"
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                    <ChevronDown className={`h-3 w-3 transition-transform ${isNotificationsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isNotificationsOpen && (
                    <div 
                      className="fixed bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 p-2 rounded-md shadow-xl border border-gray-200 dark:border-gray-700 z-[99999]"
                      style={{
                        top: `${notificationsPosition.top}px`,
                        right: `${notificationsPosition.right}px`,
                        minWidth: '200px'
                      }}
                    >
                      <Link 
                        href="/reminders" 
                        className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                        }}
                      >
                        Reminders
                      </Link>
                      <Link 
                        href="/workout-notifications" 
                        className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                        }}
                      >
                        Workout Alerts
                      </Link>
                      <Link 
                        href="/research-alerts" 
                        className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                        }}
                      >
                        Research Alerts
                      </Link>
                      <Link 
                        href="/push-notifications" 
                        className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                        }}
                      >
                        Push Notifications
                      </Link>
                    </div>
                  )}
                </div>

                {/* Search */}
                <Link href="/search" className="text-primary hover:text-secondary px-3 py-2 rounded-md text-sm font-medium">
                  Search
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:ml-6 lg:flex lg:items-center">
              {/* Global Search */}
              <div className="w-64 xl:w-80">
                <GlobalSearchBar className="w-full" />
              </div>
            </div>
            
            <div className="hidden lg:ml-4 lg:flex lg:items-center space-x-2">
              {/* Recent Items Button */}
              {session && (
                <button
                  onClick={toggleSidebar}
                  className="relative p-2 rounded-md text-muted hover:text-secondary hover:bg-card-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                  title="Recent items"
                >
                  <Clock className="h-5 w-5" />
                  {recentItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {recentItems.length > 9 ? '9+' : recentItems.length}
                    </span>
                  )}
                </button>
              )}

              {/* Notification Center */}
              {session && (
                <NotificationCenter />
              )}

              {/* Quick Add Button */}
              {session && (
                <button
                  onClick={openModal}
                  className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                  title="Quick Add (Ctrl+K)"
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-muted hover:text-secondary hover:bg-card-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              
              {/* Help Button */}
              <button
                onClick={openHelp}
                className="p-2 rounded-md text-muted hover:text-secondary hover:bg-card-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                title="Keyboard shortcuts (?)"
              >
                <HelpCircle className="h-5 w-5" />
              </button>
              
              {session ? (
                <>
                  <span className="text-primary text-sm hidden xl:inline">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Link href="/profile" className="text-primary hover:text-secondary px-2 py-2 rounded-md text-sm font-medium">
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-primary hover:text-secondary px-2 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" className="text-primary hover:text-secondary px-2 py-2 rounded-md text-sm font-medium">
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:text-secondary hover:bg-card-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {/* Core Navigation */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Main
              </div>
              <Link href="/projects" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Projects
              </Link>
              <Link href="/assignments" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Assignments
              </Link>
              <Link href="/research" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Research
              </Link>
              <Link href="/workout" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Workout
              </Link>
              <Link href="/todos" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Todos
              </Link>
              <Link href="/calendar" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Calendar
              </Link>

              {/* Analytics Section */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Analytics
              </div>
              <Link href="/productivity-summary" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Summary
              </Link>
              <Link href="/streaks" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Streaks
              </Link>
              <Link href="/time-tracking" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Time Tracking
              </Link>
              <Link href="/time-tracking-dashboard" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Analytics Dashboard
              </Link>

              {/* Notifications Section */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Notifications
              </div>
              <Link href="/reminders" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Reminders
              </Link>
              <Link href="/workout-notifications" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Workout Alerts
              </Link>
              <Link href="/research-alerts" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Research Alerts
              </Link>
              <Link href="/push-notifications" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Push Notifications
              </Link>

              {/* Other */}
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Other
              </div>
              <Link href="/search" className="text-primary hover:text-secondary block px-3 py-2 rounded-md text-base font-medium">
                Search
              </Link>
              
              {/* Recent Items Button - Mobile */}
              {session && (
                <button
                  onClick={() => {
                    toggleSidebar();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary hover:text-secondary transition-colors flex items-center space-x-2"
                >
                  <Clock className="h-5 w-5" />
                  <span>Recent Items</span>
                  {recentItems.length > 0 && (
                    <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {recentItems.length}
                    </span>
                  )}
                </button>
              )}
              
              {/* Quick Add Button - Mobile */}
              {session && (
                <button
                  onClick={() => {
                    openModal();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Quick Add (Ctrl+K)</span>
                </button>
              )}
              
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <GlobalSearchBar className="w-full" />
              </div>
            </div>
            
            {/* Mobile auth section */}
            <div className="pt-4 pb-3 border-t border-card">
              {session ? (
                <>
                  <div className="px-4">
                    <div className="text-base font-medium text-primary">
                      {session.user?.name || session.user?.email}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link href="/profile" className="block px-4 py-2 text-base font-medium text-primary hover:text-secondary">
                      Profile
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-primary hover:text-secondary"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <Link href="/login" className="block px-4 py-2 text-base font-medium text-primary hover:text-secondary">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
} 