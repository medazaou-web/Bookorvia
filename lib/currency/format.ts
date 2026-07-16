export function formatCurrency(amount: number, currency: string, locale: string = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function getCurrencySymbol(currency: string): string {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    });
    
    const parts = formatter.formatToParts(1);
    const symbolPart = parts.find(part => part.type === 'currency');
    return symbolPart?.value || currency;
  } catch {
    return currency;
  }
}

export function getCurrencyName(currency: string): string {
  const currencyNames: Record<string, string> = {
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'GBP': 'British Pound',
    'MAD': 'Moroccan Dirham',
    'BRL': 'Brazilian Real',
    'MXN': 'Mexican Peso',
    'ARS': 'Argentine Peso',
    'AED': 'UAE Dirham',
    'SAR': 'Saudi Riyal',
    'INR': 'Indian Rupee',
    'AUD': 'Australian Dollar',
    'CAD': 'Canadian Dollar',
  };
  
  return currencyNames[currency] || currency;
}

// Get regional default currency based on country code
export const regionToCurrency: Record<string, string> = {
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

export function getDefaultCurrencyForRegion(regionCode: string): string {
  return regionToCurrency[regionCode] || 'USD';
}
