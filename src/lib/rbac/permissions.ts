/**
 * RBAC Permission System
 *
 * Single source of truth for all permissions in the application.
 * Backend must issue these permissions in JWT or via /me/permissions.
 * Frontend never hardcodes role logic—only checks can(permission).
 */

// ============================================================================
// Permission Definitions (Namespace Structure)
// ============================================================================

/**
 * Platform (Control Plane) Permissions
 * Used by superadmins to manage the platform itself
 */
export const PLATFORM_PERMISSIONS = {
  // Platform Overview & Operations
  PLATFORM_OVERVIEW_VIEW: 'platform:overview:view',
  PLATFORM_OPS_VIEW: 'platform:ops:view',
  PLATFORM_SETTINGS_MANAGE: 'platform:settings:manage',
  PLATFORM_TENANTS_MANAGE: 'platform:tenants:manage',
  PLATFORM_USERS_MANAGE: 'platform:users:manage',
  PLATFORM_HEALTH_VIEW: 'platform:health:view',
  PLATFORM_OBSERVABILITY_VIEW: 'platform:observability:view',
  PLATFORM_EXPERIMENTS_VIEW: 'platform:experiments:view',
  PLATFORM_CATALOG_MANAGE: 'platform:catalog:manage',

  // Tenant Management
  TENANT_LIST: 'tenant:list',
  TENANT_CREATE: 'tenant:create',
  TENANT_READ: 'tenant:read',
  TENANT_UPDATE: 'tenant:update',
  TENANT_DELETE: 'tenant:delete',
  TENANT_IMPERSONATE: 'tenant:impersonate',
  TENANT_STATUS: 'tenant:status',
  TENANT_SUBSCRIPTION_MANAGE: 'tenant:subscription:manage',

  // System Management
  SYS_USER_LIST: 'sys:user:list',
  SYS_USER_CREATE: 'sys:user:create',
  SYS_USER_UPDATE: 'sys:user:update',
  SYS_USER_DELETE: 'sys:user:delete',
  SYS_HEALTH_READ: 'sys:health:read',

  // Analytics
  ANALYTICS_READ: 'analytics:read',

  // Settings
  SETTINGS_GLOBAL: 'settings:global',
  SETTINGS_SECURITY: 'settings:security',
  SETTINGS_DB: 'settings:db',

  // Catalog (Global Plans/Entitlements/Features)
  CATALOG_LIST: 'catalog:list',
  CATALOG_CREATE: 'catalog:create',
  CATALOG_READ: 'catalog:read',
  CATALOG_UPDATE: 'catalog:update',
  CATALOG_DELETE: 'catalog:delete',

  // Platform Billing (Subscription Engine)
  PLATFORM_BILLING_READ: 'platform:billing:read',
  PLATFORM_BILLING_MANAGE: 'platform:billing:manage',

  // Platform Integrations
  PLATFORM_INTEGRATIONS_LIST: 'platform:integrations:list',
  PLATFORM_INTEGRATIONS_MANAGE: 'platform:integrations:manage',

  // Observability (Logs, Traces, Metrics)
  OBSERVABILITY_READ: 'observability:read',
  OBSERVABILITY_LOGS: 'observability:logs',
  OBSERVABILITY_TRACES: 'observability:traces',
  OBSERVABILITY_METRICS: 'observability:metrics',

  // Experiments (Feature Flags/Rollouts)
  EXPERIMENTS_LIST: 'experiments:list',
  EXPERIMENTS_CREATE: 'experiments:create',
  EXPERIMENTS_UPDATE: 'experiments:update',
  EXPERIMENTS_DELETE: 'experiments:delete',

  // Ops Support
  OPS_SUPPORT_READ: 'ops:support:read',
  OPS_SUPPORT_IMPERSONATE: 'ops:support:impersonate',
} as const;

/**
 * Tenant (Company Scope) Permissions
 * Used by tenant users to manage their own tenant
 */
export const TENANT_PERMISSIONS = {
  // Analytics
  ANALYTICS_READ: 'analytics:read',

  // Jobs
  JOB_LIST: 'job:list',
  JOB_CREATE: 'job:create',
  JOB_READ: 'job:read',
  JOB_UPDATE: 'job:update',
  JOB_DELETE: 'job:delete',

  // Applications
  APPLICATION_LIST: 'application:list',
  APPLICATION_CREATE: 'application:create',
  APPLICATION_READ: 'application:read',
  APPLICATION_UPDATE: 'application:update',
  APPLICATION_DELETE: 'application:delete',

  // Pipeline
  PIPELINE_LIST: 'pipeline:list',
  PIPELINE_CREATE: 'pipeline:create',
  PIPELINE_READ: 'pipeline:read',
  PIPELINE_UPDATE: 'pipeline:update',
  PIPELINE_DELETE: 'pipeline:delete',

  // Members
  MEMBER_LIST: 'member:list',
  MEMBER_CREATE: 'member:create',
  MEMBER_READ: 'member:read',
  MEMBER_UPDATE: 'member:update',
  MEMBER_DELETE: 'member:delete',

  // Interviews
  INTERVIEW_LIST: 'interview:list',
  INTERVIEW_CREATE: 'interview:create',
  INTERVIEW_READ: 'interview:read',
  INTERVIEW_UPDATE: 'interview:update',
  INTERVIEW_DELETE: 'interview:delete',

  // Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',

  // Billing
  BILLING_READ: 'billing:read',
  BILLING_UPDATE: 'billing:update',

  // Integrations
  INTEGRATIONS_READ: 'integrations:read',
  INTEGRATIONS_UPDATE: 'integrations:update',

  // Feedback & Scores
  FEEDBACK_LIST: 'feedback:list',
  FEEDBACK_CREATE: 'feedback:create',
  FEEDBACK_READ: 'feedback:read',
  FEEDBACK_UPDATE: 'feedback:update',
  FEEDBACK_DELETE: 'feedback:delete',
} as const;

// All permissions combined
export const PERMISSIONS = {
  ...PLATFORM_PERMISSIONS,
  ...TENANT_PERMISSIONS,
} as const;

// Permission type
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// ============================================================================
// Role Definitions (Permission Bundles)
// ============================================================================

/**
 * SUPERADMIN Role
 * Has all platform permissions, no tenant permissions by default
 */
export const SUPERADMIN_PERMISSIONS: Permission[] = [
  // Platform Overview & Operations
  PERMISSIONS.PLATFORM_OVERVIEW_VIEW,
  PERMISSIONS.PLATFORM_OPS_VIEW,
  PERMISSIONS.PLATFORM_SETTINGS_MANAGE,
  PERMISSIONS.PLATFORM_TENANTS_MANAGE,
  PERMISSIONS.PLATFORM_USERS_MANAGE,
  PERMISSIONS.PLATFORM_HEALTH_VIEW,
  PERMISSIONS.PLATFORM_OBSERVABILITY_VIEW,
  PERMISSIONS.PLATFORM_EXPERIMENTS_VIEW,
  PERMISSIONS.PLATFORM_CATALOG_MANAGE,

  // Tenant Management
  PERMISSIONS.TENANT_LIST,
  PERMISSIONS.TENANT_CREATE,
  PERMISSIONS.TENANT_READ,
  PERMISSIONS.TENANT_UPDATE,
  PERMISSIONS.TENANT_DELETE,
  PERMISSIONS.TENANT_IMPERSONATE,
  PERMISSIONS.TENANT_STATUS,
  PERMISSIONS.TENANT_SUBSCRIPTION_MANAGE,

  // System Management
  PERMISSIONS.SYS_USER_LIST,
  PERMISSIONS.SYS_USER_CREATE,
  PERMISSIONS.SYS_USER_UPDATE,
  PERMISSIONS.SYS_USER_DELETE,
  PERMISSIONS.SYS_HEALTH_READ,

  // Analytics
  PERMISSIONS.ANALYTICS_READ,

  // Settings
  PERMISSIONS.SETTINGS_GLOBAL,
  PERMISSIONS.SETTINGS_SECURITY,
  PERMISSIONS.SETTINGS_DB,

  // Catalog
  PERMISSIONS.CATALOG_LIST,
  PERMISSIONS.CATALOG_CREATE,
  PERMISSIONS.CATALOG_READ,
  PERMISSIONS.CATALOG_UPDATE,
  PERMISSIONS.CATALOG_DELETE,

  // Platform Billing
  PERMISSIONS.PLATFORM_BILLING_READ,
  PERMISSIONS.PLATFORM_BILLING_MANAGE,

  // Platform Integrations
  PERMISSIONS.PLATFORM_INTEGRATIONS_LIST,
  PERMISSIONS.PLATFORM_INTEGRATIONS_MANAGE,

  // Observability
  PERMISSIONS.OBSERVABILITY_READ,
  PERMISSIONS.OBSERVABILITY_LOGS,
  PERMISSIONS.OBSERVABILITY_TRACES,
  PERMISSIONS.OBSERVABILITY_METRICS,

  // Experiments
  PERMISSIONS.EXPERIMENTS_LIST,
  PERMISSIONS.EXPERIMENTS_CREATE,
  PERMISSIONS.EXPERIMENTS_UPDATE,
  PERMISSIONS.EXPERIMENTS_DELETE,

  // Ops Support
  PERMISSIONS.OPS_SUPPORT_READ,
  PERMISSIONS.OPS_SUPPORT_IMPERSONATE,
];

/**
 * TENANT_ADMIN Role
 * Has all tenant-scoped permissions
 */
export const TENANT_ADMIN_PERMISSIONS: Permission[] = [
  // Analytics
  TENANT_PERMISSIONS.ANALYTICS_READ,

  // Jobs - all operations
  TENANT_PERMISSIONS.JOB_LIST,
  TENANT_PERMISSIONS.JOB_CREATE,
  TENANT_PERMISSIONS.JOB_READ,
  TENANT_PERMISSIONS.JOB_UPDATE,
  TENANT_PERMISSIONS.JOB_DELETE,

  // Applications - all operations
  TENANT_PERMISSIONS.APPLICATION_LIST,
  TENANT_PERMISSIONS.APPLICATION_CREATE,
  TENANT_PERMISSIONS.APPLICATION_READ,
  TENANT_PERMISSIONS.APPLICATION_UPDATE,
  TENANT_PERMISSIONS.APPLICATION_DELETE,

  // Pipeline - all operations
  TENANT_PERMISSIONS.PIPELINE_LIST,
  TENANT_PERMISSIONS.PIPELINE_CREATE,
  TENANT_PERMISSIONS.PIPELINE_READ,
  TENANT_PERMISSIONS.PIPELINE_UPDATE,
  TENANT_PERMISSIONS.PIPELINE_DELETE,

  // Members - all operations
  TENANT_PERMISSIONS.MEMBER_LIST,
  TENANT_PERMISSIONS.MEMBER_CREATE,
  TENANT_PERMISSIONS.MEMBER_READ,
  TENANT_PERMISSIONS.MEMBER_UPDATE,
  TENANT_PERMISSIONS.MEMBER_DELETE,

  // Interviews - all operations
  TENANT_PERMISSIONS.INTERVIEW_LIST,
  TENANT_PERMISSIONS.INTERVIEW_CREATE,
  TENANT_PERMISSIONS.INTERVIEW_READ,
  TENANT_PERMISSIONS.INTERVIEW_UPDATE,
  TENANT_PERMISSIONS.INTERVIEW_DELETE,

  // Settings
  TENANT_PERMISSIONS.SETTINGS_READ,
  TENANT_PERMISSIONS.SETTINGS_UPDATE,

  // Billing
  TENANT_PERMISSIONS.BILLING_READ,
  TENANT_PERMISSIONS.BILLING_UPDATE,

  // Integrations
  TENANT_PERMISSIONS.INTEGRATIONS_READ,
  TENANT_PERMISSIONS.INTEGRATIONS_UPDATE,

  // Feedback & Scores
  TENANT_PERMISSIONS.FEEDBACK_LIST,
  TENANT_PERMISSIONS.FEEDBACK_CREATE,
  TENANT_PERMISSIONS.FEEDBACK_READ,
  TENANT_PERMISSIONS.FEEDBACK_UPDATE,
  TENANT_PERMISSIONS.FEEDBACK_DELETE,
];

/**
 * HR Role
 * Can manage jobs, applications, pipeline, and members
 */
export const HR_PERMISSIONS: Permission[] = [
  TENANT_PERMISSIONS.JOB_LIST,
  TENANT_PERMISSIONS.JOB_CREATE,
  TENANT_PERMISSIONS.JOB_READ,
  TENANT_PERMISSIONS.JOB_UPDATE,
  TENANT_PERMISSIONS.JOB_DELETE,

  TENANT_PERMISSIONS.APPLICATION_LIST,
  TENANT_PERMISSIONS.APPLICATION_CREATE,
  TENANT_PERMISSIONS.APPLICATION_READ,
  TENANT_PERMISSIONS.APPLICATION_UPDATE,
  TENANT_PERMISSIONS.APPLICATION_DELETE,

  TENANT_PERMISSIONS.PIPELINE_LIST,
  TENANT_PERMISSIONS.PIPELINE_CREATE,
  TENANT_PERMISSIONS.PIPELINE_READ,
  TENANT_PERMISSIONS.PIPELINE_UPDATE,
  TENANT_PERMISSIONS.PIPELINE_DELETE,

  TENANT_PERMISSIONS.MEMBER_LIST,
  TENANT_PERMISSIONS.MEMBER_CREATE,
  TENANT_PERMISSIONS.MEMBER_READ,
  TENANT_PERMISSIONS.MEMBER_UPDATE,
  TENANT_PERMISSIONS.MEMBER_DELETE,
];

/**
 * INTERVIEWER Role
 * Can manage interviews and view applications
 */
export const INTERVIEWER_PERMISSIONS: Permission[] = [
  TENANT_PERMISSIONS.INTERVIEW_LIST,
  TENANT_PERMISSIONS.INTERVIEW_CREATE,
  TENANT_PERMISSIONS.INTERVIEW_READ,
  TENANT_PERMISSIONS.INTERVIEW_UPDATE,
  TENANT_PERMISSIONS.INTERVIEW_DELETE,

  TENANT_PERMISSIONS.APPLICATION_READ,
];

/**
 * VIEWER/CANDIDATE Role
 * Can view analytics and applications only
 */
export const VIEWER_PERMISSIONS: Permission[] = [
  TENANT_PERMISSIONS.ANALYTICS_READ,
  TENANT_PERMISSIONS.APPLICATION_READ,
];

/**
 * Map of role names to their permission bundles
 * This is used for backward compatibility with existing role-based code
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPERADMIN: SUPERADMIN_PERMISSIONS,
  ADMIN: TENANT_ADMIN_PERMISSIONS,
  HR: HR_PERMISSIONS,
  INTERVIEWER: INTERVIEWER_PERMISSIONS,
  CANDIDATE: VIEWER_PERMISSIONS,
  VIEWER: VIEWER_PERMISSIONS,
};

// ============================================================================
// Permission Classification
// ============================================================================

/**
 * Platform-level settings permissions
 * These are used by superadmins to manage platform-wide settings
 */
const PLATFORM_SETTINGS: Permission[] = [
  PERMISSIONS.SETTINGS_GLOBAL,
  PERMISSIONS.SETTINGS_SECURITY,
  PERMISSIONS.SETTINGS_DB,
];

/**
 * Tenant-level settings permissions
 * These are used by tenant admins to manage their own tenant settings
 */
const TENANT_SETTINGS: Permission[] = [
  TENANT_PERMISSIONS.SETTINGS_READ,
  TENANT_PERMISSIONS.SETTINGS_UPDATE,
];

// ============================================================================
// Permission Checking Functions
// ============================================================================

/**
 * Check if a user has a specific permission
 *
 * Supports wildcard permissions:
 * - If user has "settings:*", they have "settings:read", "settings:update", etc.
 * - If user has "job:*", they have "job:list", "job:create", etc.
 *
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermission - The permission to check for
 * @returns true if user has the permission
 *
 * @example
 * can(['settings:*'], 'settings:read') // true
 * can(['settings:read'], 'settings:update') // false
 * can(['job:*'], 'job:create') // true
 */
export function can(userPermissions: Permission[], requiredPermission: Permission): boolean {
  // Direct match - exact permission found
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Wildcard match - check if user has namespace:* permission
  // Extract namespace from required permission (e.g., "settings:read" → "settings")
  const colonIndex = requiredPermission.indexOf(':');
  if (colonIndex !== -1) {
    const namespace = requiredPermission.substring(0, colonIndex);
    const wildcardPermission = `${namespace}:*` as Permission;

    if (userPermissions.includes(wildcardPermission)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a user has ALL of the specified permissions
 *
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Array of permissions required
 * @returns true if user has all required permissions
 */
export function canAll(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

/**
 * Check if a user has ANY of the specified permissions
 *
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermissions - Array of permissions to check
 * @returns true if user has at least one of the required permissions
 */
export function canAny(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

/**
 * Get permissions for a specific role
 * Used for backward compatibility and testing
 *
 * @param role - The role name
 * @returns Array of permissions for that role
 */
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a permission is a platform permission
 *
 * @param permission - The permission to check
 * @returns true if it's a platform permission
 */
export function isPlatformPermission(permission: Permission): boolean {
  // Handle settings permissions explicitly
  if (permission.startsWith('settings:')) {
    return PLATFORM_SETTINGS.includes(permission);
  }

  return permission.startsWith('platform:') ||
         permission.startsWith('tenant:') ||
         permission.startsWith('sys:') ||
         permission === 'analytics:read';
}

/**
 * Check if a permission is a tenant permission
 *
 * @param permission - The permission to check
 * @returns true if it's a tenant permission
 */
export function isTenantPermission(permission: Permission): boolean {
  // Handle settings permissions explicitly
  if (permission.startsWith('settings:')) {
    return TENANT_SETTINGS.includes(permission);
  }

  return permission.startsWith('job:') ||
         permission.startsWith('application:') ||
         permission.startsWith('pipeline:') ||
         permission.startsWith('member:') ||
         permission.startsWith('interview:') ||
         permission.startsWith('billing:') ||
         permission.startsWith('integrations:');
}
