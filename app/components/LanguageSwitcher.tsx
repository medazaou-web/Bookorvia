'use client';

import { useLanguage } from '@/lib/context/LanguageContext';
import { useState } from 'react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  const languages = [
    { code: 'en' as const },
    { code: 'es' as const },
    { code: 'fr' as const },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
        title="Change language / Cambiar idioma / Changer la langue"
      >
        {language.toUpperCase()}
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-max bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-white/10 py-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setShowMenu(false);
              }}
              className={`w-full px-4 py-2 text-sm font-medium text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap ${
                language === lang.code
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
