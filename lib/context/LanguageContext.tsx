'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Locale } from '../i18n/config';

interface LanguageContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Locale>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load language from user account, localStorage, or browser language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        // First try to get from user account if authenticated
        try {
          const response = await fetch('/api/user/language', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.language && ['en', 'es', 'fr'].includes(data.language)) {
              setLanguageState(data.language as Locale);
              setIsLoading(false);
              return;
            }
          }
        } catch (error) {
          // User not authenticated, continue to next option
        }

        // Check localStorage (user's manual preference on this device)
        const savedLanguage = localStorage.getItem('bookorvia-language');
        if (savedLanguage && ['en', 'es', 'fr'].includes(savedLanguage)) {
          setLanguageState(savedLanguage as Locale);
          setIsLoading(false);
          return;
        }

        // Try to get from browser language
        const browserLang = navigator.language.split('-')[0];
        if (['en', 'es', 'fr'].includes(browserLang)) {
          setLanguageState(browserLang as Locale);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const handleSetLanguage = (lang: Locale) => {
    setLanguageState(lang);
    // Always save to localStorage as a fallback
    localStorage.setItem('bookorvia-language', lang);
    
    // Try to save to user account if authenticated
    try {
      fetch('/api/user/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      }).catch(() => {
        // Silently fail if not authenticated - localStorage is still set
      });
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
