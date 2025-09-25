/**
 * Application Paths and Route Constants
 * 
 * This file contains all route definitions, path constants, and URL patterns
 * used throughout the application.
 */

// Base paths
export const BASE_PATHS = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  ADMIN: '/dashboard',
  HELP: '/help',
  DEMO: '/demo',
  COMPONENTS_PREVIEW: '/components-preview',
} as const;

// Dashboard routes
export const DASHBOARD_PATHS = {
  // Overview
  OVERVIEW: '/dashboard',
  COMMAND_CENTER: '/dashboard/command-center',
  GLOBAL_SEARCH: '/dashboard/search',
  
  // Tenants
  TENANTS: '/dashboard/tenants',
  TENANTS_ONBOARDING: '/dashboard/tenants/onboarding',
  TENANTS_CREATE: '/dashboard/tenants/create',
  TENANTS_IMPERSONATE: '/dashboard/tenants/impersonate',
  
  // Users & Access
  USERS: '/dashboard/users',
  PLATFORM_USERS: '/dashboard/users',
  ROLES_PERMISSIONS: '/dashboard/users/roles',
  SSO_PROVIDERS: '/dashboard/users/sso',
  API_KEYS: '/dashboard/users/api-keys',
  
  // Billing
  BILLING: '/dashboard/billing',
  BILLING_PLANS: '/dashboard/billing/plans',
  BILLING_SUBSCRIPTIONS: '/dashboard/billing/subscriptions',
  BILLING_INVOICES: '/dashboard/billing/invoices',
  BILLING_COUPONS: '/dashboard/billing/coupons',
  
  // Catalog & Templates
  CATALOG_PIPELINES: '/dashboard/catalog/pipelines',
  CATALOG_INTERVIEWS: '/dashboard/catalog/interviews',
  CATALOG_JOB_SCHEMA: '/dashboard/catalog/job-schema',
  CATALOG_COMMUNICATIONS: '/dashboard/catalog/communications',
  
  // Integrations
  INTEGRATIONS: '/dashboard/integrations',
  INTEGRATIONS_PROVIDERS: '/dashboard/integrations/providers',
  
  // Health & Monitoring
  HEALTH: '/dashboard/health',
  HEALTH_WEBHOOKS: '/dashboard/health/webhooks',
  HEALTH_PLATFORM: '/dashboard/health/platform',
  HEALTH_SERVICES: '/dashboard/health/services',
  HEALTH_QUEUES: '/dashboard/health/queues',
  HEALTH_RATE_LIMITS: '/dashboard/health/rate-limits',
  
  // Observability & Compliance
  OBSERVABILITY_AUDIT_LOGS: '/dashboard/obs/audit-logs',
  OBSERVABILITY_ACTIVITY: '/dashboard/obs/activity',
  OBSERVABILITY_ERRORS: '/dashboard/obs/errors',
  OBSERVABILITY_PRIVACY: '/dashboard/obs/privacy',
  OBSERVABILITY_BACKUPS: '/dashboard/obs/backups',
  
  // Experiments & Feature Flags
  EXPERIMENTS_FLAGS: '/dashboard/experiments/flags',
  EXPERIMENTS_AB: '/dashboard/experiments/ab',
  
  // Operations & Support
  SUPPORT_TICKETS: '/dashboard/support/tickets',
  SUPPORT_ANNOUNCEMENTS: '/dashboard/support/announcements',
  SUPPORT_STATUS: '/dashboard/support/status',
  
  // Settings
  SETTINGS: '/dashboard/settings',
  SETTINGS_THEMING: '/dashboard/settings/theming',
  SETTINGS_LOCALES: '/dashboard/settings/locales',
} as const;

// Demo paths
export const DEMO_PATHS = {
  TENANT_DASHBOARD: '/demo/tenant/dashboard',
} as const;

// API endpoints
export const API_PATHS = {
  // Base API paths
  API_BASE: '/api',
  
  // Authentication
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_REFRESH: '/api/auth/refresh',
  AUTH_USER: '/api/auth/user',
  
  // Tenants
  TENANTS: '/api/tenants',
  TENANT_BY_ID: '/api/tenants/:id',
  TENANT_USERS: '/api/tenants/:id/users',
  TENANT_SETTINGS: '/api/tenants/:id/settings',
  
  // Users
  USERS: '/api/users',
  USER_BY_ID: '/api/users/:id',
  USER_PROFILE: '/api/users/profile',
  USER_PREFERENCES: '/api/users/preferences',
  
  // Health checks
  HEALTH_CHECK: '/api/health',
  HEALTH_DETAILED: '/api/health/detailed',
  
  // Webhooks
  WEBHOOKS: '/api/webhooks',
  WEBHOOK_BY_ID: '/api/webhooks/:id',
  
  // File uploads
  UPLOAD: '/api/upload',
  UPLOAD_AVATAR: '/api/upload/avatar',
  UPLOAD_LOGO: '/api/upload/logo',
} as const;

// External links
export const EXTERNAL_LINKS = {
  DOCUMENTATION: 'https://docs.recrutr.com',
  SUPPORT: 'https://support.recrutr.com',
  STATUS_PAGE: 'https://status.recrutr.com',
  GITHUB: 'https://github.com/recrutr',
  PRIVACY_POLICY: 'https://recrutr.com/privacy',
  TERMS_OF_SERVICE: 'https://recrutr.com/terms',
} as const;

// Route patterns for dynamic routing
export const ROUTE_PATTERNS = {
  DASHBOARD_CATCH_ALL: '/dashboard/[...slug]',
  TENANT_DYNAMIC: '/tenants/[id]',
  USER_DYNAMIC: '/users/[id]',
  API_TENANT_DYNAMIC: '/api/tenants/[id]',
  API_USER_DYNAMIC: '/api/users/[id]',
} as const;

// Route IDs for navigation matching
export const ROUTE_IDS = {
  // Main sections
  OVERVIEW: 'overview',
  TENANTS: 'tenants',
  USERS_ACCESS: 'users-access',
  BILLING: 'billing',
  INTEGRATIONS: 'integrations',
  HEALTH: 'health',
  SETTINGS: 'settings',
  
  // Subsections
  OVERVIEW_HOME: 'overview-home',
  COMMAND_CENTER: 'command-center',
  GLOBAL_SEARCH: 'global-search',
  
  TENANTS_ALL: 'tenants-all',
  TENANTS_ONBOARDING: 'tenants-onboarding',
  TENANTS_CREATE: 'tenants-create',
  TENANTS_IMPERSONATE: 'tenants-impersonate',
  
  PLATFORM_USERS: 'platform-users',
  ROLES_PERMS: 'roles-perms',
  SSO_PROVIDERS: 'sso-providers',
  API_KEYS: 'api-keys',
  
  PLANS_PRICING: 'plans-pricing',
  SUBSCRIPTIONS: 'subscriptions',
  INVOICES_TAXES: 'invoices-taxes',
  COUPONS: 'coupons',
  
  CATALOG_TEMPLATES: 'catalog-templates',
  PIPELINE_TEMPLATES: 'pipeline-templates',
  INTERVIEW_KITS: 'interview-kits',
  JOB_SCHEMA: 'job-schema',
  EMAIL_SMS_TEMPLATES: 'email-sms-templates',
  
  INTEGRATION_CATALOG: 'integration-catalog',
  PROVIDERS_CREDENTIALS: 'providers-credentials',
  
  ADOPTION_HEALTH: 'adoption-health',
  WEBHOOKS_HUB: 'webhooks-hub',
  PLATFORM_HEALTH: 'platform-health',
  SERVICE_HEALTH: 'service-health',
  QUEUES_JOBS: 'queues-jobs',
  RATE_LIMITS: 'rate-limits',
  
  OBSERVABILITY: 'observability',
  AUDIT_LOGS: 'audit-logs',
  ACTIVITY_STREAM: 'activity-stream',
  ERRORS_ALERTS: 'errors-alerts',
  PRIVACY_REQUESTS: 'privacy-requests',
  BACKUPS_RESTORE: 'backups-restore',
  
  EXPERIMENTS: 'experiments',
  FEATURE_FLAGS: 'feature-flags',
  AB_EXPERIMENTS: 'ab-experiments',
  
  OPS_SUPPORT: 'ops-support',
  SUPPORT_TICKETS: 'support-tickets',
  ANNOUNCEMENTS: 'announcements',
  STATUS_PAGE: 'status-page',
  
  GLOBAL_SETTINGS: 'global-settings',
  PLATFORM_SETTINGS: 'platform-settings',
  THEMING: 'theming',
  LOCALES: 'locales',
  
  // Utility routes
  HELP: 'help',
  LOGOUT: 'logout',
} as const;

// Utility functions for path operations
export const PathUtils = {
  /**
   * Check if a path is a dashboard route
   */
  isDashboardRoute(path: string): boolean {
    return path.startsWith(BASE_PATHS.DASHBOARD);
  },
  
  /**
   * Check if a path is an admin route
   */
  isAdminRoute(path: string): boolean {
    return path.startsWith(BASE_PATHS.ADMIN);
  },
  
  /**
   * Get the base section from a dashboard path
   */
  getDashboardSection(path: string): string | null {
    if (!this.isDashboardRoute(path)) return null;
    
    const segments = path.split('/').filter(Boolean);
    return segments[1] || null; // Return the segment after 'dashboard'
  },
  
  /**
   * Build a path with parameters
   */
  buildPath(template: string, params: Record<string, string>): string {
    let path = template;
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, value);
    });
    return path;
  },
  
  /**
   * Check if two paths match (considering exact vs startsWith matching)
   */
  pathsMatch(currentPath: string, targetPath: string, exact = false): boolean {
    if (exact) {
      return currentPath === targetPath;
    }
    return currentPath.startsWith(targetPath);
  },
} as const;

// Export all paths as a single object for convenience
export const PATHS = {
  BASE_PATHS,
  DASHBOARD_PATHS,
  DEMO_PATHS,
  API_PATHS,
  EXTERNAL_LINKS,
  ROUTE_PATTERNS,
  ROUTE_IDS,
} as const;

// Type exports for strict typing
export type BasePathKeys = keyof typeof BASE_PATHS;
export type DashboardPathKeys = keyof typeof DASHBOARD_PATHS;
export type DemoPathKeys = keyof typeof DEMO_PATHS;
export type ApiPathKeys = keyof typeof API_PATHS;
export type ExternalLinkKeys = keyof typeof EXTERNAL_LINKS;
export type RoutePatternKeys = keyof typeof ROUTE_PATTERNS;
export type RouteIdKeys = keyof typeof ROUTE_IDS;
