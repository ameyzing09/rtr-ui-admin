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
  PERMISSIONS.TENANT_LIST,
  PERMISSIONS.TENANT_CREATE,
  PERMISSIONS.TENANT_READ,
  PERMISSIONS.TENANT_UPDATE,
  PERMISSIONS.TENANT_DELETE,
  PERMISSIONS.TENANT_IMPERSONATE,
  PERMISSIONS.TENANT_STATUS,
  PERMISSIONS.TENANT_SUBSCRIPTION_MANAGE,
  PERMISSIONS.SYS_USER_LIST,
  PERMISSIONS.SYS_USER_CREATE,
  PERMISSIONS.SYS_USER_UPDATE,
  PERMISSIONS.SYS_USER_DELETE,
  PERMISSIONS.SYS_HEALTH_READ,
  PERMISSIONS.ANALYTICS_READ,
  PERMISSIONS.SETTINGS_GLOBAL,
  PERMISSIONS.SETTINGS_SECURITY,
  PERMISSIONS.SETTINGS_DB,
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
// Permission Checking Functions
// ============================================================================

/**
 * Check if a user has a specific permission
 *
 * @param userPermissions - Array of permissions the user has
 * @param requiredPermission - The permission to check for
 * @returns true if user has the permission
 */
export function can(userPermissions: Permission[], requiredPermission: Permission): boolean {
  return userPermissions.includes(requiredPermission);
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
  return permission.startsWith('tenant:') ||
         permission.startsWith('sys:') ||
         permission === 'analytics:read' ||
         permission.startsWith('settings:');
}

/**
 * Check if a permission is a tenant permission
 *
 * @param permission - The permission to check
 * @returns true if it's a tenant permission
 */
export function isTenantPermission(permission: Permission): boolean {
  return permission.startsWith('job:') ||
         permission.startsWith('application:') ||
         permission.startsWith('pipeline:') ||
         permission.startsWith('member:') ||
         permission.startsWith('interview:') ||
         permission.startsWith('billing:') ||
         permission.startsWith('integrations:') ||
         (permission.startsWith('settings:') && permission !== 'settings:global' && permission !== 'settings:security' && permission !== 'settings:db');
}
