'use client';
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';

export default function ThemeClientProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system' | null>(null);

  useEffect(() => {
    async function fetchTheme() {
      try {
        const res = await fetch('/api/preferences');
        if (res.ok) {
          const data = await res.json();
          setTheme(data.theme || 'system');
        } else {
          setTheme('system');
        }
      } catch {
        setTheme('system');
      }
    }
    fetchTheme();
  }, []);

  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>;
} 