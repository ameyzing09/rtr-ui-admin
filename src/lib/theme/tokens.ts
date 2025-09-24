export type Theme = 'default' | 'tenant-a' | 'tenant-b' | 'tenant-c';

export interface ThemeConfig {
  tenant: Theme;
  colors: {
    primary: string;
    secondary: string;
    bg: string;
    fg: string;
    border: string;
    muted: string;
  };
  radius: {
    pill: string;
    md: string;
  };
  shadows: {
    sm: string;
    lg: string;
  };
}

export const defaultTheme: ThemeConfig = {
  tenant: 'default',
  colors: {
    primary: '59 130 246',
    secondary: '168 85 247',
    bg: '249 250 251',
    fg: '17 24 39',
    border: '229 231 235',
    muted: '156 163 175',
  },
  radius: {
    pill: '100px',
    md: '0.5rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
  },
};

export const tenantThemes: Record<Theme, Partial<ThemeConfig>> = {
  'default': {},
  'tenant-a': {
    colors: {
      primary: '239 68 68',
      secondary: '245 158 11',
      bg: '249 250 251',
      fg: '17 24 39',
      border: '229 231 235',
      muted: '156 163 175',
    },
  },
  'tenant-b': {
    colors: {
      primary: '34 197 94',
      secondary: '6 182 212',
      bg: '249 250 251',
      fg: '17 24 39',
      border: '229 231 235',
      muted: '156 163 175',
    },
  },
  'tenant-c': {
    colors: {
      primary: '168 85 247',
      secondary: '236 72 153',
      bg: '249 250 251',
      fg: '17 24 39',
      border: '229 231 235',
      muted: '156 163 175',
    },
  },
};

/**
 * Apply theme to the document by setting data-tenant attribute
 */
export function applyTheme(tenant: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-tenant', tenant);
  }
}

/**
 * Get current theme from document
 */
export function getCurrentTheme(): Theme {
  if (typeof document !== 'undefined') {
    const tenant = document.documentElement.getAttribute('data-tenant') as Theme;
    return tenant || 'default';
  }
  return 'default';
}

/**
 * Merge theme configurations
 */
export function getThemeConfig(tenant: Theme): ThemeConfig {
  return {
    ...defaultTheme,
    ...tenantThemes[tenant],
    tenant,
  };
}
