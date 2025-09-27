/**
 * English Translations
 * 
 * This file contains all English translations for the application.
 * These are used as the default language and fallback for missing translations.
 */

import { TRANSLATION_KEYS } from './keys';

export const enTranslations = {
  // Common actions
  [TRANSLATION_KEYS.COMMON.SAVE]: 'Save',
  [TRANSLATION_KEYS.COMMON.CANCEL]: 'Cancel',
  [TRANSLATION_KEYS.COMMON.DELETE]: 'Delete',
  [TRANSLATION_KEYS.COMMON.EDIT]: 'Edit',
  [TRANSLATION_KEYS.COMMON.SUBMIT]: 'Submit',
  [TRANSLATION_KEYS.COMMON.LOADING]: 'Loading...',
  [TRANSLATION_KEYS.COMMON.ERROR]: 'Error',
  [TRANSLATION_KEYS.COMMON.SUCCESS]: 'Success',
  [TRANSLATION_KEYS.COMMON.CLOSE]: 'Close',
  [TRANSLATION_KEYS.COMMON.OPEN]: 'Open',
  [TRANSLATION_KEYS.COMMON.YES]: 'Yes',
  [TRANSLATION_KEYS.COMMON.NO]: 'No',
  [TRANSLATION_KEYS.COMMON.CONFIRM]: 'Confirm',
  [TRANSLATION_KEYS.COMMON.BACK]: 'Back',
  [TRANSLATION_KEYS.COMMON.NEXT]: 'Next',
  [TRANSLATION_KEYS.COMMON.PREVIOUS]: 'Previous',
  [TRANSLATION_KEYS.COMMON.CONTINUE]: 'Continue',
  [TRANSLATION_KEYS.COMMON.FINISH]: 'Finish',

  // Navigation
  [TRANSLATION_KEYS.NAV.DASHBOARD]: 'Dashboard',
  [TRANSLATION_KEYS.NAV.OVERVIEW]: 'Overview',
  [TRANSLATION_KEYS.NAV.SETTINGS]: 'Settings',
  [TRANSLATION_KEYS.NAV.LOGOUT]: 'Sign Out',
  [TRANSLATION_KEYS.NAV.HELP_SUPPORT]: 'Help & Support',
  [TRANSLATION_KEYS.NAV.COMMAND_CENTER]: 'Command Center',
  [TRANSLATION_KEYS.NAV.GLOBAL_SEARCH]: 'Global Search',
  [TRANSLATION_KEYS.NAV.TENANTS]: 'Tenants',
  [TRANSLATION_KEYS.NAV.USERS_ACCESS]: 'Users & Access',
  [TRANSLATION_KEYS.NAV.BILLING]: 'Billing',
  [TRANSLATION_KEYS.NAV.INTEGRATIONS]: 'Integrations',
  [TRANSLATION_KEYS.NAV.HEALTH]: 'Health',

  // Dashboard sections
  [TRANSLATION_KEYS.DASHBOARD.TITLE]: 'Dashboard',
  [TRANSLATION_KEYS.DASHBOARD.WELCOME]: 'Welcome',
  [TRANSLATION_KEYS.DASHBOARD.ADMIN_DASHBOARD]: 'Admin Dashboard',
  [TRANSLATION_KEYS.DASHBOARD.COMING_SOON]: 'Coming Soon',
  [TRANSLATION_KEYS.DASHBOARD.NOT_AVAILABLE]: 'This page is not available yet. Check back soon.',
  [TRANSLATION_KEYS.DASHBOARD.EXPLORE_OTHER_SECTIONS]: "We're building this experience. In the meantime, explore other sections from the sidebar.",

  // Tenant management
  [TRANSLATION_KEYS.TENANTS.ALL_TENANTS]: 'All Tenants',
  [TRANSLATION_KEYS.TENANTS.CREATE_TENANT]: 'Create Tenant',
  [TRANSLATION_KEYS.TENANTS.ONBOARDING_QUEUE]: 'Onboarding Queue',
  [TRANSLATION_KEYS.TENANTS.IMPERSONATE]: 'Impersonate',
  [TRANSLATION_KEYS.TENANTS.TENANT_NAME]: 'Tenant Name',
  [TRANSLATION_KEYS.TENANTS.DEFAULT_TENANT_NAME]: 'Acme Corp',

  // User management
  [TRANSLATION_KEYS.USERS.PLATFORM_USERS]: 'Platform Users',
  [TRANSLATION_KEYS.USERS.ROLES_PERMISSIONS]: 'Roles & Permissions',
  [TRANSLATION_KEYS.USERS.SSO_PROVIDERS]: 'SSO Providers',
  [TRANSLATION_KEYS.USERS.API_KEYS]: 'API Keys',
  [TRANSLATION_KEYS.USERS.USER_NAME]: 'User Name',
  [TRANSLATION_KEYS.USERS.USER_EMAIL]: 'Email',
  [TRANSLATION_KEYS.USERS.USER_ROLE]: 'Role',

  // Billing
  [TRANSLATION_KEYS.BILLING.PLANS_PRICING]: 'Plans & Pricing',
  [TRANSLATION_KEYS.BILLING.SUBSCRIPTIONS]: 'Subscriptions',
  [TRANSLATION_KEYS.BILLING.INVOICES_TAXES]: 'Invoices & Taxes',
  [TRANSLATION_KEYS.BILLING.COUPONS]: 'Coupons/Promos',

  // Health and monitoring
  [TRANSLATION_KEYS.HEALTH.PLATFORM_HEALTH]: 'Platform Health',
  [TRANSLATION_KEYS.HEALTH.SERVICE_HEALTH]: 'Service Health',
  [TRANSLATION_KEYS.HEALTH.WEBHOOKS_HUB]: 'Webhooks Hub',
  [TRANSLATION_KEYS.HEALTH.QUEUES_JOBS]: 'Queues & Jobs',
  [TRANSLATION_KEYS.HEALTH.RATE_LIMITS]: 'Rate Limits',

  // Forms and inputs
  [TRANSLATION_KEYS.FORMS.REQUIRED_FIELD]: 'This field is required',
  [TRANSLATION_KEYS.FORMS.INVALID_EMAIL]: 'Please enter a valid email address',
  [TRANSLATION_KEYS.FORMS.PASSWORD_TOO_SHORT]: 'Password must be at least 8 characters',
  [TRANSLATION_KEYS.FORMS.PASSWORD_TOO_WEAK]: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  [TRANSLATION_KEYS.FORMS.PASSWORDS_DONT_MATCH]: 'Passwords do not match',
  [TRANSLATION_KEYS.FORMS.TENANT_NAME_TOO_SHORT]: 'Tenant name must be at least 2 characters',
  [TRANSLATION_KEYS.FORMS.SLUG_INVALID]: 'Slug can only contain lowercase letters, numbers, and hyphens',

  // Placeholders
  [TRANSLATION_KEYS.PLACEHOLDERS.SEARCH]: 'Search...',
  [TRANSLATION_KEYS.PLACEHOLDERS.SEARCH_NAVIGATION]: 'Search navigation...',
  [TRANSLATION_KEYS.PLACEHOLDERS.EMAIL]: 'Enter your email',
  [TRANSLATION_KEYS.PLACEHOLDERS.PASSWORD]: 'Enter your password',
  [TRANSLATION_KEYS.PLACEHOLDERS.TENANT_NAME]: 'Enter tenant name',
  [TRANSLATION_KEYS.PLACEHOLDERS.USER_NAME]: 'Enter your name',

  // Status messages
  [TRANSLATION_KEYS.STATUS.IDLE]: 'Idle',
  [TRANSLATION_KEYS.STATUS.ACTIVE]: 'Active',
  [TRANSLATION_KEYS.STATUS.INACTIVE]: 'Inactive',
  [TRANSLATION_KEYS.STATUS.PENDING]: 'Pending',
  [TRANSLATION_KEYS.STATUS.COMPLETED]: 'Completed',
  [TRANSLATION_KEYS.STATUS.FAILED]: 'Failed',
  [TRANSLATION_KEYS.STATUS.CONNECTING]: 'Connecting...',
  [TRANSLATION_KEYS.STATUS.CONNECTED]: 'Connected',
  [TRANSLATION_KEYS.STATUS.DISCONNECTED]: 'Disconnected',
  [TRANSLATION_KEYS.STATUS.ONLINE]: 'Online',
  [TRANSLATION_KEYS.STATUS.OFFLINE]: 'Offline',

  // Error messages
  [TRANSLATION_KEYS.ERRORS.GENERIC]: 'Something went wrong. Please try again.',
  [TRANSLATION_KEYS.ERRORS.NETWORK]: 'Network error. Please check your connection.',
  [TRANSLATION_KEYS.ERRORS.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [TRANSLATION_KEYS.ERRORS.NOT_FOUND]: 'The requested resource was not found.',
  [TRANSLATION_KEYS.ERRORS.SERVER_ERROR]: 'Server error. Please try again later.',
  [TRANSLATION_KEYS.ERRORS.VALIDATION_ERROR]: 'Please check your input and try again.',
  [TRANSLATION_KEYS.ERRORS.TIMEOUT]: 'Request timed out. Please try again.',

  // Success messages
  [TRANSLATION_KEYS.SUCCESS.SAVED]: 'Changes saved successfully',
  [TRANSLATION_KEYS.SUCCESS.CREATED]: 'Created successfully',
  [TRANSLATION_KEYS.SUCCESS.UPDATED]: 'Updated successfully',
  [TRANSLATION_KEYS.SUCCESS.DELETED]: 'Deleted successfully',
  [TRANSLATION_KEYS.SUCCESS.SENT]: 'Sent successfully',
  [TRANSLATION_KEYS.SUCCESS.COPIED]: 'Copied to clipboard',

  // Accessibility labels
  [TRANSLATION_KEYS.ARIA.TOGGLE_NAVIGATION_MENU]: 'Toggle navigation menu',
  [TRANSLATION_KEYS.ARIA.TOGGLE_THEME]: 'Toggle theme',
  [TRANSLATION_KEYS.ARIA.CLOSE_NAVIGATION_MENU]: 'Close navigation menu',
  [TRANSLATION_KEYS.ARIA.NAVIGATION_MENU]: 'Navigation menu',
  [TRANSLATION_KEYS.ARIA.MAIN_NAVIGATION]: 'Main navigation',
  [TRANSLATION_KEYS.ARIA.USER_MENU]: 'User menu',
  [TRANSLATION_KEYS.ARIA.SIDEBAR_TOGGLE]: 'Toggle sidebar',
  [TRANSLATION_KEYS.ARIA.SEARCH_INPUT]: 'Search input',
  [TRANSLATION_KEYS.ARIA.LOADING]: 'Loading...',
  [TRANSLATION_KEYS.ARIA.REMOVE_BADGE]: 'Remove badge',

  // Theme and appearance
  [TRANSLATION_KEYS.THEME.LIGHT_MODE]: 'Light mode',
  [TRANSLATION_KEYS.THEME.DARK_MODE]: 'Dark mode',
  [TRANSLATION_KEYS.THEME.SYSTEM_MODE]: 'System',
  [TRANSLATION_KEYS.THEME.TOGGLE_DESCRIPTION]: 'Toggle between light and dark theme',

  // File and upload
  [TRANSLATION_KEYS.FILES.MAX_FILE_SIZE]: '10MB max',
  [TRANSLATION_KEYS.FILES.ACCEPTED_IMAGE_TYPES]: 'PNG, JPG, or SVG files',
  [TRANSLATION_KEYS.FILES.UPLOAD_PROGRESS]: 'Uploading...',
  [TRANSLATION_KEYS.FILES.UPLOAD_COMPLETE]: 'Upload complete',
  [TRANSLATION_KEYS.FILES.UPLOAD_FAILED]: 'Upload failed',

  // Maintenance
  [TRANSLATION_KEYS.MAINTENANCE.TITLE]: "We're tuning things up",
  [TRANSLATION_KEYS.MAINTENANCE.DESCRIPTION]: 'We are currently offline while we apply a few improvements. Please check back soon or reach out if you need assistance right away.',
  [TRANSLATION_KEYS.MAINTENANCE.WINDOW_PROGRESS]: 'Maintenance window in progress',
  [TRANSLATION_KEYS.MAINTENANCE.SIT_TIGHT]: 'Sit tight',
  [TRANSLATION_KEYS.MAINTENANCE.SCHEDULED]: 'Scheduled Maintenance',

  // Quick actions
  [TRANSLATION_KEYS.QUICK_ACTIONS.NO_ACTIONS_AVAILABLE]: 'No actions available',
} as const;

export type EnTranslations = typeof enTranslations;

