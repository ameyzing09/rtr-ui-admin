import { PERMISSIONS, can } from '@/lib/rbac/permissions';
import type { Permission } from '@/lib/rbac/permissions';

/**
 * Member Permission Constants
 */
export const MEMBER_PERMISSIONS = {
  LIST: PERMISSIONS.MEMBER_LIST,
  CREATE: PERMISSIONS.MEMBER_CREATE,
  READ: PERMISSIONS.MEMBER_READ,
  UPDATE: PERMISSIONS.MEMBER_UPDATE,
  DELETE: PERMISSIONS.MEMBER_DELETE,
  RESET_PASSWORD: PERMISSIONS.MEMBER_RESET_PASSWORD,
} as const;

/**
 * Check if user can list members
 */
export function canListMembers(userPermissions: Permission[]): boolean {
  return can(userPermissions, MEMBER_PERMISSIONS.LIST);
}

/**
 * Check if user can create members
 */
export function canCreateMember(userPermissions: Permission[]): boolean {
  return can(userPermissions, MEMBER_PERMISSIONS.CREATE);
}

/**
 * Check if user can update members
 */
export function canUpdateMember(userPermissions: Permission[]): boolean {
  return can(userPermissions, MEMBER_PERMISSIONS.UPDATE);
}

/**
 * Check if user can reset member passwords
 */
export function canResetMemberPassword(userPermissions: Permission[]): boolean {
  return can(userPermissions, MEMBER_PERMISSIONS.RESET_PASSWORD);
}
