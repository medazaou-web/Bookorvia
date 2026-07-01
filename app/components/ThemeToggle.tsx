'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    console.log('=== Theme Change Started ===');
    console.log('New theme requested:', newTheme);
    console.log('Current theme:', theme);
    
    // Set the theme
    setTheme(newTheme);
    
    // Check immediately and after a delay
    console.log('HTML classes immediately:', document.documentElement.className);
    console.log('Has dark class:', document.documentElement.classList.contains('dark'));
    
    setTimeout(() => {
      console.log('=== After 100ms ===');
      console.log('HTML classes:', document.documentElement.className);
      console.log('Has dark class:', document.documentElement.classList.contains('dark'));
      console.log('Computed body bg:', window.getComputedStyle(document.body).backgroundColor);
      console.log('localStorage:', localStorage.getItem('bookorvia-theme'));
    }, 100);
    
    setTimeout(() => {
      console.log('=== After 500ms ===');
      console.log('HTML classes:', document.documentElement.className);
      console.log('Has dark class:', document.documentElement.classList.contains('dark'));
    }, 500);
  };

  if (!mounted) {
    return <div className="w-20 h-9" />;
  }

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
      <button
        onClick={() => handleThemeChange('light')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          theme === 'light'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        aria-label="Light mode"
        title="Light mode"
      >
        ☀️
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          theme === 'dark'
            ? 'bg-slate-900 text-slate-100 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
        aria-label="Dark mode"
        title="Dark mode"
      >
        🌙
      </button>
    </div>
  );
}
