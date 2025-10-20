import type { Permission } from '@/lib/rbac/permissions';
import { can, PERMISSIONS } from '@/lib/rbac/permissions';

/**
 * User Management Permissions
 *
 * These functions check if a user has the required permissions
 * to perform user management operations.
 */

/**
 * Check if user can manage all users (platform-level)
 * Requires PLATFORM_USERS_MANAGE permission
 */
export function canManageUsers(permissions: Permission[]): boolean {
  return can(permissions, PERMISSIONS.PLATFORM_USERS_MANAGE);
}

/**
 * Check if user can list users
 * Requires SYS_USER_LIST permission
 */
export function canListUsers(permissions: Permission[]): boolean {
  return can(permissions, PERMISSIONS.SYS_USER_LIST);
}

/**
 * Check if user can read user details
 * Requires SYS_USER_LIST permission (viewing details is part of listing)
 */
export function canReadUser(permissions: Permission[]): boolean {
  return can(permissions, PERMISSIONS.SYS_USER_LIST);
}

/**
 * Check if user can reset passwords
 * Requires both PLATFORM_USERS_MANAGE permission
 */
export function canResetPassword(permissions: Permission[]): boolean {
  return can(permissions, PERMISSIONS.PLATFORM_USERS_MANAGE);
}

/**
 * Check if user can manage members in their tenant
 * Requires MEMBER_UPDATE permission
 */
export function canManageTenantMembers(permissions: Permission[]): boolean {
  return can(permissions, PERMISSIONS.MEMBER_UPDATE);
}

/**
 * Check if user can invite members
 * Requires MEMBER_CREATE permission
 */
export function canInviteMembers(permissions: Permission[]): boolean {
  return can(permissions, PERMISSIONS.MEMBER_CREATE);
}

/**
 * Check if user can remove members
 * Requires MEMBER_DELETE permission
 */
export function canRemoveMembers(permissions: Permission[]): boolean {
  return can(permissions, PERMISSIONS.MEMBER_DELETE);
}
