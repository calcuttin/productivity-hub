'use client';
import Link from 'next/link'
import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Productivity Hub
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 items-center">
              <Link href="/projects" className="text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Projects
              </Link>
              <Link href="/research" className="text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Research
              </Link>
              <Link href="/calendar" className="text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Calendar
              </Link>
              <Link href="/workout" className="text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
                Workout
              </Link>
            </div>
          </div>
          
          {/* Auth Links and User Info - Desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!isLoading && session?.user ? (
              <div className="flex items-center space-x-4">
                {session.user.image && (
                  <img src={session.user.image} alt={session.user.name || 'User avatar'} className="h-8 w-8 rounded-full" />
                )}
                <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">{session.user.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : !isLoading ? (
              <Link
                href="/login"
                className="text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div> // Loading Skeleton
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/projects" onClick={()=>setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300">
              Projects
            </Link>
            <Link href="/research" onClick={()=>setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300">
              Research
            </Link>
            <Link href="/calendar" onClick={()=>setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300">
              Calendar
            </Link>
            <Link href="/workout" onClick={()=>setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300">
              Workout
            </Link>
            {/* Auth Links - Mobile */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            {!isLoading && session?.user ? (
                <div className="px-3 space-y-2">
                    {session.user.image && (
                        <img src={session.user.image} alt={session.user.name || 'User avatar'} className="h-10 w-10 rounded-full mx-auto mb-2" />
                    )}
                    <p className="text-center text-base font-medium text-gray-800 dark:text-gray-100">{session.user.name}</p>
                    <button
                        onClick={() => {signOut({ callbackUrl: '/' }); setIsMenuOpen(false);}}
                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Sign Out
                    </button>
                </div>
            ) : !isLoading ? (
                <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Sign In
                </Link>
            ) : (
              <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-3"></div> // Loading Skeleton
            )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
} 