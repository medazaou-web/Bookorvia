import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import { Locale } from './config';

const translations: Record<Locale, any> = {
  en,
  es,
  fr,
};

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}

export function useTranslations(locale: Locale) {
  return (key: string, defaultValue?: string): string => {
    return getTranslation(locale, key) || defaultValue || key;
  };
}

// For getting all translations for a locale
export function getLocaleTranslations(locale: Locale) {
  return translations[locale];
}
