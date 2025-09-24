// Internationalization (i18n) - Future Implementation
// 
// This file reserves the structure for future i18n implementation.
// When ready to implement internationalization:
// 1. Install i18n library (react-i18next, next-i18next, etc.)
// 2. Set up translation files in locales/ directory
// 3. Configure language detection and routing
// 4. Implement translation hooks and components

// Placeholder types for future implementation
export interface Translation {
  [key: string]: string | Translation;
}

export interface Locale {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

// Supported locales (to be expanded)
export const LOCALES: Locale[] = [
  {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  {
    code: 'es',
    name: 'Español',
    direction: 'ltr',
    flag: '🇪🇸',
  },
  {
    code: 'fr',
    name: 'Français',
    direction: 'ltr',
    flag: '🇫🇷',
  },
  {
    code: 'de',
    name: 'Deutsch',
    direction: 'ltr',
    flag: '🇩🇪',
  },
  {
    code: 'ar',
    name: 'العربية',
    direction: 'rtl',
    flag: '🇸🇦',
  },
];

export const DEFAULT_LOCALE = 'en';

// Placeholder translation function
export function t(key: string, params?: Record<string, unknown>): string {
  // This is a placeholder that returns the key itself
  // In a real implementation, this would:
  // 1. Look up the translation for the current locale
  // 2. Interpolate parameters
  // 3. Handle pluralization
  // 4. Fall back to default locale if translation is missing
  
  if (params) {
    // Simple parameter replacement for demonstration
    return key.replace(/\{\{(\w+)\}\}/g, (match, param) => 
      params[param]?.toString() || match
    );
  }
  
  return key;
}

// Placeholder hooks for future implementation
export function useTranslation() {
  return {
    t,
    locale: DEFAULT_LOCALE,
    locales: LOCALES,
    setLocale: (locale: string) => {
      console.log(`Future: Setting locale to ${locale}`);
    },
  };
}

export function useLocale() {
  return {
    locale: DEFAULT_LOCALE,
    direction: 'ltr',
    setLocale: (locale: string) => {
      console.log(`Future: Setting locale to ${locale}`);
    },
  };
}

// Utility functions for future implementation
export const i18nUtils = {
  // Detect user's preferred language
  detectLocale(): string {
    if (typeof window !== 'undefined') {
      // Browser locale detection
      return window.navigator.language.split('-')[0] || DEFAULT_LOCALE;
    }
    return DEFAULT_LOCALE;
  },

  // Format numbers according to locale
  formatNumber(value: number, locale = DEFAULT_LOCALE): string {
    return new Intl.NumberFormat(locale).format(value);
  },

  // Format currency according to locale
  formatCurrency(value: number, currency = 'USD', locale = DEFAULT_LOCALE): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(value);
  },

  // Format date according to locale
  formatDate(date: Date, locale = DEFAULT_LOCALE): string {
    return new Intl.DateTimeFormat(locale).format(date);
  },

  // Format relative time
  formatRelativeTime(date: Date, locale = DEFAULT_LOCALE): string {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const diff = date.getTime() - Date.now();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    
    if (Math.abs(days) < 1) {
      const hours = Math.round(diff / (1000 * 60 * 60));
      if (Math.abs(hours) < 1) {
        const minutes = Math.round(diff / (1000 * 60));
        return rtf.format(minutes, 'minute');
      }
      return rtf.format(hours, 'hour');
    }
    
    return rtf.format(days, 'day');
  },

  // Check if locale is RTL
  isRTL(locale: string): boolean {
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    return rtlLocales.includes(locale);
  },
};

// Export placeholder for future translation files structure
export const translationKeys = {
  // Common
  common: {
    save: 'common.save',
    cancel: 'common.cancel',
    delete: 'common.delete',
    edit: 'common.edit',
    loading: 'common.loading',
    error: 'common.error',
    success: 'common.success',
  },
  
  // Navigation
  nav: {
    dashboard: 'nav.dashboard',
    users: 'nav.users',
    settings: 'nav.settings',
    logout: 'nav.logout',
  },
  
  // Dashboard
  dashboard: {
    title: 'dashboard.title',
    welcome: 'dashboard.welcome',
    stats: {
      revenue: 'dashboard.stats.revenue',
      users: 'dashboard.stats.users',
      orders: 'dashboard.stats.orders',
    },
  },
  
  // Errors
  errors: {
    notFound: 'errors.notFound',
    serverError: 'errors.serverError',
    unauthorized: 'errors.unauthorized',
  },
} as const;
