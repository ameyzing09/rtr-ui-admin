/**
 * Translation Keys
 * 
 * This file defines all translation keys used throughout the application.
 * When implementing full i18n, these keys will be used to look up
 * translations in language files.
 */

// Common translation keys
export const TRANSLATION_KEYS = {
  // Common actions
  COMMON: {
    SAVE: 'common.save',
    CANCEL: 'common.cancel',
    DELETE: 'common.delete',
    EDIT: 'common.edit',
    SUBMIT: 'common.submit',
    LOADING: 'common.loading',
    ERROR: 'common.error',
    SUCCESS: 'common.success',
    CLOSE: 'common.close',
    OPEN: 'common.open',
    YES: 'common.yes',
    NO: 'common.no',
    CONFIRM: 'common.confirm',
    BACK: 'common.back',
    NEXT: 'common.next',
    PREVIOUS: 'common.previous',
    CONTINUE: 'common.continue',
    FINISH: 'common.finish',
  },

  // Navigation
  NAV: {
    DASHBOARD: 'nav.dashboard',
    OVERVIEW: 'nav.overview',
    SETTINGS: 'nav.settings',
    LOGOUT: 'nav.logout',
    HELP_SUPPORT: 'nav.helpSupport',
    COMMAND_CENTER: 'nav.commandCenter',
    GLOBAL_SEARCH: 'nav.globalSearch',
    TENANTS: 'nav.tenants',
    USERS_ACCESS: 'nav.usersAccess',
    BILLING: 'nav.billing',
    INTEGRATIONS: 'nav.integrations',
    HEALTH: 'nav.health',
  },

  // Dashboard sections
  DASHBOARD: {
    TITLE: 'dashboard.title',
    WELCOME: 'dashboard.welcome',
    ADMIN_DASHBOARD: 'dashboard.adminDashboard',
    COMING_SOON: 'dashboard.comingSoon',
    NOT_AVAILABLE: 'dashboard.notAvailable',
    EXPLORE_OTHER_SECTIONS: 'dashboard.exploreOtherSections',
  },

  // Tenant management
  TENANTS: {
    ALL_TENANTS: 'tenants.allTenants',
    CREATE_TENANT: 'tenants.createTenant',
    ONBOARDING_QUEUE: 'tenants.onboardingQueue',
    IMPERSONATE: 'tenants.impersonate',
    TENANT_NAME: 'tenants.tenantName',
    DEFAULT_TENANT_NAME: 'tenants.defaultTenantName',
  },

  // User management
  USERS: {
    PLATFORM_USERS: 'users.platformUsers',
    ROLES_PERMISSIONS: 'users.rolesPermissions',
    SSO_PROVIDERS: 'users.ssoProviders',
    API_KEYS: 'users.apiKeys',
    USER_NAME: 'users.userName',
    USER_EMAIL: 'users.userEmail',
    USER_ROLE: 'users.userRole',
  },

  // Billing
  BILLING: {
    PLANS_PRICING: 'billing.plansPricing',
    SUBSCRIPTIONS: 'billing.subscriptions',
    INVOICES_TAXES: 'billing.invoicesTaxes',
    COUPONS: 'billing.coupons',
  },

  // Health and monitoring
  HEALTH: {
    PLATFORM_HEALTH: 'health.platformHealth',
    SERVICE_HEALTH: 'health.serviceHealth',
    WEBHOOKS_HUB: 'health.webhooksHub',
    QUEUES_JOBS: 'health.queuesJobs',
    RATE_LIMITS: 'health.rateLimits',
  },

  // Forms and inputs
  FORMS: {
    REQUIRED_FIELD: 'forms.requiredField',
    INVALID_EMAIL: 'forms.invalidEmail',
    PASSWORD_TOO_SHORT: 'forms.passwordTooShort',
    PASSWORD_TOO_WEAK: 'forms.passwordTooWeak',
    PASSWORDS_DONT_MATCH: 'forms.passwordsDontMatch',
    TENANT_NAME_TOO_SHORT: 'forms.tenantNameTooShort',
    SLUG_INVALID: 'forms.slugInvalid',
  },

  // Placeholders
  PLACEHOLDERS: {
    SEARCH: 'placeholders.search',
    SEARCH_NAVIGATION: 'placeholders.searchNavigation',
    EMAIL: 'placeholders.email',
    PASSWORD: 'placeholders.password',
    TENANT_NAME: 'placeholders.tenantName',
    USER_NAME: 'placeholders.userName',
  },

  // Status messages
  STATUS: {
    IDLE: 'status.idle',
    ACTIVE: 'status.active',
    INACTIVE: 'status.inactive',
    PENDING: 'status.pending',
    COMPLETED: 'status.completed',
    FAILED: 'status.failed',
    CONNECTING: 'status.connecting',
    CONNECTED: 'status.connected',
    DISCONNECTED: 'status.disconnected',
    ONLINE: 'status.online',
    OFFLINE: 'status.offline',
  },

  // Error messages
  ERRORS: {
    GENERIC: 'errors.generic',
    NETWORK: 'errors.network',
    UNAUTHORIZED: 'errors.unauthorized',
    NOT_FOUND: 'errors.notFound',
    SERVER_ERROR: 'errors.serverError',
    VALIDATION_ERROR: 'errors.validationError',
    TIMEOUT: 'errors.timeout',
  },

  // Success messages
  SUCCESS: {
    SAVED: 'success.saved',
    CREATED: 'success.created',
    UPDATED: 'success.updated',
    DELETED: 'success.deleted',
    SENT: 'success.sent',
    COPIED: 'success.copied',
  },

  // Accessibility labels
  ARIA: {
    TOGGLE_NAVIGATION_MENU: 'aria.toggleNavigationMenu',
    TOGGLE_THEME: 'aria.toggleTheme',
    CLOSE_NAVIGATION_MENU: 'aria.closeNavigationMenu',
    NAVIGATION_MENU: 'aria.navigationMenu',
    MAIN_NAVIGATION: 'aria.mainNavigation',
    USER_MENU: 'aria.userMenu',
    SIDEBAR_TOGGLE: 'aria.sidebarToggle',
    SEARCH_INPUT: 'aria.searchInput',
    LOADING: 'aria.loading',
    REMOVE_BADGE: 'aria.removeBadge',
  },

  // Theme and appearance
  THEME: {
    LIGHT_MODE: 'theme.lightMode',
    DARK_MODE: 'theme.darkMode',
    SYSTEM_MODE: 'theme.systemMode',
    TOGGLE_DESCRIPTION: 'theme.toggleDescription',
  },

  // File and upload
  FILES: {
    MAX_FILE_SIZE: 'files.maxFileSize',
    ACCEPTED_IMAGE_TYPES: 'files.acceptedImageTypes',
    UPLOAD_PROGRESS: 'files.uploadProgress',
    UPLOAD_COMPLETE: 'files.uploadComplete',
    UPLOAD_FAILED: 'files.uploadFailed',
  },

  // Maintenance
  MAINTENANCE: {
    TITLE: 'maintenance.title',
    DESCRIPTION: 'maintenance.description',
    WINDOW_PROGRESS: 'maintenance.windowProgress',
    SIT_TIGHT: 'maintenance.sitTight',
    SCHEDULED: 'maintenance.scheduled',
  },

  // Quick actions
  QUICK_ACTIONS: {
    NO_ACTIONS_AVAILABLE: 'quickActions.noActionsAvailable',
  },
} as const;

// Type for translation keys
export type TranslationKey = 
  | typeof TRANSLATION_KEYS.COMMON[keyof typeof TRANSLATION_KEYS.COMMON]
  | typeof TRANSLATION_KEYS.NAV[keyof typeof TRANSLATION_KEYS.NAV]
  | typeof TRANSLATION_KEYS.DASHBOARD[keyof typeof TRANSLATION_KEYS.DASHBOARD]
  | typeof TRANSLATION_KEYS.TENANTS[keyof typeof TRANSLATION_KEYS.TENANTS]
  | typeof TRANSLATION_KEYS.USERS[keyof typeof TRANSLATION_KEYS.USERS]
  | typeof TRANSLATION_KEYS.BILLING[keyof typeof TRANSLATION_KEYS.BILLING]
  | typeof TRANSLATION_KEYS.HEALTH[keyof typeof TRANSLATION_KEYS.HEALTH]
  | typeof TRANSLATION_KEYS.FORMS[keyof typeof TRANSLATION_KEYS.FORMS]
  | typeof TRANSLATION_KEYS.PLACEHOLDERS[keyof typeof TRANSLATION_KEYS.PLACEHOLDERS]
  | typeof TRANSLATION_KEYS.STATUS[keyof typeof TRANSLATION_KEYS.STATUS]
  | typeof TRANSLATION_KEYS.ERRORS[keyof typeof TRANSLATION_KEYS.ERRORS]
  | typeof TRANSLATION_KEYS.SUCCESS[keyof typeof TRANSLATION_KEYS.SUCCESS]
  | typeof TRANSLATION_KEYS.ARIA[keyof typeof TRANSLATION_KEYS.ARIA]
  | typeof TRANSLATION_KEYS.THEME[keyof typeof TRANSLATION_KEYS.THEME]
  | typeof TRANSLATION_KEYS.FILES[keyof typeof TRANSLATION_KEYS.FILES]
  | typeof TRANSLATION_KEYS.MAINTENANCE[keyof typeof TRANSLATION_KEYS.MAINTENANCE]
  | typeof TRANSLATION_KEYS.QUICK_ACTIONS[keyof typeof TRANSLATION_KEYS.QUICK_ACTIONS];

// Helper function to get all keys as a flat array
export function getAllTranslationKeys(): string[] {
  const keys: string[] = [];
  
  const addKeys = (obj: Record<string, unknown>, prefix = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        addKeys(value as Record<string, unknown>, prefix ? `${prefix}.${key.toLowerCase()}` : key.toLowerCase());
      } else {
        keys.push(value as string);
      }
    });
  };
  
  addKeys(TRANSLATION_KEYS);
  return keys;
}

// Helper function to validate translation key
export function isValidTranslationKey(key: string): key is TranslationKey {
  return getAllTranslationKeys().includes(key);
}
