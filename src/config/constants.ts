/**
 * UI Constants - Centralized strings, labels, and UI text
 * 
 * This file contains all user-facing strings used across components.
 * When implementing i18n, these constants will be replaced with translation keys.
 */

// Common UI text
export const UI_TEXT = {
  // Common actions
  SAVE: 'Save',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  EDIT: 'Edit',
  SUBMIT: 'Submit',
  LOADING: 'Loading...',
  ERROR: 'Error',
  SUCCESS: 'Success',
  CLOSE: 'Close',
  OPEN: 'Open',
  
  // Navigation
  DASHBOARD: 'Dashboard',
  OVERVIEW: 'Overview',
  SETTINGS: 'Settings',
  LOGOUT: 'Sign Out',
  HELP_SUPPORT: 'Help & Support',
  
  // States
  COMING_SOON: 'Coming Soon',
  NOT_AVAILABLE: 'This page is not available yet. Check back soon.',
  EXPLORE_OTHER_SECTIONS: "We're building this experience. In the meantime, explore other sections from the sidebar.",
  NO_ACTIONS_AVAILABLE: 'No actions available',
  
  // Tenant-related
  DEFAULT_TENANT_NAME: 'Your SaaS',
  ADMIN_DASHBOARD: 'Admin Dashboard',
  
  // Maintenance
  MAINTENANCE_TITLE: "We're tuning things up",
  MAINTENANCE_DESCRIPTION: 'We are currently offline while we apply a few improvements. Please check back soon or reach out if you need assistance right away.',
  MAINTENANCE_WINDOW_PROGRESS: 'Maintenance window in progress',
  MAINTENANCE_SIT_TIGHT: 'Sit tight',
  SCHEDULED_MAINTENANCE: 'Scheduled Maintenance',
} as const;

// Placeholders for form inputs
export const PLACEHOLDERS = {
  SEARCH: 'Search...',
  SEARCH_NAVIGATION: 'Search navigation...',
  EMAIL: 'Enter your email',
  PASSWORD: 'Enter your password',
  TENANT_NAME: 'Enter tenant name',
  USER_NAME: 'Enter your name',
} as const;

// ARIA labels for accessibility
export const ARIA_LABELS = {
  TOGGLE_NAVIGATION_MENU: 'Toggle navigation menu',
  TOGGLE_THEME: 'Toggle theme',
  CLOSE_NAVIGATION_MENU: 'Close navigation menu',
  NAVIGATION_MENU: 'Navigation menu',
  MAIN_NAVIGATION: 'Main navigation',
  USER_MENU: 'User menu',
  SIDEBAR_TOGGLE: 'Toggle sidebar',
  SEARCH_INPUT: 'Search input',
} as const;

// Status messages
export const STATUS_MESSAGES = {
  IDLE: 'Idle',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  CONNECTING: 'Connecting...',
  CONNECTED: 'Connected',
  DISCONNECTED: 'Disconnected',
  ONLINE: 'Online',
  OFFLINE: 'Offline',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'Request timed out. Please try again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully',
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SENT: 'Sent successfully',
  COPIED: 'Copied to clipboard',
} as const;

// Default values for forms and components
export const DEFAULT_VALUES = {
  TENANT_NAME: 'Acme Corp',
  USER_NAME: 'John Doe',
  USER_EMAIL: 'john.doe@example.com',
  USER_ROLE: 'Administrator',
  APP_NAME: 'RTR Admin',
  DEFAULT_TENANT_SLUG: 'default',
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_TOO_WEAK: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  CONFIRM_PASSWORD_MISMATCH: 'Passwords do not match',
  TENANT_NAME_TOO_SHORT: 'Tenant name must be at least 2 characters',
  SLUG_INVALID: 'Slug can only contain lowercase letters, numbers, and hyphens',
} as const;

// File and upload related
export const FILE_CONSTANTS = {
  MAX_FILE_SIZE_TEXT: '10MB max',
  ACCEPTED_IMAGE_TYPES: 'PNG, JPG, or SVG files',
  UPLOAD_PROGRESS: 'Uploading...',
  UPLOAD_COMPLETE: 'Upload complete',
  UPLOAD_FAILED: 'Upload failed',
} as const;

// Theme and appearance
export const THEME_CONSTANTS = {
  LIGHT_MODE: 'Light mode',
  DARK_MODE: 'Dark mode',
  SYSTEM_MODE: 'System',
  THEME_TOGGLE_DESCRIPTION: 'Toggle between light and dark theme',
} as const;

// Export all constants as a single object for convenience
export const CONSTANTS = {
  UI_TEXT,
  PLACEHOLDERS,
  ARIA_LABELS,
  STATUS_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULT_VALUES,
  VALIDATION_MESSAGES,
  FILE_CONSTANTS,
  THEME_CONSTANTS,
} as const;

// Type exports for strict typing
export type UITextKeys = keyof typeof UI_TEXT;
export type PlaceholderKeys = keyof typeof PLACEHOLDERS;
export type AriaLabelKeys = keyof typeof ARIA_LABELS;
export type StatusMessageKeys = keyof typeof STATUS_MESSAGES;
export type ErrorMessageKeys = keyof typeof ERROR_MESSAGES;
export type SuccessMessageKeys = keyof typeof SUCCESS_MESSAGES;
export type DefaultValueKeys = keyof typeof DEFAULT_VALUES;
export type ValidationMessageKeys = keyof typeof VALIDATION_MESSAGES;
export type FileConstantKeys = keyof typeof FILE_CONSTANTS;
export type ThemeConstantKeys = keyof typeof THEME_CONSTANTS;

