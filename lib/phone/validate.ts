import { parsePhoneNumber, isValidPhoneNumber, getCountryCallingCode } from 'libphonenumber-js';

export function validatePhoneNumber(phoneNumber: string, countryCode: string): boolean {
  try {
    return isValidPhoneNumber(phoneNumber, countryCode as any);
  } catch {
    return false;
  }
}

export function formatPhoneNumber(phoneNumber: string, countryCode: string): string | null {
  try {
    const parsed = parsePhoneNumber(phoneNumber, countryCode as any);
    return parsed ? parsed.formatInternational() : null;
  } catch {
    return null;
  }
}

export function getPhoneNumberError(phoneNumber: string, countryCode: string): string | null {
  try {
    if (!phoneNumber.trim()) {
      return 'Phone number is required';
    }
    
    if (!isValidPhoneNumber(phoneNumber, countryCode as any)) {
      const countryCallingCode = getCountryCallingCode(countryCode as any);
      return `Invalid phone number for ${countryCode}. Should start with +${countryCallingCode}`;
    }
    
    return null;
  } catch (error) {
    return 'Invalid phone number format';
  }
}

// List of commonly used countries with their calling codes
export const countryPhoneCodes: Record<string, { name: string; code: string; callingCode: string }> = {
  'US': { name: 'United States', code: 'US', callingCode: '+1' },
  'CA': { name: 'Canada', code: 'CA', callingCode: '+1' },
  'GB': { name: 'United Kingdom', code: 'GB', callingCode: '+44' },
  'ES': { name: 'Spain', code: 'ES', callingCode: '+34' },
  'FR': { name: 'France', code: 'FR', callingCode: '+33' },
  'DE': { name: 'Germany', code: 'DE', callingCode: '+49' },
  'IT': { name: 'Italy', code: 'IT', callingCode: '+39' },
  'MA': { name: 'Morocco', code: 'MA', callingCode: '+212' },
  'AE': { name: 'UAE', code: 'AE', callingCode: '+971' },
  'SA': { name: 'Saudi Arabia', code: 'SA', callingCode: '+966' },
  'BR': { name: 'Brazil', code: 'BR', callingCode: '+55' },
  'MX': { name: 'Mexico', code: 'MX', callingCode: '+52' },
  'AR': { name: 'Argentina', code: 'AR', callingCode: '+54' },
  'IN': { name: 'India', code: 'IN', callingCode: '+91' },
  'AU': { name: 'Australia', code: 'AU', callingCode: '+61' },
  'JP': { name: 'Japan', code: 'JP', callingCode: '+81' },
  'CN': { name: 'China', code: 'CN', callingCode: '+86' },
};

export function getCountriesForPhoneValidation(selectedCountries: string[]): { name: string; code: string }[] {
  return selectedCountries
    .map(code => {
      const country = countryPhoneCodes[code];
      return country ? { name: country.name, code } : null;
    })
    .filter(Boolean) as { name: string; code: string }[];
}
