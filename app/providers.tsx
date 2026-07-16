'use client';

import { ThemeProvider } from 'next-themes';
import { LanguageProvider } from '@/lib/context/LanguageContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="light" 
        enableSystem={false}
        enableColorScheme={false}
        storageKey="bookorvia-theme"
      >
        {children}
      </ThemeProvider>
    </LanguageProvider>
  );
}
