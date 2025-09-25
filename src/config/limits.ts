/**
 * Numeric Limits and Configuration Values
 * 
 * This file contains all numeric constants, limits, and timing values
 * used throughout the application.
 */

// API and network timeouts (in milliseconds)
export const TIMEOUTS = {
  API_REQUEST: 10000, // 10 seconds
  DEBOUNCE_SEARCH: 300, // 300ms
  DEBOUNCE_INPUT: 500, // 500ms
  MOBILE_DRAWER_ANIMATION: 250, // 250ms
  TOAST_DURATION: 5000, // 5 seconds
  RETRY_DELAY: 1000, // 1 second
  LONG_POLLING: 30000, // 30 seconds
  WEBSOCKET_RECONNECT: 3000, // 3 seconds
} as const;

// Pagination and data limits
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  SMALL_PAGE_SIZE: 10,
  LARGE_PAGE_SIZE: 50,
  INFINITE_SCROLL_THRESHOLD: 5, // Items from bottom to trigger load
} as const;

// Form input limits
export const INPUT_LIMITS = {
  // Text inputs
  TENANT_NAME_MIN: 2,
  TENANT_NAME_MAX: 50,
  USER_NAME_MIN: 2,
  USER_NAME_MAX: 100,
  EMAIL_MAX: 254,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  SLUG_MIN: 2,
  SLUG_MAX: 50,
  
  // Text areas
  DESCRIPTION_MAX: 500,
  COMMENT_MAX: 1000,
  BIO_MAX: 250,
  
  // File uploads
  FILE_SIZE_MAX: 10 * 1024 * 1024, // 10MB in bytes
  IMAGE_SIZE_MAX: 5 * 1024 * 1024, // 5MB in bytes
  AVATAR_SIZE_MAX: 2 * 1024 * 1024, // 2MB in bytes
  
  // Arrays and collections
  TAGS_MAX: 10,
  PERMISSIONS_MAX: 50,
  ROLES_MAX: 20,
} as const;

// UI component limits and sizing
export const UI_LIMITS = {
  // Sidebar and navigation
  SIDEBAR_WIDTH_EXPANDED: 280, // pixels
  SIDEBAR_WIDTH_COLLAPSED: 64, // pixels
  NAVBAR_HEIGHT: 64, // pixels
  MOBILE_BREAKPOINT: 768, // pixels
  
  // Tables and lists
  TABLE_ROWS_PER_PAGE: 25,
  MAX_VISIBLE_BREADCRUMBS: 4,
  MAX_NAVIGATION_DEPTH: 3,
  
  // Cards and containers
  CARD_MAX_WIDTH: 800, // pixels
  MODAL_MAX_WIDTH: 640, // pixels
  DROPDOWN_MAX_HEIGHT: 300, // pixels
  
  // Charts and data visualization
  CHART_MIN_HEIGHT: 200, // pixels
  CHART_MAX_HEIGHT: 500, // pixels
  
  // Animations and transitions
  ANIMATION_DURATION_FAST: 150, // milliseconds
  ANIMATION_DURATION_NORMAL: 300, // milliseconds
  ANIMATION_DURATION_SLOW: 500, // milliseconds
} as const;

// Rate limiting and throttling
export const RATE_LIMITS = {
  API_CALLS_PER_MINUTE: 60,
  LOGIN_ATTEMPTS_MAX: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  SEARCH_REQUESTS_PER_SECOND: 2,
  FILE_UPLOAD_CONCURRENT: 3,
} as const;

// Cache and storage limits
export const CACHE_LIMITS = {
  LOCAL_STORAGE_MAX_ITEMS: 100,
  SESSION_STORAGE_MAX_ITEMS: 50,
  MEMORY_CACHE_MAX_SIZE: 50 * 1024 * 1024, // 50MB in bytes
  CACHE_TTL_SHORT: 5 * 60 * 1000, // 5 minutes
  CACHE_TTL_MEDIUM: 30 * 60 * 1000, // 30 minutes
  CACHE_TTL_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Validation and data quality
export const VALIDATION_LIMITS = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SLUG_REGEX: /^[a-z0-9-]+$/,
  PASSWORD_MIN_COMPLEXITY: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
} as const;

// Performance and optimization
export const PERFORMANCE = {
  VIRTUAL_LIST_OVERSCAN: 5, // Items to render outside viewport
  IMAGE_LAZY_LOAD_THRESHOLD: 100, // pixels from viewport
  DEBOUNCE_RESIZE: 100, // milliseconds
  THROTTLE_SCROLL: 16, // milliseconds (~60fps)
  MAX_CONCURRENT_REQUESTS: 6,
} as const;

// Feature-specific limits
export const FEATURE_LIMITS = {
  // Dashboard widgets
  DASHBOARD_WIDGETS_MAX: 12,
  CHART_DATA_POINTS_MAX: 1000,
  
  // Notifications
  NOTIFICATIONS_MAX_VISIBLE: 5,
  NOTIFICATION_HISTORY_MAX: 100,
  
  // Search
  SEARCH_RESULTS_MAX: 50,
  SEARCH_SUGGESTIONS_MAX: 10,
  RECENT_SEARCHES_MAX: 10,
  
  // Activity feed
  ACTIVITY_ITEMS_MAX: 200,
  
  // Export and import
  EXPORT_RECORDS_MAX: 10000,
  IMPORT_BATCH_SIZE: 500,
} as const;

// Export all limits as a single object for convenience
export const LIMITS = {
  TIMEOUTS,
  PAGINATION,
  INPUT_LIMITS,
  UI_LIMITS,
  RATE_LIMITS,
  CACHE_LIMITS,
  VALIDATION_LIMITS,
  PERFORMANCE,
  FEATURE_LIMITS,
} as const;

// Type exports for strict typing
export type TimeoutKeys = keyof typeof TIMEOUTS;
export type PaginationKeys = keyof typeof PAGINATION;
export type InputLimitKeys = keyof typeof INPUT_LIMITS;
export type UILimitKeys = keyof typeof UI_LIMITS;
export type RateLimitKeys = keyof typeof RATE_LIMITS;
export type CacheLimitKeys = keyof typeof CACHE_LIMITS;
export type ValidationLimitKeys = keyof typeof VALIDATION_LIMITS;
export type PerformanceKeys = keyof typeof PERFORMANCE;
export type FeatureLimitKeys = keyof typeof FEATURE_LIMITS;
