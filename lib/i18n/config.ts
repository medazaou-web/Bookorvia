export const defaultLocale = 'en' as const;
export const locales = ['en', 'es', 'fr'] as const;
export type Locale = typeof locales[number];

export const localeConfig: Record<Locale, { name: string; flag: string; defaultCurrency: string; region: string }> = {
  en: { name: 'English', flag: '🇺🇸', defaultCurrency: 'USD', region: 'US' },
  es: { name: 'Español', flag: '🇪🇸', defaultCurrency: 'EUR', region: 'ES' },
  fr: { name: 'Français', flag: '🇫🇷', defaultCurrency: 'EUR', region: 'FR' },
};

// Regional default currencies
export const regionalCurrencies: Record<string, string> = {
  'US': 'USD',
  'CA': 'CAD',
  'GB': 'GBP',
  'EU': 'EUR',
  'ES': 'EUR',
  'FR': 'EUR',
  'DE': 'EUR',
  'IT': 'EUR',
  'MA': 'MAD',
  'BR': 'BRL',
  'MX': 'MXN',
  'AR': 'ARS',
  'AE': 'AED',
  'SA': 'SAR',
  'IN': 'INR',
  'AU': 'AUD',
  'JP': 'JPY',
  'CN': 'CNY',
};

export const supportedCurrencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];
