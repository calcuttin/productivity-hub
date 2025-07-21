import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthSessionProvider from '@/components/AuthSessionProvider';
import ThemeClientProvider from '@/components/ThemeClientProvider';
import GlobalKeyboardShortcuts from '@/components/GlobalKeyboardShortcuts';

import QuickAddProvider from '@/components/QuickAddProvider';
import { RecentItemsProvider } from '@/context/RecentItemsContext';
import PerformanceDashboard from '@/components/PerformanceDashboard';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  title: {
    default: 'Notion App - Productivity & Organization',
    template: '%s | Notion App'
  },
  description: 'A comprehensive productivity app for managing projects, todos, research, workouts, and time tracking with smart notifications and analytics.',
  keywords: ['productivity', 'organization', 'project management', 'todo', 'research', 'workout', 'time tracking'],
  authors: [{ name: 'Notion App Team' }],
  creator: 'Notion App',
  publisher: 'Notion App',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Notion App - Productivity & Organization',
    description: 'A comprehensive productivity app for managing projects, todos, research, workouts, and time tracking.',
    siteName: 'Notion App',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notion App - Productivity & Organization',
    description: 'A comprehensive productivity app for managing projects, todos, research, workouts, and time tracking.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/api/auth/session" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/api/preferences" as="fetch" crossOrigin="anonymous" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for potential external APIs */}
        <link rel="dns-prefetch" href="//api.resend.com" />
        <link rel="dns-prefetch" href="//fcm.googleapis.com" />
        
        {/* Service Worker */}
        <link rel="service-worker" href="/sw.js" />
        
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme color */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
        
        {/* Performance hints */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Notion App" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      </head>
      <body className={inter.className}>
        <AuthSessionProvider>
          <ThemeClientProvider>
            <RecentItemsProvider>
              <QuickAddProvider>
                <GlobalKeyboardShortcuts />
                {children}
                <PerformanceDashboard />
              </QuickAddProvider>
            </RecentItemsProvider>
          </ThemeClientProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
