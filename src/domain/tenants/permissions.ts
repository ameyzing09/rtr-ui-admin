/**
 * Tenant-related permissions
 *
 * These are the permission strings required for various tenant operations.
 * They should match the Permission type defined in lib/rbac/permissions.ts
 */

export const TENANT_PERMISSIONS = {
  // View permissions
  LIST: 'tenant:list',
  VIEW: 'tenant:view',

  // Modify permissions
  CREATE: 'tenant:create',
  UPDATE: 'tenant:update',
  DELETE: 'tenant:delete',

  // Operational permissions
  RETRY: 'tenant:retry',

  // Subscription management
  MANAGE_SUBSCRIPTION: 'tenant:subscription:manage',
} as const;

export type TenantPermission = typeof TENANT_PERMISSIONS[keyof typeof TENANT_PERMISSIONS];
